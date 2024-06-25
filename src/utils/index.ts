import os from 'os'

export const isWindowsOs = () => {
  console.log(os.platform());
  return os.platform() === 'win32';
};

export function secondsToMmSs(s: number) {
  const minutes = Math.floor(s / 60);
  const seconds = Math.floor(s - minutes * 60);

  const _minutes = minutes < 10 ? '0' + minutes : minutes;
  const _seconds = seconds < 10 ? '0' + seconds : seconds;

  return `${_minutes}:${_seconds}`;
}
