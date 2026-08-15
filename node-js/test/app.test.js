const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  PUBLIC_DIRECTORY,
  readAssetManifest,
  renderAssetManifest,
} = require("../asset-manifest");

test("every trailer has a matching thumbnail", () => {
  const { videos, thumbnails } = readAssetManifest();
  const stems = (fileNames) =>
    fileNames.map((fileName) => path.parse(fileName).name).sort();

  assert.deepEqual(stems(videos), stems(thumbnails));
});

test("the checked-in asset manifest is current", () => {
  const expected = renderAssetManifest(readAssetManifest());
  const actual = fs.readFileSync(
    path.join(PUBLIC_DIRECTORY, "files.js"),
    "utf8",
  );

  assert.equal(actual, expected);
});

test("the web app has clean static HTML", () => {
  const html = fs.readFileSync(
    path.join(PUBLIC_DIRECTORY, "index.html"),
    "utf8",
  );

  assert.match(html, /^<!DOCTYPE html>/);
  assert.doesNotMatch(html, /<\?php|jquery/i);
});
