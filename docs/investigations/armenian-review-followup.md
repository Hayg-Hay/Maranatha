# Armenian review follow-up

2026-10-09. Incorporated the user's external review. Research artifacts only;
no Scripture repairs, publisher messages or regression execution.

## Western review unit and classification

The recorded 160 module/cache differences cover **20 chapters**, in **25
contiguous runs**. This agrees with treating them as boundary events rather
than 160 independent defects. `build/reviews/armwestern-mismatch-runs.json`
records runs; `armwestern-evidence-ledger.json` prepares 20 chapter-level
records with run-start, preceding-slot and tail references. Unfilled class,
native-label and witness fields are unresolved, not presumed evidence.

The empty slots are now explicitly divided into:

- Shift-run tails: Matthew 17:27, Mark 9:50, Acts 14:28, 1 Thessalonians 4:18.
  Offset residue is plausible, but all require tail comparison against print.
- Tails without a preceding difference run: Acts 7:60, Acts 19:41,
  2 Corinthians 13:14, Hebrews 13:25. A previous-slot merge or absence must be
  distinguished by reading the previous slot and a matching print. No preceding
  cache/module shift does not itself certify correct upstream indexing.
- Chapter starts: 2 Corinthians 2:1 and 6:1. Retain explicit gaps unless a
  matching witness supplies verified restoration evidence.

## John 6 repair is unverified as a native-edition representation

**Later evidence:** a same-wording electronic witness explicitly repeats label
6:51 on two fragments. That supports the cache's re-merging against that
witness; the differently worded 1884 print is not interchangeable with it.
See [armwestern-electronic-lineage.md](armwestern-electronic-lineage.md) before
treating the repair as wrong or making a replacement decision.

The visual 1884 print inspection already establishes separate labels 51/52
and a final label 72 (PDF 990, NT printed page 102). Raw module slots 51/52
divide the same content, while its tail is constrained to 71 slots. Commit
7976c81's current cache re-merges 51/52 content into conventional verse 51.
Calling that repair correct merely because it matches English counts would
be unjustified. It changes source-unit boundaries relative to this historical
witness. Exact module-edition identity remains unresolved, so no blanket claim
that the 1884 print settles every module boundary is made.

The correct architecture is immutable native units with their actual labels,
plus a separate native-to-conventional map that can express many-to-one and
cross-chapter relationships. Comparison displays must retain native labels.
The map may aid navigation; it must not rewrite the source into English units.

## Wording fingerprint and decision gate

`build/reviews/armwestern-fingerprint-sample.json` prepares 40 wording anchors
across all 27 NT books, excluding current mismatch slots. They are candidate
anchors, not references certified by count/cache agreement. Comparison uses
NFC, lowercase, expansion of the Armenian ligature and whitespace normalization
only. Original wording remains alongside it; spelling/punctuation differences
must be logged explicitly rather than normalized away without evidence.

The anchors have **not yet been compared with an identified matching print**.
They now match 40/40 against the electronic witness with diagnostic quote
folding, 37/40 without it; that witness is not an original print scan.
Fill witness name/year/impression, page, original words and differences before
calculating a match rate. Establish edition identity from many dispersed word
matches, then examine boundary-run starts/tails separately. If no exact print
match is established, label the module an unidentified-edition witness or
deliberately select a complete print edition; do not pretend the 1884 print is
the module's confirmed 1853 impression. A new transcription would require
separate scope, inventory and page-by-page verification.

## Lineage and new search findings

The module config identifies only the 1853 NT label and Slavic Bible via
Unbound. No named print impression or transcription/editor was found there.
The current Biola Unbound site redirects to a notice that the project has been
discontinued. That live endpoint does not resolve the old edition description;
archived descriptions/catalogues remain a follow-up route.

Source: https://www.biola.edu/talbot/unbound

Find.Bible has a Western "1853 (with 2017 adaptations)" entry; the currently
opened page identifies 2017 publisher copyright. A cached search listing
mentions a historic NT scan but did not supply a usable inspected scan link.
It is a lead, not an authenticated 1853 print witness. No exact 1853 scan was
confirmed in this bounded search.

Source: https://dev.find.bible/bibles/HYWNT53/?locale=tl

## Grabar transcription/inventory gate

DBS explicitly identifies its Zohrab NT item as a **scan**, 744 pages, with a
PDF download. This confirms an NT scan, not a machine-readable full transcription.
The Wikisource search did not establish a freely licensed Zohrab transcription;
results for the unrelated writer Krikor Zohrab are not Bible evidence. Search
failure is not proof that no such transcription exists.

Sources:

- https://scripture.dbs.org/books/Armenian-Zohrab-Bible-New-Testament-1805/
- https://hy.wikisource.org/ (further catalogue/index search still needed)

A further TITUS lead exists for Zohrab OT. Its header says canonical OT texts
are complete but apocryphal OT texts are missing, and identifies modern
abbreviation restitutions. This expands its comparison utility beyond NT,
but neither establishes the selected print's complete book/appendix inventory
nor clears TITUS redistribution rights. No hand-transcription commitment has
been made. Locate all print volumes and inventories before declaring full
Grabar coverage. Keep Zohrab, Bagratuni, editorial apparatus and appendices
distinct.

Source: https://titus.uni-frankfurt.de/texte/etcs/arm/zohrab/armat/armat001.htm

## Eastern draft

`armenian-permission-request.md` now explicitly describes the public GitHub
Pages full-text bundle, separate public source-repository rights, search data,
exact impression/inventory and rights-holder referrals. Sender identity and
free/non-commercial status are placeholders to complete/confirm before sending.
It remains unsent until the user decides.
