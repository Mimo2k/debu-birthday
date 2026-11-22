# Debu's Birthday

A cinematic, interactive birthday surprise for Debu, lovingly sent by his big sister Isha and Mimo. It includes a browser-generated original soundtrack, a birthday premiere sequence, animated memories, confetti, and an interactive candle wish.

## Preview locally

Serve the `dist` directory with any static web server:

```bash
python3 -m http.server 4173 --directory dist
```

Then open `http://localhost:4173`.

## GitHub Pages

The included workflow publishes the contents of `dist/` to GitHub Pages after every push to `main`.

## Built with

Plain HTML, CSS, JavaScript, Canvas, and the Web Audio API. There is no build step and no dependency install.
