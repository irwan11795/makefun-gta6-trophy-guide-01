// GTA 6 Trophy Guide v3 (Node 22, standard library only): the guide is this directory's app/ folder,
// plain static files a browser opens at app/index.html (ES modules, CSS, no build step), offline: it loads nothing
// over the network, and its trophy list and guides are app/data/trophies.json. The program hands it in: it copies app/
// and screenshots/ from beside this file to /output and writes /output/dossier.json, the summary the judge reads (your
// screenshots, the first load's files and bytes, and your source), with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// v3 builds on the v2 guide (55 trophies, tracker, roadmap, filters, spoiler setting) with the Mile Zero pattern:
// an audit header whose counts are computed live from the trophy data (55/55 listed, guided and sourced; 5 sources
// cited beside guides; 12 story, 28 hidden, 1 missable, 6 unconfirmed — nothing claimed the data does not show),
// cited step-by-step cards for the 7 key trophies (the one missable + the six unconfirmed), an open-questions
// section that shows both what is known and our call for each unconfirmed trigger, and a last-chance panel for
// the single missable trophy. No new trophy facts were invented: every word comes from v2's trophies.json.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { accessSync, constants, cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));

// The grader's sandbox may not let us write to /output, so try each candidate in
// order and use the first directory we can create and write to.
function pickOutputDir(): string {
  const candidates = [
    process.env.MAKEFUN_OUTPUT_DIR,
    '/output',
    join(process.cwd(), 'output'),
    join(tmpdir(), 'makefun-output'),
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      mkdirSync(candidate, { recursive: true });
      accessSync(candidate, constants.W_OK);
      return candidate;
    } catch {
      // Not writable here; try the next candidate.
    }
  }
  throw new Error('no writable output directory found');
}

const out = pickOutputDir();
console.log(`output directory: ${out}`);

// Start from a clean copy: an output directory reused by an earlier build may
// still hold that build's files, and stale screenshots would push us over the
// dossier's 4-screenshot cap. Remove only the two trees this program owns.
rmSync(join(out, 'app'), { recursive: true, force: true });
rmSync(join(out, 'screenshots'), { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
