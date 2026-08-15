const express = require("express");

const {
  PUBLIC_DIRECTORY,
  writeAssetManifest,
} = require("./asset-manifest");

function createApp() {
  const app = express();
  app.use(express.static(PUBLIC_DIRECTORY));
  return app;
}

function startServer(port = Number.parseInt(process.env.PORT ?? "3000", 10)) {
  writeAssetManifest();

  return createApp().listen(port, () => {
    console.log(`http://127.0.0.1:${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { createApp, startServer };
