# Japanese Cinema

A `three.js` cinema experience for watching trailers for movies that were screening in Japan when the project was created.

## Installation

Install [Node.js](https://nodejs.org/) 18 or newer, then run the web version:

```sh
git clone https://github.com/joshika39/japanese-cinema.git
cd japanese-cinema/node-js
npm ci
npm start
```

Open [http://localhost:3000](http://localhost:3000).

To run the desktop version, install its dependencies separately from the repository root. It uses the same frontend and assets as the web version.

```sh
cd electron-js
npm ci
npm start
```

## Usage

### Controls

| Key          | Description                          |
| ------------ | ------------------------------------ |
| `W`          | Move forward                         |
| `A`          | Move left                            |
| `S`          | Move backward                        |
| `D`          | Move right                           |
| `Space`      | Jump                                 |
| `Mouse`      | Look around                          |
| `Escape`     | Release mouse control                |
| `R`          | Open the movie trailer selector menu |
| `Q`          | Move selector to the left            |
| `E`          | Move selector to the right           |
| `Enter`      | Play the selected movie trailer      |
| `U`          | Toggle sit/stand                     |
| `F`          | Toggle fullscreen trailer playback   |
| `Left Shift` | Leave the selected seat              |

## Development

Run the lightweight server and asset checks from `node-js`:

```sh
npm test
```

Trailer and thumbnail filenames must share the same base name so that the selector can pair them correctly.
