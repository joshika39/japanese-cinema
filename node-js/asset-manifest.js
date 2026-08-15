const fs = require("fs");
const path = require("path");

const PUBLIC_DIRECTORY = path.join(__dirname, "public");

function listAssetFiles(directory, extension) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() && path.extname(entry.name).toLowerCase() === extension,
    )
    .map((entry) => entry.name)
    .sort();
}

function readAssetManifest(publicDirectory = PUBLIC_DIRECTORY) {
  const assetsDirectory = path.join(publicDirectory, "assets");

  return {
    videos: listAssetFiles(path.join(assetsDirectory, "video"), ".mp4"),
    thumbnails: listAssetFiles(
      path.join(assetsDirectory, "thumbnail"),
      ".jpg",
    ),
    panoramas: listAssetFiles(path.join(assetsDirectory, "background"), ".jpg"),
  };
}

function renderAssetManifest({ videos, thumbnails, panoramas }) {
  return `export function videos() {
  return ${JSON.stringify(videos)};
}

export function thumbnails() {
  return ${JSON.stringify(thumbnails)};
}

export function panoramas() {
  return ${JSON.stringify(panoramas)};
}
`;
}

function writeAssetManifest(publicDirectory = PUBLIC_DIRECTORY) {
  const manifest = readAssetManifest(publicDirectory);
  const manifestPath = path.join(publicDirectory, "files.js");

  fs.writeFileSync(manifestPath, renderAssetManifest(manifest));
  return manifest;
}

module.exports = {
  PUBLIC_DIRECTORY,
  listAssetFiles,
  readAssetManifest,
  renderAssetManifest,
  writeAssetManifest,
};
