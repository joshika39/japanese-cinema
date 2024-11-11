const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
app.use(express.static(path.join(__dirname, '/public')));



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

console.log(JSON.stringify(outputV));
console.log(JSON.stringify(outputT));
console.log(JSON.stringify(outputB));


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



// app.use('/build/', express.static(path.join(__dirname, './node_modules/three/build')));
// app.use('/jsm/', express.static(path.join(__dirname, './node_modules/three/examples/jsm')));

app.listen(3000, () =>
console.log('http://127.0.0.1:3000')
);

