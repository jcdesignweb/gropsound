export class AudioFile {
    private seconds: number
    private name: string
    private filePath: string
    private fileContent: string

    constructor({seconds, name, filePath, fileContent}: {seconds: number, name: string, filePath: string, fileContent: string}) {
        this.seconds = seconds
        this.name = name
        this.fileContent = fileContent
        this.filePath = filePath
    }

    getSeconds() { return this.seconds }
    getName() { return this.name }
    getFileContent() { return this.fileContent }
    getFilePath() { return this.filePath }
}

