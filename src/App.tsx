import React, { useEffect, useRef, useState } from 'react';

import 'material-icons/iconfont/material-icons.css';
import 'materialize-css/dist/css/materialize.min.css';
import M from 'materialize-css/dist/js/materialize.min.js';

import '/public/css/styles.css';

import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import { Cropper } from './lib/Cropper';
import { AudioFile } from './domain/AudioFile';
import { secondsToMmSs } from './utils';

function calculatePoints(points: string[]): {
  startAtSecond: number;
  finishAtSecond: number;
} {
  const startAtSecond = parseInt(points[0]);
  const finishAtSecond = parseInt(points[1]) - startAtSecond;

  return {
    startAtSecond,
    finishAtSecond,
  };
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
        {
          to: function (value) {
            return secondsToMmSs(value);
          },
        },
        {
          to: function (value) {
            return secondsToMmSs(value);
          },
        },
      ],
      connect: true,
      range: {
        min: 0,
        max: audioFile.getSeconds(),
      },
    });
  }
}

function str2Blob(fileContent: string) {
  const byteCharacters = atob(fileContent);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/octet-stream' });
  return blob;
}

function getTotalSecondsFromAudio(selectedFile: any): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(selectedFile);
    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration) {
        resolve(parseInt(audio.duration.toString()));
      }
    });
  });
}

export const App = () => {
  //const [file, setFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [selectedFolder, setSelectedFolder] = React.useState<string | null>(
    null
  );

  const handleSelectFolder = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    const folder = await window.electron.selectFolder();
    setSelectedFolder(folder);
  };

  const handleSelectFile = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    const { filePath, fileContent } = await window.electron.selectFile();

    // seconds
    let duration = 0;
    try {
      duration = await getTotalSecondsFromAudio(filePath);
      console.log('DURATION', duration);
    } catch (error: unknown) {
      console.error(error);
      throw new Error('Error trying to get duration');
    }

    const name = filePath.split('/').pop()!;

    const audio = new AudioFile({
      name,
      seconds: duration,
      fileContent,
      filePath,
    });
    setAudioFile(audio);
  };

  useEffect(() => {
    if (audioFile) {
      loadSlider(sliderRef.current, audioFile);
    }
  }, [audioFile]);

  useEffect(() => {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems, {});

    if (audioFile) {
      loadSlider(sliderRef.current, audioFile);
    }

    return () => {
      if (sliderRef.current && (sliderRef.current as any).noUiSlider) {
        (sliderRef.current as any).noUiSlider.destroy();
      }
    };
  }, []);

  const handleUpload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const { startAtSecond, finishAtSecond } = calculatePoints(
      (sliderRef.current as any).noUiSlider.get()
    );

    if (!selectedFolder) {
      throw new Error('selectedFolder cannot be null');
    }

    if (audioFile) {
      const reader = new FileReader();

      reader.onload = async (e: any) => {
        const content = e.target.result;
        try {
          const fileExtension = audioFile
            .getName()
            .split('.')
            .pop()
            ?.toLowerCase();
          console.log('FileExtension', fileExtension);

          const cropper = new Cropper(audioFile.getFilePath());
          const crop = await cropper.cutAudio(
            selectedFolder,
            startAtSecond,
            finishAtSecond,
            fileExtension!
          );
          console.log('Crop result', crop);
        } catch (error) {
          console.error('Error saving file:', error);
        }
      };
      reader.readAsArrayBuffer(str2Blob(audioFile.getFileContent()));
    }
  };

  return (
    <>
      <header>
        <nav>
          <ul id="slide-out" className="sidenav">
            <li></li>
          </ul>
          <a href="#" data-target="slide-out" className="sidenav-trigger">
            <i className="material-icons">menu</i>
          </a>

          <div className="nav-wrapper black">
            <img
              className="brand-logo"
              src={'public/img/gropsound-ic.png'}
              width="50"
            />
            <ul id="nav-mobile" className="right hide-on-med-and-down"></ul>
          </div>
        </nav>
      </header>

      <div className="container">
        <form action="#">
          <div className="file-field input-field">
            <br />
            <button onClick={handleSelectFile} className="btn">
              Seleccionar Audio
            </button>
            <br />
            <br /> <br />
            <div className="">
              {audioFile && (
                <div>
                  <table border={0}>
                    <tr>
                      <td>Nombre de archivo:</td>
                      <td>
                        <span>
                          <b>{audioFile.getName()}</b>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Ruta de archivo:</td>
                      <td>
                        <span>
                          <b>{audioFile.getFilePath()}</b>
                        </span>
                      </td>
                    </tr>

                    {selectedFolder && (
                      <tr>
                        <td>Ruta destino del archivo:</td>
                        <td>
                          <span>
                            <b>{selectedFolder}</b>
                          </span>
                        </td>
                      </tr>
                    )}
                  </table>
                </div>
              )}
            </div>
          </div>

          <br />
          <br />
          <br />

          {audioFile && (
            <div>
              <div className="file-field input-field">
                <div id="test-slider" ref={sliderRef}></div>
              </div>

              <div className="file-field input-field">
                <button className="btn" onClick={handleSelectFolder}>
                  Seleccionar Carpeta
                </button>
              </div>

              {selectedFolder && (
                <div>
                  <br />
                  <br />

                  <div className="file-field input-field">
                    <button className="btn indigo" onClick={handleUpload}>
                      Upload
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </>
  );
};
