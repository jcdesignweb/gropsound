export interface ElectronAPI {
  saveFile: (
    filePath: string,
    fileContent: string,
  ) => Promise<{ isSuccess: boolean; path: string; basePath: string }>;
  cropAudio: (
    basePath: string,
    inputFile: string,
    fileExtension: string,
    startTime: number,
    duration: number,
  ) => Promise<boolean>;
  selectFolder: () => Promise<string>;
  selectFile: () => Promise<{ filePath: string; fileContent: string }>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
