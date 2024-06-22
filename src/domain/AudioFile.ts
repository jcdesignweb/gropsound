export class AudioFile {
    private seconds: number
    private name: string

    constructor({seconds, name}: {seconds: number, name: string}) {
        this.seconds = seconds
        this.name = name
    }

    getSeconds() { return this.seconds }
    getName() { return this.name }
}
