# Armenian collection: Western, Eastern and Grabar

Investigation, 2026-10-09. User priority: Armenian Scripture is Maranatha's
original purpose. This is research only while DeepSeek verifies KSZI. No
application, source import, existing Armenian data, or tests were changed.
No publisher or other task was contacted on the user's behalf.

## Recommended collection

Maintain three distinct registers, each with explicit edition, spelling,
canon/scope, print witness and digital provenance. Do not assemble a supposedly
complete Armenian Bible by combining Western NT, Eastern OT and Grabar extras.

| Register | Preferred route | Readiness |
| --- | --- | --- |
| Western | Reliable full historical 1853-family print witness; alternatively publisher-authorized modern Western edition | Existing NT cache is under audit; no complete audited import established |
| Eastern | Confirmed target: New Etchmiadzin 2017; historical Ararat remains a distinct alternative | Publisher edition identified; app-bundling and public-repository grants sought separately |
| Grabar / Classical | Confirmed print base: Zohrab 1805; Bagratuni stays separate; TITUS comparison-only pending rights | Printed/textual witnesses located; digital redistribution/coverage must be settled |

This investigation does not establish a complete, ready-to-import, permissively
licensed three-edition set. Source selection and acceptance are the remaining
work, not just adding registry entries.

## Existing Western Armenian NT: why the audit must be resolved

**Pilot update:** commit `7976c81` already repaired several cache/output
offsets. The September history below describes the pre-repair state, not
the current cache. A direct module probe and 1884 print comparison found
both upstream index problems and genuine historical numbering differences.
See [armwestern-pilot.md](armwestern-pilot.md) before choosing a remedy.

CrossWire currently lists `ArmWestern` 1.1 (2008-07-14) as 1853 Western Armenian
NT, Public Domain. Maranatha uses a pre-extracted JSON cache; it does not retain
the original extraction code or raw module in this source directory.

The September 13 project audit supersedes the initial importer's reassurance
that matching chapter counts prove reference compatibility. It documents
split/merge shifts in John 6, Mark 8–9 and other chapters, sometimes with
duplicated text. Thirteen inspected chapters had confirmed boundary defects;
unexamined chapters were not thereby certified clean. Of ten empty array slots,
eight were assessed as offset residue and two as genuine transcription gaps
(2 Corinthians 2:1 and 6:1). These are recorded audit findings, not a fresh
exhaustive re-audit in this turn.

Do not automatically describe every cached slot as a real printed verse gap.
Likewise, do not infer that the historic printed edition itself is defective:
the defect could lie in indexing, extraction or a digital upstream witness.
Re-obtain and pin the raw module, inspect native markup/indexes and compare
against a matching Western print witness before deciding whether to replace
the source or make a verified source-reference mapping. English translation
text/lengths may locate suspects but cannot authorize Scripture boundaries.
Do not reconstruct Armenian words or split passages by AI guesses.

Sources/evidence:

- https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=ArmWestern
- `PROJECT_HISTORY.md`, section "2026-09-13 — ArmWestern".
- `build/import-armwestern.mjs` (initial count-based assumptions).
- `build/sources/armwestern/armwestern.source.json` (existing cache).

### Full/modern Western alternatives

The Bible Society in Lebanon supplies a full platform edition titled Western
Armenian Bible 1853 (`WARMB`). Its title and online contents do not prove that
its digital wording is identical to the CrossWire NT or authorize redistribution.
Later revision/copyright notices must be distinguished from the old print text.
No blanket offline/public-repository grant was established here.

The same publisher lists Western Armenian NT adapted 2017 (`WA2017`), explicitly
copyright 2017, and a separate Western Armenian New Translation associated
with the Catholicosate of Cilicia. These are modern permission/source-request
routes, not automatically public-domain replacements for the 1853 artifact.

Sources:

- https://www.bible.com/versions/1987-warmb-western-armenian-bible-1853
- https://www.bible.com/en-GB/versions/194-wa2017-2017

## Eastern Armenian: distinguish the actual editions

The Bible Society of Armenia identifies **New Etchmiadzin 2017** as a revision
of its Grabar-derived modern Eastern translation and **New Ararat 2018** as
a revision of the original-language-derived Ararat translation. It reports
48 OT books for New Etchmiadzin and 39 for New Ararat. Both are modern Eastern
Armenian, not Classical Grabar. For the user's Armenian heritage/Apostolic
coverage goal, New Etchmiadzin is the strongest modern candidate in this study.
No open full-text redistribution licence or downloadable structured source was
established. Seek an explicit publisher grant for offline app bundling and
public source redistribution, or choose an audited historical print artifact.

Historical Ararat (late nineteenth century) should remain a separate edition;
the status of an old translation does not establish rights to modern revisions.

Source: https://www.biblesociety.am/eng/146/Bible

### Existing Eastern source leads do not solve coverage

`build/sources/arm-eastern/AUDIT.md` records a held CrossWire `ArmEastern`
archive, hash `21d6d381734458e584416af6552d762f366a6cfadb2f7710d855b83a19f2f689`.
Its six books are Genesis, Exodus and four Gospels. The recorded raw-byte audit
found 47 empty chapter-tail slots, missing/shifted passages and repeated text.
An as-is shared-row import would misidentify Scripture by reference. The
current CrossWire listing independently confirms its six-book scope and PD
distribution declaration; it is not a full Eastern Bible solution.

The file cached under `arm-eastern-1800s`, Internet Archive identifier
`bibleinmodernarm00cons` (Constantinople 1884), was previously identified by
page samples as **Western**, not Eastern Armenian. Its default OCR has no
Armenian Unicode characters and is unusable. Folder names and generic archive
language metadata are not edition/register evidence. Keep it as a Western
print lead for title-page/scan audit, not an Eastern import candidate.

The cached fallback `armenian_mark` is an Eastern/Ararat Gospel-of-Mark
witness, useful for comparison but not full coverage. Its OCR also requires
page verification before any Scripture reuse.

The old locale provenance URL
`github.com/hayksahnazaryan/bible-ararat` returned HTTP 404 from GitHub's API
in this investigation. Existing factual book labels remain; that link cannot
currently serve as a downloadable full Scripture source or a rights grant.

Evidence:

- https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=ArmEastern
- `build/sources/arm-eastern/AUDIT.md` and `source-info.json`.
- `build/sources/arm-eastern-1800s/source-info.json`.
- `build/sources/locale-hy.names.json`.
- https://archive.org/details/bibleinmodernarm00cons
- https://scripture.dbs.org/books/Armenian-Bible-Ararat-Gospel-of-Mark/

## Grabar: printed edition versus digital editorial contributions

### Zohrab 1805

TITUS identifies its digitized Armenian NT as based on Hovhannes Zohrabian's
Venice 1805 edition and credits modern transcription/editorial contributors.
Its general terms permit attributed scholarly use and prohibit commercial
use; these do not establish unrestricted offline app/public-repository
redistribution. Use it as a comparison witness unless rights are clarified.
Its inspected text collection is NT, not proof of full OT coverage.

Historical scans are also available (Digital Bible Society/Internet Archive
Zohrab NT). Bibles.org.uk lists a typeset Zohrab Bible for sale; that listing
does not provide a public source-code grant for this title. An exact original
print/scan and independently verified transcription remain a viable historical
route. Keep new introductions/apparatus and editorial datasets separate.

Sources:

- https://titus.uni-frankfurt.de/texte/etcs/arm/zohrab/armnt/armntt.htm
- https://titus.uni-frankfurt.de/texte/textex.htm
- https://scripture.dbs.org/books/Armenian-Zohrab-Bible-New-Testament-1805/
- https://bibles.org.uk/books.html

### Bagratuni / Armenian Cathedral interlinear

The current cathedral site identifies **Classical Armenian [1895 Bagratuni]**
with English concordance, distinct from Zohrab 1805. It offers linked words and
lexical material. The earlier project audit recorded reserved rights on the
modern tagging/lexicon; this turn established no permissive reuse grant for
those contributions. Do not copy a tagged interlinear simply because the
underlying historic Scripture is old. Text-only edition selection and permission
for annotations are separate decisions; native book inventory requires auditing.

Sources: https://bible.armeniancathedral.org/ and the Armenian-interlinear
investigation section in `PROJECT_HISTORY.md`.

### CC0 repository lead: promising format, unready content

`armantark/arm-bible-translations` contains structured book JSON, Western
renderings/English and an optional Classical column. Its README specifies
CC0 for original content contributions, MIT for code, and separate possible
rights for underlying sources. It also explicitly documents omitted verses
and merged content anomalies in its source DOCX. This is an editing/translation
project, not an automatically verified complete Grabar or 1853 Western edition.
Confirm authorship, print base, completion/review and populated Classical fields
before choosing any of its text. Do not use a CC0 badge to patch our cache
from an unidentified different translation.

Source: https://github.com/armantark/arm-bible-translations

## Architecture for the permanent Armenian collection

1. Separate identities for register, exact edition, orthography, textual
   tradition, scope and source witness. Preserve original spelling/punctuation;
   do not convert Western/Eastern/Grabar wording into each other.
2. Edition-specific book inventories. The current Catholic 73-book skeleton
   is not sufficient evidence for the desired Armenian collection. Audit the
   extra OT works, numbering/order, additions and appendices in each selected
   witness; distinguish included Scripture from appendices. Extend navigation
   from verified inventories, without fabricating absent Armenian text.
3. Store labelled native source units before comparison. Separate reliable
   source references, actual omissions, combined units and corrupt digital
   indexes. Row alignment requires evidence; equal array lengths do not suffice.
4. Never silently fill one register/edition from another. Any restoration must
   cite a matching witness and maintain an explicit evidence/change ledger.
   If source meaning/boundary is unresolved, keep the unit intact and independent.
5. Shared Armenian reference input with register-appropriate names; clarify
   collisions and spelling aliases. Search transformations must map back to
   original text; no spelling modernization in stored/copyable Scripture.
6. Immutable source bytes, hashes, rights evidence, print/page references and
   reproducible extraction. OCR is a draft until visually checked, not a
   publishable Bible simply because it produces Armenian Unicode.

## Recommended next work

Start with a **Western source replacement/re-extraction pilot**, using John 6,
Mark 8–9 and 2 Corinthians 2/6 against an identified printed witness. This
targets the existing corruption and original project goal directly. Accept
the source only after the causes are distinguished; then finish the whole NT
and full Western OT coverage from a matching edition.

The accepted targets are **New Etchmiadzin 2017** and **Zohrab 1805**. Settle
Eastern app-bundling and public-repository permissions separately, and establish
the Grabar source artifact while keeping Bagratuni separate. Permission
requests require the user's explicit authorization to contact publishers;
none were sent. A reliable historical source may avoid that route.

Codex handles these source/edition/versification decisions. Once implementation
and basic functionality are established, manually hand routine independent
fidelity checks, dedicated tests, regression, fixes, staged diff and commit/push
to DeepSeek as specified in README. Do not alter the active KSZI work.
