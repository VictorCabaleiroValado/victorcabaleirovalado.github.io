# Victor Cabaleiro Valado — Portfolio

Professional portfolio covering data analytics, applied AI, projects, technical skills and education.

**Live website:** https://victorcabaleirovalado.github.io

## Development

Requires Node.js 22.13+ and pnpm.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

The site exports static files to `dist/client`. GitHub Pages serves the committed `docs` directory from `main`. After a build, synchronize the exported files into `docs` and preserve `docs/.nojekyll`.

The project covers show an actual native Power BI export and the real motor-channel waveform for demo measurement 402. Rebuild the waveform with `python tools/build-signal-cover.py`; its display uses the demo min/max reduction of 64,000 original samples. The résumé and professional portrait were supplied by Victor.

## Project presentation

Keep all project covers in the shared `.project-cover` 16:9 frame. The frame and image occupy the same width and height in every card; `object-fit: cover` crops differing source ratios without stretching. Use this class for future projects and verify equal rendered dimensions on desktop and mobile.

Project order: Power BI Data Quality & Operational Dashboard, Fault Diagnosis in Rotary Machines, Azure Operations Data Platform.
