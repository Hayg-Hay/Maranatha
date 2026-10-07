# Maranatha — Architect Handoff (Claude → Codex)

Written 2026-10-07. Commit this file to the repo (suggested path: `docs/ARCHITECT_HANDOFF.md`) so the handoff does not live only in a chat.
The repository and `PROJECT_HISTORY.md` are the project's memory; this file is the briefing that sits on top of them.
When this file and the repo disagree, **the repo wins** — verify, then fix whichever is stale.

**Verified correction, 2026-10-07 (Codex):** GitHub `main` already includes
`lxx-stage1` through merge `8c69797`; the branch remains at `14fe85c`. References
below to an awaiting merge are stale; they are not instructions to merge again.
Independent fresh-clone verification reproduced all shipped counts, the expected
JSON hash twice, and zero text differences across 47 pinned source files.
The mapping audit's 27,050 records are 27,048 shipped + 7 Psalm 151 - 5 nested
Psalm 129 containers; the 100 unnumbered segments are a separate record type.
See `build/reports/architect-handoff-REPORT.md` for evidence and limitations,
and `docs/ARCHITECT_NEXT_PROMPTS.md` for proposals only.

---

## 0. What you are taking over

You become the **principal architectural thread** of Maranatha: you decide structure, write the prompts the implementation agent executes,
and independently verify what comes back. The user (Ulysse) makes product decisions and approves anything that merges, pushes, deletes, or ships.

Role split going forward:

| Who | Does |
|---|---|
| Ulysse | Product decisions, approvals, real-browser/phone testing, commits/merges/pushes |
| You (Codex / GPT) | Architecture, research, prompt writing, independent verification, documentation of decisions |
| opencode + DeepSeek V4 (cheap API) | Heavy implementation, following your prompts exactly |
| Claude (optional, limited) | Occasional second-opinion spot checks if the user asks |

**Separation rule:** whoever implements must not be the only one who verifies. You write the check; the implementer runs it; you re-run it
yourself in a fresh clone before sign-off. If you ever implement something directly, say so explicitly and ask the user for a second reviewer or an
independent re-verification script.

About the user: communicates tersely, expects you to infer context and act, values token/allowance efficiency, speaks French/German/English/Luxembourgish.
Do not ask many clarifying questions; do not act on approvals the user has not given.

---

## 1. Non-negotiable principles

1. **Static site only.** No framework. Translation data loads via `<script>` tags (never `fetch()` for local data). Must work from a bare `file://` double-click and on GitHub Pages. `fetch()` was tried, broke, and was reverted.
2. **Never patch Scripture.** Gaps and corruption in source data are *disclosed* (flags, notices, ledger), never repaired or guessed. Do not graft another edition's text into a gap and label it as the original.
3. **Verify against primary sources.** Prose summaries from agents are not evidence. Require raw command output, or better: a script that prints PASS/FAIL lines.
4. **Binary/byte-level audit before any import.** Rejections are valuable; record them with technical findings in `PROJECT_HISTORY.md`.
5. **Minimal diffs.** Prompts anchor on exact existing text, not line numbers. No unrequested refactors. New features mirror existing patterns.
6. **No decision lives only in a conversation.** Record it in `PROJECT_HISTORY.md` (and README status when user-visible).
7. **Explicit approval before any push/merge/deletion.** Agents must never claim an approval the user did not give (see lessons: the `.venv` deletion).
8. **Known variants are data, not errors** (`data/known-variants.js`).
9. **License discipline.** Every shipped data file carries its license + attribution; CC BY-SA data is adapted only with attribution and the list of changes.

---

## 2. Workflow loop

1. You diagnose and write a precise, self-contained prompt for opencode (see §8 for the proven prompt skeleton).
2. opencode implements on a **named branch**, small commits, **no merge, no push** unless told.
3. Verification is **by script** (`build/check-*.mjs`, validators), with a budgeted report (`build/reports/*.md`, ≤ ~150 lines). Agents never dump data files or full logs.
4. You clone the pushed branch and verify independently (§9 recipes). Compare against numbers recorded here.
5. The user does the **real-browser test** (file:// and phone). jsdom does not apply CSS — a CSS bug passed every automated check once.
6. User merges. You record the outcome in `PROJECT_HISTORY.md`.

Cost levers: DeepSeek cached-token pricing dominates cost; keep prompts stable and self-contained; use output budgets; cache intermediates under `build/cache/` (gitignored).

---

## 3. Project snapshot

- Repo: `github.com/Hayg-Hay/Maranatha` (public), deployed on GitHub Pages. Successor to YaQuB (`yaqub-local`). Catholic **73-book canon** target.
- Shipped (Canon view): WEB Catholic Edition (73 books), KJV, Byzantine Majority Text (Greek NT), OSHB Hebrew OT, Luther 1912, Louis Segond 1910, Delitzsch Hebrew NT (1877/1901 grouped control), Western Armenian NT (1853, "Under audit" badge), Berean interlinear modes, Greek/Hebrew interlinears.
- Features: reference parser (multi-ref), search, per-verse compare, reading presets/themes, Hebrew script options (square/paleo/proto), Armenian UI locale, PWA.
- PWA: `service-worker.js`. Shell cache `CACHE_VERSION` = **v47** (bump when shell files change; three tests assert it — update only the version strings). `DATA_CACHE_VERSION` = **v3** (data files are cached runtime, cache-first; **bump it when any translation data file changes**, or phones keep the old copy).
- Fonts: `fonts/` holds Cardo (OFL, already `@font-face`d in `style.css`), Ezra SIL, Noto Sans Phoenician, ProtoCanaanite.
- Build tooling: Node `.mjs` scripts; `build/validate.mjs` is the canonical integrity check (exit 1 on errors); jsdom smoke tests; `npm test` runs everything.
- Branch state at handoff: `main` does **not** yet contain `lxx-stage1`. Pushed head of `lxx-stage1` = `14fe85c` ("Fix LXX view bar visibility and canon-control toggling; add view hint"). Verify with `git ls-remote`.

Items from older notes whose status I did NOT re-verify (check the repo before acting): interlinear `shortGloss()` extra params (`strongsKey`, `morph`) rollout; warm/sepia CSS cascade bug (`body::after` overlay fix recommended); French sourcing; Armenian sourcing.

---

## 4. LXX workstream — complete record

### 4.1 Decisions (user-approved, final unless he reopens them)
- **Source:** First1KGreek `data/tlg0527` @ commit `03776b39f4047c5cff06f5296fae4b2bae4b08fb` (Swete's LXX; every XML header carries CC BY-SA 4.0 — verified).
- **Rejected:** `nathans/lxx-swete` — no per-file license (0/55 headers), its Isaiah is Ottley's text not Swete's (1,188/1,291 verses differ from Swete grc1; 44 differ from Ottley grc2), its build allows edition overwrites, and it is a derivative of the same transcription (not independent verification).
- **Daniel witness = Theodotion** (`tlg057`), with Susanna (`tlg055`) and Bel (`tlg059`) as separate components. Evidence: WEB-C's structure matches Theodotion boundaries (Song 3:24–25 and 3:51–52, Susanna 13:64, Bel 14:1). Old Greek (`tlg056/054/058`) stays in raw sources only.
- **Staged shipping.** Stage 1 = Swete Greek in **native numbering**, standalone view. Stage 2 = aligned to canon, only where evidenced, via a tiered mapping.
- **Scope:** in-canon books only. Excluded and recorded: 1 Esdras, 3–4 Maccabees, Odes (incl. Prayer of Manasseh), Psalms of Solomon, Psalm 151. Ecclesiastes is absent upstream (`tlg030` is CTS metadata only, no XML) → recorded as "not available in this edition"; never grafted.

### 4.2 Stage 1 — implemented (on `lxx-stage1`, awaiting merge)
Files: `build/import-lxx-swete.mjs`, `build/validate-lxx-native.mjs`, `build/check-stage1.mjs` (15 PASS), `data/lxx-swete.js` + `.json`, `data/LICENSE-lxx-swete.md`, `build/reports/stage1-REPORT.md`, UI "View" switch (`Canon view` / `LXX (native numbering)`), docs.
Shipped numbers (use as regression anchors): **48 books** (45 in-canon + LJE, SUS, BEL), **1,055 chapters, 27,048 numbered verses, 100 unnumbered segments, 686 flagged verses**,
`data/lxx-swete.json` = 7,474,562 bytes, SHA-256 `d31c332f69a7baec02901d6e2612795326bdcee69a74282e3065f2c5f79d75a4`.
Text fidelity: **2,754,390 characters across 47 source files — zero differences** (independent extraction, §9). Importer is deterministic (two runs, same hash).
Schema: `window.MARANATHA_TRANSLATIONS['lxx-swete'] = {id,label,scheme:'lxx-swete-native',source,license,changes,excluded,missing,books:[{id,label,kind,sourceFile,notices,chapters:[{n,segments:[{kind:'verse'|'unnumbered',l?,t,flags?}]}]}]}`.
Only text transformation: Unicode NFC. Apparatus (`note`, `app`) and `head` excluded **by TEI structure**.
User tested in real browser: works. UI: LXX view is separate from Canon view; the LXX is **not** in the Translations list by design (a hint line says so).

### 4.3 Verified source facts & defects (disclosed, never corrected)
- Witnesses: Judges `tlg008` = Alexandrinus text only; Tobit = Vaticanus+Alexandrinus text (Sinaiticus `tlg022` absent upstream); Sirach uses `grc2` (Swete) — `grc1` is Hart's edition; Isaiah `grc2` is Ottley.
- **Theodotion Bel is truncated upstream** mid-sentence at 14:36; verses 37–42 absent (Old Greek Bel has all 42). Shipped with a notice; not reconstructed.
- Ps 115 has no verse label 6 (verse 5 holds the "Precious in the sight of the Lord" text = canon 116:15) and contains the transcription error `θάυατος`.
- Ps 88 has label `84` where `48` belongs (sequence `…47, 84, 49`).
- Ps 129:3 contains nested verse containers 4–8 (each emitted once). Ps 16:4 and 38:5 contain inline verse numerals.
- ~513 Latin-script and ~341 mixed-script tokens (shared with the `nathans` source → upstream transcription defects), 4 empty verses, hyphenation/line fragments, 181 text runs outside verse containers (shipped as unnumbered segments or a prologue chapter).
- The Letter of Jeremiah introduction exists as **detached Greek body text** (not a numbered verse), 72 numbered verses follow. Esther's prologue is its own chapter (`prologue`, 17 verses).
- Raw TEI contains 3,930 variant sigla and 2,427 apparatus notes (stripped from shipped text; preserved upstream/raw).

### 4.4 Mapping evidence (inputs for Stage 2)
- Usable reference sources: **SIL Paratext versification** (`sillsdev/libpalaso`, `sillsdev/scripture`; MIT) and **Copenhagen Alliance** (`versification-specification`; CC BY-SA 4.0). Probably not independent of each other. **STEP: unusable** (conflicting redistribution wording). **SWORD v11n: GPL-2.0, verse counts only.** Printed concordance: human cross-reference only.
- Mapping predictions are **not validated**. They mispredict at least: Ps 115:5 (predicted 116:14; content is 116:15) and Baruch 6.
- Evidence-based pairings found: Letter of Jeremiah verse *n* → WEB-C `BAR 6:(n+1)` (6:1 = introduction ↔ the detached Greek text); Theodotion `DAN 4:n` → `DAN 4:(n+3)` through 4:34→4:37; `DAN 3:98–100` → `DAN 4:1–3`; Susanna 1:64 → `DAN 13:64`; Bel 1:1 → `DAN 14:1`; Psalms: LXX 9 = canon 9+10, LXX 113 = 114+115, LXX 114+115 = 116, LXX 146+147 = 147 (titles handled separately).
- Likely 1→2 merge cases (hypothesis, unadjudicated): e.g. Ps 21:11 spans canon 22:10–11.
- Coverage snapshot: 594 source containers examined, **22 textual-anchor proposals, 572 unresolved**. SIL-defaults predicts 26,471 / 27,050 verses mapped (predictions only), 579 with no canon counterpart (Psalm titles, additions), 17 unresolved; candidates disagree on 1,331 references (unadjudicated).
- **Generic anchor heuristics (names/length/numerals/divine-name) are NOT validators:** they flag 25–52 % of verses even on books presumed to align (Judges 51.8 %, Ruth 50.6 %, Amos 46.6 %). Use targeted textual anchors with human adjudication instead.
- Verse-count equality never proves content alignment (Jeremiah 25–51 and Esther have equal chapter counts but different content order; Jeremiah 25:14 → 49:34, 31:43–44 → 48:43–44 are candidate boundaries needing independent evidence).

### 4.5 Stage 1 follow-ups (small; none blocked the merge)
1. Ps 16:4 inline `(4)` is not flagged (the marker detector misses parenthesized numerals); Ps 88:84 has a book-level notice but no verse-level flag.
2. The Letter of Jeremiah has no chapter in the source; it is shown as chapter `1` — state this in its notice.
3. `head` exclusion dropped two editorial Sirach headings (`Πατέρων ὕμνος`, `Περὶ ὑπομονῆς`); decide: ship as unnumbered segments, or accept and document.
4. User dislikes the current **Greek font** in the LXX view — deferred. Cardo is already bundled; discuss candidates with the user (what exactly he dislikes first).
5. In LXX view the reference box and text search are canon-only; Previous/Next are hidden. Documented in README. Consider LXX prev/next later.
6. Any change to `data/lxx-swete.js` ⇒ bump `DATA_CACHE_VERSION`.
7. Reconcile 27,048 + 100 vs. the audit's 27,050 in one line (immaterial: text is character-exact).

---

## 5. Next steps (proposed — not yet approved by the user unless noted)

**A. Merge `lxx-stage1`** (user action; `--no-ff` or PR). Then record in `PROJECT_HISTORY.md` and hard-refresh the deployed page (service worker is cache-first).

**B. Stage 1b — two independent panes (proposed).** Left pane: LXX with its own Book/Chapter pickers. Right pane: any Canon-view translation (including Hebrew) with its own pickers. **No row alignment**, each pane keeps its own numbering, clear banner. Mobile: stacked or tabbed. Reuse existing renderers; minimal diff; real-browser test. Needs only UI work, no mapping.

**C. Stage 2 — aligned LXX column (long-running).**
- Architecture: per-translation versification declaration + mapping to the canon; `validate.mjs`-style validator for mappings (new file, don't break existing validation). Add a distinct cell state "no corresponding verse" separate from "missing".
- Data shape (design only, from the audit): scheme id; `source-ref → to[]` (absence = unresolved; `[]` = externally attested no counterpart); per-entry provenance; static script-tag loading; unresolved verses render "alignment not available".
- Tiers: (1) verified identity, (2) external scheme cross-validated (SIL/CA), (3) evidence-based WEB-C bridge entries (BAR, DAN, EST), (4) everything else unresolved.
- Method: adjudicate targeted anchors with explicit textual evidence; never guess. Books with the largest risk: PSA, JER, PRO, EST, DAN, BAR.
- This also resolves the long-deferred **per-translation versification** decision (single shared `canon.js` vs WEB-C/KJV differences).

**D. Other open threads (status from notes; verify):** French sourcing (CTB email awaiting reply; Segond 1910 imported with versification reconciliation — check history), Armenian (Eastern search closed after three rejected sources; Western NT "under audit"; OT sources unresolved), repo hygiene (untracked: `build/sources/arm-eastern/`, `build/sources/arm-eastern-1800s/`, `build/sources/reviewed-greek-gloss/john-lexicon.mjs`, `paelo-hebrew font alphabet.png`, `sirach-versification.patch`; remote branch `fix/sirach-translation-versification` exists — reconcile).

---

## 6. Lessons learned (read these twice)

1. **jsdom does not apply CSS.** The `hidden` attribute was overridden by `.chapter-bar { display:flex }`; every automated check passed. Always require a real-browser test. Add static CSS checks for known pitfalls.
2. **Agents can claim approvals the user never gave** (the `.venv` deletion). Destructive actions require explicit user approval; make agents list what they would delete first.
3. **Disk-full incident** truncated an importer mid-run. After any disk-space incident: `git fsck --full`, regenerate deterministically twice and compare SHA-256, verify `git status` is clean, check file tails.
4. **Scheme-based mapping fails on a source's own quirks** (Ps 115:5). Check by content, not by counts.
5. **Heuristic flags are noisy** (the Psalm "neighbor suspects" mostly came from STEP's alternative candidates, not from SIL/CA defaults). Measure false-positive rates on controls before trusting any heuristic.
6. **My own mistakes during this project (verify my statements, don't inherit them):** I first assumed the Letter of Jeremiah's introduction had no Greek counterpart (it exists as detached text); I assumed Judges/Tobit had two printed witnesses in this dataset (only one each); I initially read "30 Psalm 88 gaps" as missing verses (it is one transposed label).
7. `nathans`-style derived datasets can silently mix editions; always check per-file provenance headers.
8. Agents asked to "verify" will tend to summarize; demand a PASS/FAIL script and a short report file instead.

---

## 7. Your first tasks (also serve as an acceptance test of this handoff)

1. Read: this file, `PROJECT_HISTORY.md` (Phase 4 entries), `README.md`, `build/reports/stage1-REPORT.md`, `build/sources/lxx-swete/AUDIT*.md`.
2. In a **fresh clone** of `lxx-stage1`, reproduce independently (using your own code, §9): 47 files, **2,754,390** characters, zero differences; regenerate the data twice and confirm SHA-256 `d31c332f…`; confirm Ps 88 `…47,84,49`, Ps 115 has no label 6, Bel ends at 36.
3. Report any number that does not match. A mismatch means this handoff or the repo is wrong — find out which.
4. Then propose (don't implement) the Stage 1b prompt and the small Stage 1 follow-ups (§4.5), each as a self-contained opencode prompt following §8.
5. Ask the user to approve before anything is merged, pushed, or deleted.

---

## 8. Proven opencode prompt skeleton

```
=== TASK (single self-contained task; you are the implementer) ===
STATUS OF DECISIONS: <list user-approved decisions; say what supersedes earlier STOPs>
EXECUTION RULES
1. OUTPUT BUDGET: never print data files/full logs; counts, PASS/FAIL, `| head -40` at most; details go to build/reports/<name>-REPORT.md (≤ ~150 lines).
2. VERIFY BY SCRIPT: create build/check-<name>.mjs asserting the invariants, one PASS/FAIL line each (list them; include label/count/hash invariants and a canon-view regression).
3. REPORT FILE contains only: PASS/FAIL table, git diff --stat, data sizes, DEVIATIONS, OPEN QUESTIONS.
4. Work on a named branch in small commits; run the check after every commit; stop on first FAIL. No merge, no push, no deletion without the user's explicit approval.
5. Do not re-read large files; cache intermediates under build/cache/ (gitignored).
HARD CONSTRAINTS: static site, <script> loading only, no fetch() of local data, file:// must work; never correct Scripture; parse XML with a parser; don't touch <list files>.
SCOPE: <deliverables, filenames, schemas, answers to obvious questions>
UI: <minimal diff; real-browser checklist for the user>
DOCS: <PROJECT_HISTORY entry + README status + license files>
STOP after writing the report. Wait for review before any merge.
```

---

## 9. Verification recipes (adapt; run in a fresh clone)

**Text fidelity (shipped vs. upstream TEI).** Clone upstream sparsely at the pinned commit:
`git clone --depth 1 --filter=blob:none --sparse https://github.com/OpenGreekAndLatin/First1KGreek.git f1k && cd f1k && git sparse-checkout set data/tlg0527`
Then (Python, lxml): for each shipped `sourceFile`, extract all text of the TEI `<text>` excluding subtrees `note`, `app`, `head` (and chapter 151 in `tlg027`), apply NFC, strip whitespace, build a character `Counter`; compare with the concatenation of all shipped segment texts for that file. Expect 0 diffs in all 47 files (2,754,390 chars).

**Label fidelity.** For each source file, list per chapter the `div[@subtype='verse']/@n` values **in document order including nested verse divs** (`chapter.iter('div')` with `subtype=='verse'`), skipping empty chapters; compare with the shipped labels (verse segments only). The Letter of Jeremiah has no chapter divs upstream — compare its verse list separately.

**Spot invariants (JSON):** Ps 88 labels end `…45,46,47,84,49,50,51,52,53`; Ps 115 labels `1,2,3,4,5,7,8,9,10`; Ps 129 has an unnumbered title then verses 1–8, each text once; `PSA` has 150 chapters; `BEL` last label `36` with the truncation notice; `ECC` absent and listed in `missing`; Daniel's `sourceFile` is `tlg057`; Sirach is `tlg034 …grc2.xml`; no `fetch(` added in `app.js` (comments only).

**Other checks:** `git fsck --full` (dangling objects are normal), `npm test`, `node build/check-stage1.mjs`, `node build/validate-lxx-native.mjs`, regression render of WEB+KJV chapters (GEN 1, EXO 20, PSA 23, PSA 119, ISA 53, JER 25, DAN 3, SIR 1, MAT 5, JHN 1) byte-identical before/after any UI change.

---

## 10. Real-browser checklist (the user runs this; keep it in every UI prompt)

Hard refresh (service worker is cache-first; DevTools → "Update on reload"). Canon view: one Book/Chapter pair, WEB unchanged, LXX hint visible. LXX view: canon controls hidden, View + LXX pickers visible, banner + attribution shown; Ps 88 shows `84`; Ps 115 has no verse 6; Bel stops at 36 with notice; Letter introduction unnumbered then 72 verses; Greek accents/breathings render. Switch back to Canon: nothing lingers. Repeat on the phone (first load of the 7.5 MB data file).
