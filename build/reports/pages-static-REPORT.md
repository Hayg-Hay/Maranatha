# GitHub Pages static-publishing fix — 2026-10-07

Branch `codex/pages-static-publish`, based on `5213a13`. Reviewable fix only;
no merge, push, network mutation, workflow rewrite or data change was performed.

## PASS/FAIL

| Check | Result | Evidence |
| --- | --- | --- |
| Base has no `.nojekyll` | PASS | glob `**/.nojekyll` → none at `5213a13` |
| Base has no `_config.yml` | PASS | glob `**/_config.yml` → none |
| App is already a static generated site | PASS | `index.html` loads `style.css`, `app.js`, `data/*.js`, `data/locales/*.js` via `<script>`; no server/build step needed |
| Empty `.nojekyll` created at repo root | PASS | zero-byte file added |
| Runtime/data code untouched | PASS | only `.nojekyll`, this report and `PROJECT_HISTORY.md` change |
| Scope limited to the permitted three paths | PASS | `git status`/`git diff` show no other paths |
| Whitespace/consistency | PASS | `git diff --check` clean |

## Observed states (as reported; not re-mutated here)

- Public GitHub Pages run `https://github.com/Hayg-Hay/Maranatha/actions/runs/37632428142`
  is **in_progress**, job **build / Build with Jekyll**.
- `main` contains the user-accepted Stage 1b (shell cache `v49`, data cache `v3`).
- Base `5213a13` has neither `.nojekyll` nor `_config.yml`.

The deployment is **in progress, not proven failed**. This report makes no claim
that the Jekyll step has already failed, and none that repo size conclusively
causes its delay.

## Why an empty `.nojekyll` is appropriate

GitHub's primary guidance ("Creating a GitHub Pages site") states that an empty
`.nojekyll` file at the publishing-source root disables the default Jekyll build
and serves the files as-is. This repository is a static site: `index.html` is
already complete and references its own assets directly. There are no Jekyll
layouts, includes or `_config.yml`, so the default Jekyll build adds no value
and can delay or alter publication. An empty marker is the minimal, documented
way to request direct static publishing.

## Scope and effect

- Added: empty `.nojekyll` at the repository root.
- Documentation: this report and a `PROJECT_HISTORY.md` entry.
- No runtime/data change: `app.js`, `style.css`, `index.html`, `service-worker.js`
  and every `data/*` file are untouched; `CACHE_VERSION` stays `v49` and
  `DATA_CACHE_VERSION` stays `v3`.

Expected effect: after an approved merge, Pages should skip the Jekyll build and
publish the static files directly. Limitation: this has **not** deployed and
cannot be confirmed from this branch. A new deployment and the phone's service
worker update must still be observed on the live URL after merge. Whether
Jekyll was the cause of the current delay remains unproven.
