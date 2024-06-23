const os = require('os');

export const isWindowsOs = () => {
    console.log(os.platform());
    return (os.platform() === 'win32') 
    

}