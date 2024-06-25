export class Cropper {
  private inputFile: string;

  constructor(filepath: string) {
    this.inputFile = filepath;
  }

  // Función para cortar el archivo de música
  public async cutAudio(
    basePath: string,
    startTime: number,
    duration: number,
    fileExtension: string,
  ) {
    
    const result = await window.electron.cropAudio(
      basePath,
      this.inputFile,
      fileExtension,
      startTime,
      duration,
    );

    return result
  }
}
