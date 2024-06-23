

export class Cropper {
    private inputFile : string

    constructor(filepath: string) {

        this.inputFile = filepath

        
        console.log("InputFile2", this.inputFile)
    }

    // Función para cortar el archivo de música
    public async cutAudio(basePath: string, startTime: number, duration: number, fileExtension: string) {

        const out = basePath + '/new.mp4'

        console.log("basePath ---------- ", basePath)


        const cut = await window.electron.cropAudio(basePath, this.inputFile, fileExtension, startTime, duration);
        console.log("Cut Result", cut)
           
    }
  

}