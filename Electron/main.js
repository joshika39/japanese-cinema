const {app, BrowserWindow} = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 550
        // webPreferences: {nodeIntegration: true, contextIsolation: false}
    });
    mainWindow.removeMenu();
    mainWindow.maximize();
    mainWindow.setFullScreen(true);
    // mainWindow.webContents.openDevTools();
    mainWindow.loadFile('public/index.html');

}

const videoFolder = './public/assets/video/';
const thumbnailFolder = './public/assets/thumbnail/';
const backgroundFolder = './public/assets/background/';
let outputV = [];
let outputT = [];
let outputB = [];


fs.readdirSync(videoFolder).forEach(file => {
    if(path.extname(file) === ".mp4")
        outputV.push(file);
});

fs.readdirSync(thumbnailFolder).forEach(file => {
    if(path.extname(file) === ".jpg")
        outputT.push(file);
});

fs.readdirSync(backgroundFolder).forEach(file => {
    if(path.extname(file) === ".jpg")
        outputB.push(file);
});
let stream = fs.createWriteStream('./public/files.js');
stream.once('open', function(fd) {
    stream.write(`
export function videos() {
    return ${JSON.stringify(outputV)};
}
export function thumbnails() {
    return ${JSON.stringify(outputT)};
}
export function panoramas() {
    return ${JSON.stringify(outputB)};
}
`);
    stream.end();
});

console.log(JSON.stringify(outputV));
console.log(JSON.stringify(outputT));
console.log(JSON.stringify(outputB));

app.on('ready', createWindow);
