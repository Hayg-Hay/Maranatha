# Maranatha

An offline Bible reader and multilingual study tool, with source-aware edition
information, independent versification, local reading aids and printable passages.
It uses static files and classic scripts: no account, server or framework is
required for local reading.

## Start reading

1. Keep the downloaded application files, `data/` and `fonts/` together.
2. Open `index.html` in a browser, or use `Open-Maranatha-Local.cmd` on Windows.
3. WEB opens at Genesis 1. Use a reference such as `John 3:16`, the book/chapter
   controls, or text search to navigate.
4. Expand **Translations**, **Study tools** or **Reading settings** when needed.
   These sections start collapsed. A saved session offers **Continue reading**.

Reading does not require Node.js, dependency installation, a build step or an
internet connection when the complete files are available locally. The project
uses a 73-book Catholic navigation framework; each edition retains its actual
coverage and documented numbering differences. Missing coverage is not filled
from another edition.

## Current reading and teaching features

- **Navigation and search:** references, chapter browsing, language-aware text
  search with highlighted excerpts, and return to the opened search result.
- **Reading controls:** responsive layouts, themes, appearance, reading presets,
  larger text, Hebrew display-script options and temporary reader focus mode.
- **Local reading aids:** explicit resume, the last 10 recent passages, named
  bookmarks and bookmark JSON export/import. There is no account synchronization.
- **Copy and print:** source text, references and translation credits stay
  together. Printing offers verse-by-verse comparison for eligible shared reading
  blocks, plus translation-by-translation output. It has its own 12/14/16/18/24 pt selector, independent of the
  reader font size. The browser print dialog can save as PDF; use 100% scaling
  to preserve the chosen point size. Browser headers/footers are optional.
- **Edition information:** each edition has provenance, coverage, recorded
  reuse terms, textual limitations and the scope of documented checks.

Detailed instructions and limitations are in the [documentation index](docs/INDEX.md).

## Edition inventory

There are **21 registered editions**. The two Delitzsch editions share a control
but retain separate text, metadata and numbering. The separate native LXX view
is additional to this inventory.

| Edition | Imported coverage |
| --- | --- |
| World English Bible, Catholic Edition | 73 books |
| King James Version | 66 books |
| Western Armenian NT (1853) | 27 NT books; under audit |
| Byzantine Majority Text, Greek NT | 27 NT books |
| Hebrew Bible, OSHB | 39 OT books |
| Luther Bible 1912 | 66 books |
| Louis Segond 1910 | 66 books |
| Vulgata Clementina (1598) | 73 books |
| Delitzsch Hebrew NT, unpointed eBible text | 27 NT books; underlying print edition unspecified |
| Delitzsch Hebrew NT, 1901 vocalized edition | 27 NT books |
| Bungo-yaku, Classical Japanese | 66 books |
| Open Translation Bible, Japanese | 66 books |
| Chinese Union Version, Traditional New Punctuation | 66 books |
| Alkitab Yang Terbuka, Indonesian | 66 books |
| Bohairica 1.2, Coptic Bohairic | 27 NT books |
| Syriac Peshitta, BFBS-labelled digital NT | 27 NT books |
| James Murdock's English Syriac NT | 27 NT books |
| Kitab Suci Zabur dan Injil, Malay | 27 NT books; no Psalms/OT |
| Open Vietnamese Contemporary Bible | 66 books |
| Open Ang Salita ng Diyos, Filipino/Tagalog | 66 books |
| Open Thai Common Version | 66 books |

For precise edition identity, coverage, reuse terms and verification limits,
use the in-app **Edition information** panels and their retained evidence links.
Their metadata is generated from the registry/datasets and
[curated evidence summaries](build/edition-information-catalog.mjs). The table
above is an overview, not a replacement for individual source records.

Not all editions are public domain, equally verified, or freely reusable under
the same terms. Digital-source reproduction, sampled print comparisons,
complete print/manuscript collation and translation quality are separate matters.
Existing source gaps, placeholders and combined units remain disclosed; no
Scripture or correspondence is invented to make counts agree.

## Reading views and study material

- **Canon view:** shared navigation with edition-specific coverage and
  independent reading blocks where numbering/content-placement rules require
  them. Matching numbers alone do not establish textual correspondence.
- **LXX (native numbering):** Swete's Septuagint in its own labels, with
  unnumbered material and source notices. Daniel is the Theodotion witness;
  Susanna and Bel are separate components. The retained source does not supply
  Ecclesiastes; Psalm 151 is outside the shipped scope. Native references accept
  one book/chapter and optionally one verse, not ranges or multiple references.
- **Parallel reading:** native LXX and one other edition, with independent
  selectors. There is no automatic chapter mapping or row alignment. The right
  pane can also use independently numbered editions.

Text search covers registered translations, not the native LXX corpus. Searching
from LXX/Parallel returns to Canon. A reference entered in standalone LXX uses
native labels and stays there; a reference entered in Parallel returns to Canon.

Study tools include Greek and Hebrew interlinears, the separate Berean NT
interlinear, and the draft Berean Hebrew Torah preview with retained Daniel/
Malachi samples. Glosses, dictionaries and morphology explanations are study
material, not additional Scripture. Coverage, source notices and draft limits
remain visible in the relevant controls/readings.

Both Greek interlinears include separately labelled supplemental preposition
case-government notes in Reading and Study modes. These describe general NT
grammar and do not identify complements or parse an occurrence automatically.
See the [reference and coverage inventory](docs/GRAMMATICAL_ANNOTATIONS.md).

The **LXX alignment pilot (Genesis 1-15)** is opt-in and off by default. Its
correspondences remain **proposals awaiting human review**. Shipped proposal
coverage does not mean verified alignment. See the
[study and source records](docs/INDEX.md#study-and-source-records).

## Offline use and local data

Local `file://` reading loads datasets through classic script tags, never by
fetching local files. The HTTPS deployment additionally supports a service worker:
the small shell is precached and translation files are cached as loaded.
Opening the hosted site once does not download every translation. Offline
availability there depends on which resources were cached.

Reading records and bookmarks use browser storage. Moving the application,
switching profiles/browsers or clearing site data may make those records
unavailable. Export bookmark backups before doing so. Recent history and search
return state are not included in bookmark backups; search return state is
memory-only. Scripture datasets remain separate from personal reading records.

## Development and verification

The architecture remains static and compatible with `file://`:

| Location | Responsibility |
| --- | --- |
| `index.html`, `style.css` | Controls, layout, themes and print styling |
| `app.js` | Reference parsing, navigation, rendering and study orchestration |
| Reading/copy/print/edition helper scripts | Shared feature-specific UI and storage behavior |
| `data/` | Canon, locales, Scripture datasets, study data and generated edition metadata |
| `fonts/` | Local multilingual fonts and their notices |
| `build/` | Importers, metadata generation, validators and regression checks |
| `build/sources/` | Retained source artifacts and provenance records |
| `docs/`, `build/reports/` | Usage, evidence, investigations and recorded verification |
| `service-worker.js` | HTTPS shell/data caching; not used under `file://` |

For development, install the package dependencies, then run checks appropriate
to the change. For example:

```bash
npm run test:calmer-reading
npm run test:edition-information
npm run test:reading-polish
npm run test:search-polish
npm run test:print-passage
```

`npm test` is the broader integration/import regression pipeline. Focused DOM
tests do not establish physical-device layout, screen-reader acceptance, actual
printer/PDF pagination for every passage, or complete textual collation. Consult
the relevant recorded results; test-file existence alone is not a passed audit.

Regenerate edition metadata with `node build/build-edition-information.mjs`;
the edition-information test checks that it is current. When adding an edition,
also update this inventory and the documentation index as needed. Do not run
importers merely to browse, or treat matching verse counts as source fidelity.

## Collaboration workflow

Keep Codex work focused on research, implementation and relevant checks. Avoid
unrequested exhaustive audits or repetitive debugging loops. Generate a DeepSeek
handoff only when the user explicitly requests that involvement; do not create
handoff files or message another agent/service automatically. Commit, merge and
push only when authorized by the user.

## Current guidance and historical records

This README describes the current application. [PROJECT_HISTORY.md](PROJECT_HISTORY.md)
records milestones, decisions and checks as they were documented at the time;
older branch, approval, cache-version and pending-work statements are historical.
Edition-specific investigation/validation documents likewise retain their scope
and dates, rather than claiming a new audit whenever the interface changes.

The [previous README](docs/history/README-before-2026-10-18-consolidation.md)
is preserved as an explicitly historical snapshot, including detailed older
implementation notes. Use the [documentation index](docs/INDEX.md) to find
current feature guides and the underlying evidence.
