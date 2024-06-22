import React, { useEffect, useRef, useState } from 'react';
import 'materialize-css/dist/css/materialize.min.css';

import M from 'materialize-css/dist/js/materialize.min.js';


import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import { Cropper } from './lib/Cropper';
import { AudioFile } from './domain/AudioFile';


function calculatePoints(points: string[]): {startAtSecond: number, finishAtSecond: number} {

	const startAtSecond = parseInt(points[0])
	const finishAtSecond = parseInt(points[1])

	const seconds = finishAtSecond - startAtSecond
	console.log("Finish total seconds", seconds)
	return {
		startAtSecond,
		finishAtSecond: seconds
	}
}

function secondsToMmSs(s: number) {
	const minutes = Math.floor(s / 60);
	const seconds = Math.floor(s - minutes * 60);
	
	return `${minutes}:${seconds}`
}

function loadSlider(sliderRef: any, audioFile: AudioFile) {

	const slider = document.getElementById('test-slider');
	if (slider) {

		if (sliderRef.noUiSlider) {
			sliderRef.noUiSlider.destroy();
		}

		noUiSlider.create(sliderRef, {
			start: [0, audioFile.getSeconds()],
			tooltips: [
				{ to: function(value) { return secondsToMmSs(value); } },
				{ to: function(value) { return secondsToMmSs(value); } },
			],
			connect: true,
			range: {
				'min': 0,
				'max': audioFile.getSeconds()
			}
		});


		
		
	}


	
}

function getTotalSecondsFromAudio(selectedFile: any): Promise<number> {
	return new Promise((resolve, reject) => {
		const audio = new Audio(URL.createObjectURL(selectedFile));
		audio.addEventListener('loadedmetadata', () => {
			if (audio.duration) {
				resolve(parseInt(audio.duration.toString()))
			}

		});
	})

}

export const App = () => {

	const [file, setFile] = useState<File | null>(null);
	const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
	const sliderRef = useRef<HTMLDivElement>(null);
	const [selectedFolder, setSelectedFolder] = React.useState<string | null>(null);

	const handleSelectFolder = async (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();

		const folder = await window.electron.selectFolder();
		setSelectedFolder(folder);
	};


	async function handleFileChange(event: any) {

		const { name } = event.target.files[0]

		// seconds
		let duration = 0
		try {
			duration = await getTotalSecondsFromAudio(event.target.files[0])
		} catch (error: unknown) {
			console.error(error)
			throw new Error('Error trying to get duration')
		}

		const audio = new AudioFile({ name, seconds: duration })
		setAudioFile(audio)
		setFile(event.target.files[0])

	}

	useEffect(() => {
		if (audioFile) {
			loadSlider(sliderRef.current, audioFile)
		}

	}, [file]);

	useEffect(() => {


		var elems = document.querySelectorAll('.sidenav');
		var instances = M.Sidenav.init(elems, {});
		
		if (audioFile) {
			loadSlider(sliderRef.current, audioFile)
		}

		return () => {
			if (sliderRef.current && (sliderRef.current as any).noUiSlider) {
				(sliderRef.current as any).noUiSlider.destroy();
			}
		};
	}, []);

	const handleUpload = async (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();

		if (sliderRef) {
			console.log("UI SLIDER", ((sliderRef.current as any).noUiSlider).get())
		}

		const {startAtSecond, finishAtSecond} = calculatePoints(((sliderRef.current as any).noUiSlider).get())

		if (!selectedFolder) {
			throw new Error("selectedFolder cannot be null")
		}

		if (file) {

			const reader = new FileReader();

			reader.onload = async (e: any) => {
				const content = e.target.result;
				try {

					const { isSuccess, basePath, path } = await window.electron.saveFile(file.name, content);
					console.log("IsSaved->isSuccess", isSuccess);
					if (isSuccess) {

						const fileExtension = file.name.split('.').pop()?.toLowerCase();
						console.log("FileExtension", fileExtension)

						const cropper = new Cropper(path)
						cropper.cutAudio(selectedFolder, startAtSecond, finishAtSecond, fileExtension!)
					}


				} catch (error) {
					console.error('Error saving file:', error);
				}
			};
			reader.readAsArrayBuffer(file);
		}

	};


	return <>
		<header>
			<nav>
				<ul id="slide-out" className="sidenav">
					<li></li>
				</ul>
				<a href="#" data-target="slide-out" className="sidenav-trigger"><i className="material-icons">menu</i></a>

				<div className="nav-wrapper black">
					<a href="#" className="brand-logo">Logo</a>
					<ul id="nav-mobile" className="right hide-on-med-and-down">
						<li><a href="sass.html">Sass</a></li>
						<li><a href="badges.html">Components</a></li>
						<li><a href="collapsible.html">JavaScript</a></li>
					</ul>
				</div>
			</nav>
		</header>

		<div className='container'>
			<form action="#">
				<div className="file-field input-field">
					<div className="btn">
						<span>ARCHIVO</span>
						<input type="file" onChange={handleFileChange} />
					</div>
					<div className="file-path-wrapper">
						<input className="file-path validate" type="text" />
					</div>
				</div>

				<br /><br /><br />

				{file && (
					<div>

					<div className="file-field input-field">
						<div id="test-slider" ref={sliderRef} ></div>

					</div>

					<div className="file-field input-field">
						<button onClick={handleSelectFolder}>Seleccionar Carpeta</button>
						{selectedFolder && <p>Carpeta seleccionada: {selectedFolder}</p>}

					</div>


					{selectedFolder && 
					<div>

						<br /><br />

						<div className="file-field input-field">
							<button className='btn indigo' onClick={handleUpload}>Upload</button>
						</div>
					</div>
					}
					
					</div>



				)}

				


			</form>
		</div>
	</>
};



