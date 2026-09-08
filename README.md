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
