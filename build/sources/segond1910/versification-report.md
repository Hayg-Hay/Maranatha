# Segond 1910 versification — classification report

Generated 2026-09-26T14:22:51.627Z by `build/analyze-segond1910-versification.mjs`.

Analysis only. No data file or importer was modified. Source:
`build/sources/segond1910/fraLSG_vpl.txt` vs KJV/WEB-shaped `data/canon.js`.

> The classification tables below are computed against the **raw**, pre-transform
> fraLSG source. Rows marked `boundary-candidate` / `unexplained` / `wider-span`
> are candidates only; the reviewed, approved outcome is in the
> **Final reviewed disposition** section at the end of this report.

## Summary

- Chapters with a nonzero diff (excluding provisional books): **112**
- Rule 1 (Psalm superscription) PASS: **61** Psalms
- Rule 1 REVIEW (vocab ok, >150 chars): 1
- Rule 1 FAIL-VOCAB: 0
- Rule 1 UNEXPECTED (diff not 0/1/2): 0
- Rule 2 conserving adjacent windows detected: **15**
- Rule 2 wider-span (4+ ch) exact-conserving candidates: **2**
- Unresolved nonzero chapters: **21**
  - wider-span: 5; unexplained: 7; provisional: 5; boundary-candidate: 3; known-variant: 1

### Rule 2 windows at a glance

| book | chapters | diffs | sum |
|---|---|---|---|
| EXO | 7..8 | 4, -4 | 0 |
| LEV | 5..6 | 7, -7 | 0 |
| NUM | 29..30 | -1, 1 | 0 |
| 1SA | 23..24 | -1, 1 | 0 |
| 2CH | 13..14 | 1, -1 | 0 |
| ECC | 4..5 | 1, -1 | 0 |
| ECC | 11..12 | -2, 2 | 0 |
| SNG | 6..7 | -1, 1 | 0 |
| ISA | 8..9 | 1, -1 | 0 |
| EZK | 20..21 | -5, 5 | 0 |
| HOS | 1..2 | -2, 2 | 0 |
| HOS | 11..12 | -1, 1 | 0 |
| JON | 1..2 | -1, 1 | 0 |
| MIC | 4..5 | 1, -1 | 0 |
| NAM | 1..2 | -1, 1 | 0 |

## Rule 1 — full Psalm classification log (all 150 chapters)

`outcome`: PASS = title offset applied (after review); REVIEW = vocabulary matched but a leading verse exceeds 150 chars (NOT applied); FAIL-VOCAB = no title vocabulary (NOT applied); NO-OFFSET = counts already match; UNEXPECTED = diff not 0/1/2.

| ch | canon | segond | k | matched markers | leading lengths | outcome |
|---|---|---|---|---|---|---|
| 1 | 6 | 6 | 0 | — | — | NO-OFFSET |
| 2 | 12 | 12 | 0 | — | — | NO-OFFSET |
| 3 | 8 | 9 | 1 | psaume, de david | 67 | PASS |
| 4 | 8 | 9 | 1 | au chef des chantres, psaume, de david | 65 | PASS |
| 5 | 12 | 13 | 1 | au chef des chantres, psaume, de david | 55 | PASS |
| 6 | 10 | 11 | 1 | au chef des chantres, psaume, de david | 93 | PASS |
| 7 | 17 | 18 | 1 | de david | 71 | PASS |
| 8 | 9 | 10 | 1 | au chef des chantres, psaume, de david | 56 | PASS |
| 9 | 20 | 21 | 1 | au chef des chantres, psaume, de david | 64 | PASS |
| 10 | 18 | 18 | 0 | — | — | NO-OFFSET |
| 11 | 7 | 7 | 0 | — | — | NO-OFFSET |
| 12 | 8 | 9 | 1 | au chef des chantres, psaume, de david | 66 | PASS |
| 13 | 6 | 6 | 0 | — | — | NO-OFFSET |
| 14 | 7 | 7 | 0 | — | — | NO-OFFSET |
| 15 | 5 | 5 | 0 | — | — | NO-OFFSET |
| 16 | 11 | 11 | 0 | — | — | NO-OFFSET |
| 17 | 15 | 15 | 0 | — | — | NO-OFFSET |
| 18 | 50 | 51 | 1 | au chef des chantres, de david, cantique | 204 | REVIEW |
| 19 | 14 | 15 | 1 | au chef des chantres, psaume, de david | 38 | PASS |
| 20 | 9 | 10 | 1 | au chef des chantres, psaume, de david | 38 | PASS |
| 21 | 13 | 14 | 1 | au chef des chantres, psaume, de david | 38 | PASS |
| 22 | 31 | 32 | 1 | au chef des chantres, psaume, de david | 63 | PASS |
| 23 | 6 | 6 | 0 | — | — | NO-OFFSET |
| 24 | 10 | 10 | 0 | — | — | NO-OFFSET |
| 25 | 22 | 22 | 0 | — | — | NO-OFFSET |
| 26 | 12 | 12 | 0 | — | — | NO-OFFSET |
| 27 | 14 | 14 | 0 | — | — | NO-OFFSET |
| 28 | 9 | 9 | 0 | — | — | NO-OFFSET |
| 29 | 11 | 11 | 0 | — | — | NO-OFFSET |
| 30 | 12 | 13 | 1 | psaume, cantique, de david | 57 | PASS |
| 31 | 24 | 25 | 1 | au chef des chantres, psaume, de david | 38 | PASS |
| 32 | 11 | 11 | 0 | — | — | NO-OFFSET |
| 33 | 22 | 22 | 0 | — | — | NO-OFFSET |
| 34 | 22 | 23 | 1 | de david | 98 | PASS |
| 35 | 28 | 28 | 0 | — | — | NO-OFFSET |
| 36 | 12 | 13 | 1 | au chef des chantres, de david | 58 | PASS |
| 37 | 40 | 40 | 0 | — | — | NO-OFFSET |
| 38 | 22 | 23 | 1 | psaume, de david | 31 | PASS |
| 39 | 13 | 14 | 1 | au chef des chantres, psaume, de david | 50 | PASS |
| 40 | 17 | 18 | 1 | au chef des chantres, de david, psaume | 39 | PASS |
| 41 | 13 | 14 | 1 | au chef des chantres, psaume, de david | 38 | PASS |
| 42 | 11 | 12 | 1 | au chef des chantres, cantique, des fils de koré | 48 | PASS |
| 43 | 5 | 5 | 0 | — | — | NO-OFFSET |
| 44 | 26 | 27 | 1 | au chef des chantres, des fils de koré, cantique | 49 | PASS |
| 45 | 17 | 18 | 1 | au chef des chantres, des fils de koré, cantique | 77 | PASS |
| 46 | 11 | 12 | 1 | au chef des chantres, des fils de koré, cantique | 62 | PASS |
| 47 | 9 | 10 | 1 | au chef des chantres, des fils de koré, psaume | 47 | PASS |
| 48 | 14 | 15 | 1 | cantique, psaume, des fils de koré | 34 | PASS |
| 49 | 20 | 21 | 1 | au chef des chantres, des fils de koré, psaume | 47 | PASS |
| 50 | 23 | 23 | 0 | — | — | NO-OFFSET |
| 51 | 19 | 21 | 2 | au chef des chantres, psaume, de david | 38, 83 | PASS |
| 52 | 9 | 11 | 2 | au chef des chantres, cantique, de david | 40, 124 | PASS |
| 53 | 6 | 7 | 1 | au chef des chantres, cantique, de david | 54 | PASS |
| 54 | 7 | 9 | 2 | au chef des chantres, cantique, de david | 67, 78 | PASS |
| 55 | 23 | 24 | 1 | au chef des chantres, cantique, de david | 67 | PASS |
| 56 | 13 | 14 | 1 | au chef des chantres, hymne, de david | 122 | PASS |
| 57 | 11 | 12 | 1 | au chef des chantres, hymne, de david | 113 | PASS |
| 58 | 11 | 12 | 1 | au chef des chantres, hymne, de david | 55 | PASS |
| 59 | 17 | 18 | 1 | au chef des chantres, hymne, de david | 115 | PASS |
| 60 | 12 | 14 | 2 | au chef des chantres, hymne, de david | 73, 148 | PASS |
| 61 | 8 | 9 | 1 | au chef des chantres, de david | 57 | PASS |
| 62 | 12 | 13 | 1 | au chef des chantres, psaume, de david | 56 | PASS |
| 63 | 11 | 12 | 1 | psaume, de david | 56 | PASS |
| 64 | 10 | 11 | 1 | au chef des chantres, psaume, de david | 38 | PASS |
| 65 | 13 | 14 | 1 | au chef des chantres, psaume, de david, cantique | 48 | PASS |
| 66 | 20 | 20 | 0 | — | — | NO-OFFSET |
| 67 | 7 | 8 | 1 | au chef des chantres, psaume, cantique | 66 | PASS |
| 68 | 35 | 36 | 1 | au chef des chantres, de david, psaume, cantique | 49 | PASS |
| 69 | 36 | 37 | 1 | au chef des chantres, de david | 44 | PASS |
| 70 | 5 | 6 | 1 | au chef des chantres, de david | 46 | PASS |
| 71 | 24 | 24 | 0 | — | — | NO-OFFSET |
| 72 | 20 | 20 | 0 | — | — | NO-OFFSET |
| 73 | 28 | 28 | 0 | — | — | NO-OFFSET |
| 74 | 23 | 23 | 0 | — | — | NO-OFFSET |
| 75 | 10 | 11 | 1 | au chef des chantres, psaume, cantique | 65 | PASS |
| 76 | 12 | 13 | 1 | au chef des chantres, psaume, cantique | 74 | PASS |
| 77 | 20 | 21 | 1 | au chef des chantres, psaume | 55 | PASS |
| 78 | 72 | 72 | 0 | — | — | NO-OFFSET |
| 79 | 13 | 13 | 0 | — | — | NO-OFFSET |
| 80 | 19 | 20 | 1 | au chef des chantres, psaume | 60 | PASS |
| 81 | 16 | 17 | 1 | au chef des chantres | 48 | PASS |
| 82 | 8 | 8 | 0 | — | — | NO-OFFSET |
| 83 | 18 | 19 | 1 | cantique, psaume | 25 | PASS |
| 84 | 12 | 13 | 1 | au chef des chantres, des fils de koré, psaume | 65 | PASS |
| 85 | 13 | 14 | 1 | au chef des chantres, des fils de koré, psaume | 47 | PASS |
| 86 | 17 | 17 | 0 | — | — | NO-OFFSET |
| 87 | 7 | 7 | 0 | — | — | NO-OFFSET |
| 88 | 18 | 19 | 1 | cantique, psaume, des fils de koré, au chef des chantres | 114 | PASS |
| 89 | 52 | 53 | 1 | cantique | 30 | PASS |
| 90 | 17 | 17 | 0 | — | — | NO-OFFSET |
| 91 | 16 | 16 | 0 | — | — | NO-OFFSET |
| 92 | 15 | 16 | 1 | psaume, cantique | 40 | PASS |
| 93 | 5 | 5 | 0 | — | — | NO-OFFSET |
| 94 | 23 | 23 | 0 | — | — | NO-OFFSET |
| 95 | 11 | 11 | 0 | — | — | NO-OFFSET |
| 96 | 13 | 13 | 0 | — | — | NO-OFFSET |
| 97 | 12 | 12 | 0 | — | — | NO-OFFSET |
| 98 | 9 | 9 | 0 | — | — | NO-OFFSET |
| 99 | 9 | 9 | 0 | — | — | NO-OFFSET |
| 100 | 5 | 5 | 0 | — | — | NO-OFFSET |
| 101 | 8 | 8 | 0 | — | — | NO-OFFSET |
| 102 | 28 | 29 | 1 | prière | 89 | PASS |
| 103 | 22 | 22 | 0 | — | — | NO-OFFSET |
| 104 | 35 | 35 | 0 | — | — | NO-OFFSET |
| 105 | 45 | 45 | 0 | — | — | NO-OFFSET |
| 106 | 48 | 48 | 0 | — | — | NO-OFFSET |
| 107 | 43 | 43 | 0 | — | — | NO-OFFSET |
| 108 | 13 | 14 | 1 | cantique, psaume, de david | 26 | PASS |
| 109 | 31 | 31 | 0 | — | — | NO-OFFSET |
| 110 | 7 | 7 | 0 | — | — | NO-OFFSET |
| 111 | 10 | 10 | 0 | — | — | NO-OFFSET |
| 112 | 10 | 10 | 0 | — | — | NO-OFFSET |
| 113 | 9 | 9 | 0 | — | — | NO-OFFSET |
| 114 | 8 | 8 | 0 | — | — | NO-OFFSET |
| 115 | 18 | 18 | 0 | — | — | NO-OFFSET |
| 116 | 19 | 19 | 0 | — | — | NO-OFFSET |
| 117 | 2 | 2 | 0 | — | — | NO-OFFSET |
| 118 | 29 | 29 | 0 | — | — | NO-OFFSET |
| 119 | 176 | 176 | 0 | — | — | NO-OFFSET |
| 120 | 7 | 7 | 0 | — | — | NO-OFFSET |
| 121 | 8 | 8 | 0 | — | — | NO-OFFSET |
| 122 | 9 | 9 | 0 | — | — | NO-OFFSET |
| 123 | 4 | 4 | 0 | — | — | NO-OFFSET |
| 124 | 8 | 8 | 0 | — | — | NO-OFFSET |
| 125 | 5 | 5 | 0 | — | — | NO-OFFSET |
| 126 | 6 | 6 | 0 | — | — | NO-OFFSET |
| 127 | 5 | 5 | 0 | — | — | NO-OFFSET |
| 128 | 6 | 6 | 0 | — | — | NO-OFFSET |
| 129 | 8 | 8 | 0 | — | — | NO-OFFSET |
| 130 | 8 | 8 | 0 | — | — | NO-OFFSET |
| 131 | 3 | 3 | 0 | — | — | NO-OFFSET |
| 132 | 18 | 18 | 0 | — | — | NO-OFFSET |
| 133 | 3 | 3 | 0 | — | — | NO-OFFSET |
| 134 | 3 | 3 | 0 | — | — | NO-OFFSET |
| 135 | 21 | 21 | 0 | — | — | NO-OFFSET |
| 136 | 26 | 26 | 0 | — | — | NO-OFFSET |
| 137 | 9 | 9 | 0 | — | — | NO-OFFSET |
| 138 | 8 | 8 | 0 | — | — | NO-OFFSET |
| 139 | 24 | 24 | 0 | — | — | NO-OFFSET |
| 140 | 13 | 14 | 1 | au chef des chantres, psaume, de david | 38 | PASS |
| 141 | 10 | 10 | 0 | — | — | NO-OFFSET |
| 142 | 7 | 8 | 1 | cantique, de david, prière | 59 | PASS |
| 143 | 12 | 12 | 0 | — | — | NO-OFFSET |
| 144 | 15 | 15 | 0 | — | — | NO-OFFSET |
| 145 | 21 | 21 | 0 | — | — | NO-OFFSET |
| 146 | 10 | 10 | 0 | — | — | NO-OFFSET |
| 147 | 20 | 20 | 0 | — | — | NO-OFFSET |
| 148 | 14 | 14 | 0 | — | — | NO-OFFSET |
| 149 | 9 | 9 | 0 | — | — | NO-OFFSET |
| 150 | 6 | 6 | 0 | — | — | NO-OFFSET |

### Rule 1 REVIEW (needs manual look)

- PSA 18: k=1, matched=[au chef des chantres, de david, cantique], lengths=[204] — "Au chef des chantres. Du serviteur de l’Éternel, de David, qui adressa à l’Éternel les paroles de ce cantique, lorsque l’Éternel l’eut délivré de la main de tous ses ennemis et de la main de Saül. Il dit:"

### Rule 1 FAIL-VOCAB (needs manual look)

_none_

### Rule 1 UNEXPECTED

_none_

## Rule 1 — superscription text captured for `titles` (PASS only)

| ch | title text |
|---|---|
| 3 | Psaume de David. A l’occasion de sa fuite devant Absalom, son fils. |
| 4 | Au chef des chantres. Avec instruments à cordes. Psaume de David. |
| 5 | Au chef des chantres. Avec les flûtes. Psaume de David. |
| 6 | Au chef des chantres. Avec instruments à cordes. Sur la harpe à huit cordes. Psaume de David. |
| 7 | Complainte de David. Chantée à l’Éternel, au sujet de Cusch, Benjamite. |
| 8 | Au chef des chantres. Sur la guitthith. Psaume de David. |
| 9 | Au chef des chantres. Sur “Meurs pour le fils”. Psaume de David. |
| 12 | Au chef des chantres. Sur la harpe à huit cordes. Psaume de David. |
| 19 | Au chef des chantres. Psaume de David. |
| 20 | Au chef des chantres. Psaume de David. |
| 21 | Au chef des chantres. Psaume de David. |
| 22 | Au chef des chantres. Sur “Biche de l’aurore”. Psaume de David. |
| 30 | Psaume. Cantique pour la dédicace de la maison. De David. |
| 31 | Au chef des chantres. Psaume de David. |
| 34 | De David. Lorsqu’il contrefit l’insensé en présence d’Abimélec, et qu’il s’en alla chassé par lui. |
| 36 | Au chef des chantres. Du serviteur de l’Éternel, de David. |
| 38 | Psaume de David. Pour souvenir. |
| 39 | Au chef des chantres. A Jeduthun, Psaume de David. |
| 40 | Au chef des chantres. De David. Psaume. |
| 41 | Au chef des chantres. Psaume de David. |
| 42 | Au chef des chantres. Cantique des fils de Koré. |
| 44 | Au chef des chantres. Des fils de Koré. Cantique. |
| 45 | Au chef des chantres. Sur les lis. Des fils de Koré. Cantique. Chant d’amour. |
| 46 | Au chef des chantres. Des fils de Koré. Sur alamoth. Cantique. |
| 47 | Au chef des chantres. Des fils de Koré. Psaume. |
| 48 | Cantique. Psaume des fils de Koré. |
| 49 | Au chef des chantres. Des fils de Koré. Psaume. |
| 51 | Au chef des chantres. Psaume de David. Lorsque Nathan, le prophète, vint à lui, après que David fut allé vers Bath-Schéba. |
| 52 | Au chef des chantres. Cantique de David. A l’occasion du rapport que Doëg, l’Édomite, vint faire à Saül, en lui disant: David s’est rendu dans la maison d’Achimélec. |
| 53 | Au chef des chantres. Sur la flûte. Cantique de David. |
| 54 | Au chef des chantres. Avec instruments à cordes. Cantique de David. Lorsque les Ziphiens vinrent dire à Saül: David n’est-il pas caché parmi nous? |
| 55 | Au chef des chantres. Avec instruments à cordes. Cantique de David. |
| 56 | Au chef des chantres. Sur “Colombe des térébinthes lointains”. Hymne de David. Lorsque les Philistins le saisirent à Gath. |
| 57 | Au chef des chantres. “Ne détruis pas.” Hymne de David. Lorsqu’il se réfugia dans la caverne, poursuivi par Saül. |
| 58 | Au chef des chantres. “Ne détruis pas.” Hymne de David. |
| 59 | Au chef des chantres. “Ne détruis pas.” Hymne de David. Lorsque Saül envoya cerner la maison, pour le faire mourir. |
| 60 | Au chef des chantres. Sur le lis lyrique. Hymne de David, pour enseigner. Lorsqu’il fit la guerre aux Syriens de Mésopotamie et aux Syriens de Tsoba, et que Joab revint et battit dans la vallée du sel douze mille Édomites. |
| 61 | Au chef des chantres. Sur instruments à cordes. De David. |
| 62 | Au chef des chantres. D’après Jeduthun. Psaume de David. |
| 63 | Psaume de David. Lorsqu’il était dans le désert de Juda. |
| 64 | Au chef des chantres. Psaume de David. |
| 65 | Au chef des chantres. Psaume de David. Cantique. |
| 67 | Au chef des chantres. Avec instruments à cordes. Psaume. Cantique. |
| 68 | Au chef des chantres. De David. Psaume. Cantique. |
| 69 | Au chef des chantres. Sur les lis. De David. |
| 70 | Au chef des chantres. De David. Pour souvenir. |
| 75 | Au chef des chantres. “Ne détruis pas.” Psaume d’Asaph. Cantique. |
| 76 | Au chef des chantres. Avec instruments à cordes. Psaume d’Asaph. Cantique. |
| 77 | Au chef des chantres. D’après Jeduthun. Psaume d’Asaph. |
| 80 | Au chef des chantres. Sur les lis lyriques. D’Asaph. Psaume. |
| 81 | Au chef des chantres. Sur la guitthith. D’Asaph. |
| 83 | Cantique. Psaume d’Asaph. |
| 84 | Au chef des chantres. Sur la guitthith. Des fils de Koré. Psaume. |
| 85 | Au chef des chantres. Des fils de Koré. Psaume. |
| 88 | Cantique. Psaume des fils de Koré. Au chef des chantres. Pour chanter sur la flûte. Cantique d’Héman, l’Ezrachite. |
| 89 | Cantique d’Éthan, l’Ezrachite. |
| 92 | Psaume. Cantique pour le jour du sabbat. |
| 102 | Prière d’un malheureux, lorsqu’il est abattu et qu’il répand sa plainte devant l’Éternel. |
| 108 | Cantique. Psaume de David. |
| 140 | Au chef des chantres. Psaume de David. |
| 142 | Cantique de David. Lorsqu’il était dans la caverne. Prière. |

## Rule 2 — all adjacent chapter-pair conservation checks

Every consecutive pair where at least one chapter differs. `sum` must be 0 (pass) for Rule 2 to apply.

| book | ch | diff a | ch | diff b | sum | pass? |
|---|---|---|---|---|---|---|
| EXO | 6 | 0 | 7 | 4 | 4 | no |
| EXO | 7 | 4 | 8 | -4 | 0 | PASS |
| EXO | 8 | -4 | 9 | 0 | -4 | no |
| LEV | 4 | 0 | 5 | 7 | 7 | no |
| LEV | 5 | 7 | 6 | -7 | 0 | PASS |
| LEV | 6 | -7 | 7 | 0 | -7 | no |
| NUM | 28 | 0 | 29 | -1 | -1 | no |
| NUM | 29 | -1 | 30 | 1 | 0 | PASS |
| NUM | 30 | 1 | 31 | 0 | 1 | no |
| 1SA | 19 | 0 | 20 | 1 | 1 | no |
| 1SA | 20 | 1 | 21 | 0 | 1 | no |
| 1SA | 22 | 0 | 23 | -1 | -1 | no |
| 1SA | 23 | -1 | 24 | 1 | 0 | PASS |
| 1SA | 24 | 1 | 25 | 0 | 1 | no |
| 1KI | 21 | 0 | 22 | 1 | 1 | no |
| 2CH | 12 | 0 | 13 | 1 | 1 | no |
| 2CH | 13 | 1 | 14 | -1 | 0 | PASS |
| 2CH | 14 | -1 | 15 | 0 | -1 | no |
| JOB | 33 | 0 | 34 | -1 | -1 | no |
| JOB | 34 | -1 | 35 | 0 | -1 | no |
| JOB | 37 | 0 | 38 | -3 | -3 | no |
| JOB | 38 | -3 | 39 | 8 | 5 | no |
| JOB | 39 | 8 | 40 | 4 | 12 | no |
| JOB | 40 | 4 | 41 | -9 | -5 | no |
| JOB | 41 | -9 | 42 | 0 | -9 | no |
| PSA | 2 | 0 | 3 | 1 | 1 | no |
| PSA | 3 | 1 | 4 | 1 | 2 | no |
| PSA | 4 | 1 | 5 | 1 | 2 | no |
| PSA | 5 | 1 | 6 | 1 | 2 | no |
| PSA | 6 | 1 | 7 | 1 | 2 | no |
| PSA | 7 | 1 | 8 | 1 | 2 | no |
| PSA | 8 | 1 | 9 | 1 | 2 | no |
| PSA | 9 | 1 | 10 | 0 | 1 | no |
| PSA | 11 | 0 | 12 | 1 | 1 | no |
| PSA | 12 | 1 | 13 | 0 | 1 | no |
| PSA | 17 | 0 | 18 | 1 | 1 | no |
| PSA | 18 | 1 | 19 | 1 | 2 | no |
| PSA | 19 | 1 | 20 | 1 | 2 | no |
| PSA | 20 | 1 | 21 | 1 | 2 | no |
| PSA | 21 | 1 | 22 | 1 | 2 | no |
| PSA | 22 | 1 | 23 | 0 | 1 | no |
| PSA | 29 | 0 | 30 | 1 | 1 | no |
| PSA | 30 | 1 | 31 | 1 | 2 | no |
| PSA | 31 | 1 | 32 | 0 | 1 | no |
| PSA | 33 | 0 | 34 | 1 | 1 | no |
| PSA | 34 | 1 | 35 | 0 | 1 | no |
| PSA | 35 | 0 | 36 | 1 | 1 | no |
| PSA | 36 | 1 | 37 | 0 | 1 | no |
| PSA | 37 | 0 | 38 | 1 | 1 | no |
| PSA | 38 | 1 | 39 | 1 | 2 | no |
| PSA | 39 | 1 | 40 | 1 | 2 | no |
| PSA | 40 | 1 | 41 | 1 | 2 | no |
| PSA | 41 | 1 | 42 | 1 | 2 | no |
| PSA | 42 | 1 | 43 | 0 | 1 | no |
| PSA | 43 | 0 | 44 | 1 | 1 | no |
| PSA | 44 | 1 | 45 | 1 | 2 | no |
| PSA | 45 | 1 | 46 | 1 | 2 | no |
| PSA | 46 | 1 | 47 | 1 | 2 | no |
| PSA | 47 | 1 | 48 | 1 | 2 | no |
| PSA | 48 | 1 | 49 | 1 | 2 | no |
| PSA | 49 | 1 | 50 | 0 | 1 | no |
| PSA | 50 | 0 | 51 | 2 | 2 | no |
| PSA | 51 | 2 | 52 | 2 | 4 | no |
| PSA | 52 | 2 | 53 | 1 | 3 | no |
| PSA | 53 | 1 | 54 | 2 | 3 | no |
| PSA | 54 | 2 | 55 | 1 | 3 | no |
| PSA | 55 | 1 | 56 | 1 | 2 | no |
| PSA | 56 | 1 | 57 | 1 | 2 | no |
| PSA | 57 | 1 | 58 | 1 | 2 | no |
| PSA | 58 | 1 | 59 | 1 | 2 | no |
| PSA | 59 | 1 | 60 | 2 | 3 | no |
| PSA | 60 | 2 | 61 | 1 | 3 | no |
| PSA | 61 | 1 | 62 | 1 | 2 | no |
| PSA | 62 | 1 | 63 | 1 | 2 | no |
| PSA | 63 | 1 | 64 | 1 | 2 | no |
| PSA | 64 | 1 | 65 | 1 | 2 | no |
| PSA | 65 | 1 | 66 | 0 | 1 | no |
| PSA | 66 | 0 | 67 | 1 | 1 | no |
| PSA | 67 | 1 | 68 | 1 | 2 | no |
| PSA | 68 | 1 | 69 | 1 | 2 | no |
| PSA | 69 | 1 | 70 | 1 | 2 | no |
| PSA | 70 | 1 | 71 | 0 | 1 | no |
| PSA | 74 | 0 | 75 | 1 | 1 | no |
| PSA | 75 | 1 | 76 | 1 | 2 | no |
| PSA | 76 | 1 | 77 | 1 | 2 | no |
| PSA | 77 | 1 | 78 | 0 | 1 | no |
| PSA | 79 | 0 | 80 | 1 | 1 | no |
| PSA | 80 | 1 | 81 | 1 | 2 | no |
| PSA | 81 | 1 | 82 | 0 | 1 | no |
| PSA | 82 | 0 | 83 | 1 | 1 | no |
| PSA | 83 | 1 | 84 | 1 | 2 | no |
| PSA | 84 | 1 | 85 | 1 | 2 | no |
| PSA | 85 | 1 | 86 | 0 | 1 | no |
| PSA | 87 | 0 | 88 | 1 | 1 | no |
| PSA | 88 | 1 | 89 | 1 | 2 | no |
| PSA | 89 | 1 | 90 | 0 | 1 | no |
| PSA | 91 | 0 | 92 | 1 | 1 | no |
| PSA | 92 | 1 | 93 | 0 | 1 | no |
| PSA | 101 | 0 | 102 | 1 | 1 | no |
| PSA | 102 | 1 | 103 | 0 | 1 | no |
| PSA | 107 | 0 | 108 | 1 | 1 | no |
| PSA | 108 | 1 | 109 | 0 | 1 | no |
| PSA | 139 | 0 | 140 | 1 | 1 | no |
| PSA | 140 | 1 | 141 | 0 | 1 | no |
| PSA | 141 | 0 | 142 | 1 | 1 | no |
| PSA | 142 | 1 | 143 | 0 | 1 | no |
| ECC | 3 | 0 | 4 | 1 | 1 | no |
| ECC | 4 | 1 | 5 | -1 | 0 | PASS |
| ECC | 5 | -1 | 6 | 0 | -1 | no |
| ECC | 10 | 0 | 11 | -2 | -2 | no |
| ECC | 11 | -2 | 12 | 2 | 0 | PASS |
| SNG | 5 | 0 | 6 | -1 | -1 | no |
| SNG | 6 | -1 | 7 | 1 | 0 | PASS |
| SNG | 7 | 1 | 8 | 0 | 1 | no |
| ISA | 7 | 0 | 8 | 1 | 1 | no |
| ISA | 8 | 1 | 9 | -1 | 0 | PASS |
| ISA | 9 | -1 | 10 | 0 | -1 | no |
| ISA | 63 | 0 | 64 | -1 | -1 | no |
| ISA | 64 | -1 | 65 | 0 | -1 | no |
| EZK | 19 | 0 | 20 | -5 | -5 | no |
| EZK | 20 | -5 | 21 | 5 | 0 | PASS |
| EZK | 21 | 5 | 22 | 0 | 5 | no |
| HOS | 1 | -2 | 2 | 2 | 0 | PASS |
| HOS | 2 | 2 | 3 | 0 | 2 | no |
| HOS | 10 | 0 | 11 | -1 | -1 | no |
| HOS | 11 | -1 | 12 | 1 | 0 | PASS |
| HOS | 12 | 1 | 13 | 0 | 1 | no |
| JON | 1 | -1 | 2 | 1 | 0 | PASS |
| JON | 2 | 1 | 3 | 0 | 1 | no |
| MIC | 3 | 0 | 4 | 1 | 1 | no |
| MIC | 4 | 1 | 5 | -1 | 0 | PASS |
| MIC | 5 | -1 | 6 | 0 | -1 | no |
| NAM | 1 | -1 | 2 | 1 | 0 | PASS |
| NAM | 2 | 1 | 3 | 0 | 1 | no |
| MRK | 8 | 0 | 9 | 1 | 1 | no |
| MRK | 9 | 1 | 10 | 1 | 2 | no |
| MRK | 10 | 1 | 11 | 0 | 1 | no |
| ACT | 18 | 0 | 19 | -1 | -1 | no |
| ACT | 19 | -1 | 20 | 0 | -1 | no |
| ROM | 13 | 0 | 14 | -3 | -3 | no |
| ROM | 14 | -3 | 15 | 0 | -3 | no |
| 2CO | 12 | 0 | 13 | -1 | -1 | no |
| REV | 11 | 0 | 12 | 1 | 1 | no |
| REV | 12 | 1 | 13 | 0 | 1 | no |

## Rule 2 — conserving windows, with boundary text

### EXO 7..8 (diffs 4, -4, sum 0)

Boundary EXO 7 → 8:

- segond EXO 7:28 — Le fleuve fourmillera de grenouilles; elles monteront, et elles entreront dans ta maison, dans ta chambre à coucher et dans ton lit, dans la maison de tes serviteurs et dans celles de ton peuple, dans tes fours et dans tes pétrins.
- segond EXO 7:29 — Les grenouilles monteront sur toi, sur ton peuple, et sur tous tes serviteurs.
- segond EXO 8:1 — L’Éternel dit à Moïse: Dis à Aaron: Étends ta main avec ta verge sur les rivières, sur les ruisseaux et sur les étangs, et fais monter les grenouilles sur le pays d’Égypte.
- segond EXO 8:2 — Aaron étendit sa main sur les eaux de l’Égypte; et les grenouilles montèrent et couvrirent le pays d’Égypte.

### LEV 5..6 (diffs 7, -7, sum 0)

Boundary LEV 5 → 6:

- segond LEV 5:25 — Il présentera au sacrificateur en sacrifice de culpabilité à l’Éternel pour son péché un bélier sans défaut, pris du troupeau d’après ton estimation.
- segond LEV 5:26 — Et le sacrificateur fera pour lui l’expiation devant l’Éternel, et il lui sera pardonné, quelle que soit la faute dont il se sera rendu coupable.
- segond LEV 6:1 — L’Éternel parla à Moïse, et dit:
- segond LEV 6:2 — Donne cet ordre à Aaron et à ses fils, et dis: Voici la loi de l’holocauste. L’holocauste restera sur le foyer de l’autel toute la nuit jusqu’au matin, et le feu brûlera sur l’autel.

### NUM 29..30 (diffs -1, 1, sum 0)

Boundary NUM 29 → 30:

- segond NUM 29:38 — Vous offrirez un bouc en sacrifice d’expiation, outre l’holocauste perpétuel, l’offrande et la libation.
- segond NUM 29:39 — Tels sont les sacrifices que vous offrirez à l’Éternel dans vos fêtes, outre vos holocaustes, vos offrandes et vos libations, et vos sacrifices de prospérité, en accomplissement d’un vœu ou en offrandes volontaires.
- segond NUM 30:1 — Moïse dit aux enfants d’Israël tout ce que l’Éternel lui avait ordonné.
- segond NUM 30:2 — Moïse parla aux chefs des tribus des enfants d’Israël, et dit: Voici ce que l’Éternel ordonne.

### 1SA 23..24 (diffs -1, 1, sum 0)

Boundary 1SA 23 → 24:

- segond 1SA 23:27 — lorsqu’un messager vint dire à Saül: Hâte-toi de venir, car les Philistins ont fait invasion dans le pays.
- segond 1SA 23:28 — Saül cessa de poursuivre David, et il s’en retourna pour aller à la rencontre des Philistins. C’est pourquoi l’on appela ce lieu Séla-Hammachlekoth.
- segond 1SA 24:1 — De là David monta vers les lieux forts d’En-Guédi, où il demeura.
- segond 1SA 24:2 — Lorsque Saül fut revenu de la poursuite des Philistins, on vint lui dire: Voici, David est dans le désert d’En-Guédi.

### 2CH 13..14 (diffs 1, -1, sum 0)

Boundary 2CH 13 → 14:

- segond 2CH 13:22 — Le reste des actions d’Abija, ce qu’il a fait et ce qu’il a dit, cela est écrit dans les mémoires du prophète Iddo.
- segond 2CH 13:23 — Abija se coucha avec ses pères, et on l’enterra dans la ville de David. Et Asa, son fils, régna à sa place. De son temps, le pays fut en repos pendant dix ans.
- segond 2CH 14:1 — Asa fit ce qui est bien et droit aux yeux de l’Éternel, son Dieu.
- segond 2CH 14:2 — Il fit disparaître les autels de l’étranger et les hauts lieux, il brisa les statues et abattit les idoles.

### ECC 4..5 (diffs 1, -1, sum 0)

Boundary ECC 4 → 5:

- segond ECC 4:16 — Il n’y avait point de fin à tout ce peuple, à tous ceux à la tête desquels il était. Et toutefois, ceux qui viendront après ne se réjouiront pas à son sujet. Car c’est encore là une vanité et la poursuite du vent.
- segond ECC 4:17 — Prends garde à ton pied, lorsque tu entres dans la maison de Dieu; approche-toi pour écouter, plutôt que pour offrir le sacrifice des insensés, car ils ne savent pas qu’ils font mal.
- segond ECC 5:1 — Ne te presse pas d’ouvrir la bouche, et que ton cœur ne se hâte pas d’exprimer une parole devant Dieu; car Dieu est au ciel, et toi sur la terre: que tes paroles soient donc peu nombreuses.
- segond ECC 5:2 — Car, si les songes naissent de la multitude des occupations, la voix de l’insensé se fait entendre dans la multitude des paroles.

### ECC 11..12 (diffs -2, 2, sum 0)

Boundary ECC 11 → 12:

- segond ECC 11:7 — La lumière est douce, et il est agréable aux yeux de voir le soleil.
- segond ECC 11:8 — Si donc un homme vit beaucoup d’années, qu’il se réjouisse pendant toutes ces années, et qu’il pense aux jours de ténèbres qui seront nombreux; tout ce qui arrivera est vanité.
- segond ECC 12:1 — Jeune homme, réjouis-toi dans ta jeunesse, livre ton cœur à la joie pendant les jours de ta jeunesse, marche dans les voies de ton cœur et selon les regards de tes yeux; mais sache que pour tout cela Dieu t’appellera en jugement.
- segond ECC 12:2 — Bannis de ton cœur le chagrin, et éloigne le mal de ton corps; car la jeunesse et l’aurore sont vanité.

### SNG 6..7 (diffs -1, 1, sum 0)

Boundary SNG 6 → 7:

- segond SNG 6:11 — Je suis descendue au jardin des noyers, Pour voir la verdure de la vallée, Pour voir si la vigne pousse, Si les grenadiers fleurissent.
- segond SNG 6:12 — Je ne sais, mais mon désir m’a rendue semblable Aux chars de mon noble peuple.
- segond SNG 7:1 — Reviens, reviens, Sulamithe! Reviens, reviens, afin que nous te regardions. Qu’avez-vous à regarder la Sulamithe Comme une danse de deux chœurs?
- segond SNG 7:2 — Que tes pieds sont beaux dans ta chaussure, fille de prince! Les contours de ta hanche sont comme des colliers, Œuvre des mains d’un artiste.

### ISA 8..9 (diffs 1, -1, sum 0)

Boundary ISA 8 → 9:

- segond ISA 8:22 — Puis il regardera vers la terre, Et voici, il n’y aura que détresse, obscurité et de sombres angoisses: Il sera repoussé dans d’épaisses ténèbres.
- segond ISA 8:23 — Mais les ténèbres ne régneront pas toujours Sur la terre où il y a maintenant des angoisses: Si les temps passés ont couvert d’opprobre Le pays de Zabulon et le pays de Nephthali, Les temps à venir couvriront de gloire La contrée voisine de la mer, au-delà du Jourdain, Le territoire des Gentils.
- segond ISA 9:1 — Le peuple qui marchait dans les ténèbres Voit une grande lumière; Sur ceux qui habitaient le pays de l’ombre de la mort Une lumière resplendit.
- segond ISA 9:2 — Tu rends le peuple nombreux, Tu lui accordes de grandes joies; Il se réjouit devant toi, comme on se réjouit à la moisson, Comme on pousse des cris d’allégresse au partage du butin.

### EZK 20..21 (diffs -5, 5, sum 0)

Boundary EZK 20 → 21:

- segond EZK 20:43 — Là vous vous souviendrez de votre conduite et de toutes vos actions par lesquelles vous vous êtes souillés; vous vous prendrez vous-mêmes en dégoût, à cause de toutes les infamies que vous avez commises.
- segond EZK 20:44 — Et vous saurez que je suis l’Éternel, quand j’agirai avec vous par égard pour mon nom, et nullement d’après votre conduite mauvaise et vos actions corrompues, ô maison d’Israël! Dit le Seigneur, l’Éternel.
- segond EZK 21:1 — La parole de l’Éternel me fut adressée, en ces mots:
- segond EZK 21:2 — Fils de l’homme, tourne ta face vers le midi, Et parle contre le midi! Prophétise contre la forêt des champs du midi!

### HOS 1..2 (diffs -2, 2, sum 0)

Boundary HOS 1 → 2:

- segond HOS 1:8 — Elle sevra Lo-Ruchama; puis elle conçut, et enfanta un fils.
- segond HOS 1:9 — Et l’Éternel dit: Donne-lui le nom de Lo-Ammi; car vous n’êtes pas mon peuple, et je ne suis pas votre Dieu.
- segond HOS 2:1 — Cependant le nombre des enfants d’Israël sera comme le sable de la mer, qui ne peut ni se mesurer ni se compter; et au lieu qu’on leur disait: Vous n’êtes pas mon peuple! On leur dira: Fils du Dieu vivant!
- segond HOS 2:2 — Les enfants de Juda et les enfants d’Israël se rassembleront, se donneront un chef, et sortiront du pays; car grande sera la journée de Jizreel.

### HOS 11..12 (diffs -1, 1, sum 0)

Boundary HOS 11 → 12:

- segond HOS 11:10 — Ils suivront l’Éternel, qui rugira comme un lion, Car il rugira, et les enfants accourront de la mer.
- segond HOS 11:11 — Ils accourront de l’Égypte, comme un oiseau, Et du pays d’Assyrie, comme une colombe. Et je les ferai habiter dans leurs maisons, dit l’Éternel.
- segond HOS 12:1 — Éphraïm m’entoure de mensonge, Et la maison d’Israël de tromperie; Juda est encore sans frein vis-à-vis de Dieu, Vis-à-vis du Saint fidèle.
- segond HOS 12:2 — Éphraïm se repaît de vent, et poursuit le vent d’orient; Chaque jour il multiplie le mensonge et la violence; Il fait alliance avec l’Assyrie, Et on porte de l’huile en Égypte.

### JON 1..2 (diffs -1, 1, sum 0)

Boundary JON 1 → 2:

- segond JON 1:15 — Puis ils prirent Jonas, et le jetèrent dans la mer. Et la fureur de la mer s’apaisa.
- segond JON 1:16 — Ces hommes furent saisis d’une grande crainte de l’Éternel, et ils offrirent un sacrifice à l’Éternel, et firent des vœux.
- segond JON 2:1 — L’Éternel fit venir un grand poisson pour engloutir Jonas, et Jonas fut dans le ventre du poisson trois jours et trois nuits.
- segond JON 2:2 — Jonas, dans le ventre du poisson, pria l’Éternel, son Dieu.

### MIC 4..5 (diffs 1, -1, sum 0)

Boundary MIC 4 → 5:

- segond MIC 4:13 — Fille de Sion, lève-toi et foule! Je te ferai une corne de fer et des ongles d’airain, Et tu broieras des peuples nombreux; Tu consacreras leurs biens à l’Éternel, Leurs richesses au Seigneur de toute la terre.
- segond MIC 4:14 — Maintenant, fille de troupes, rassemble tes troupes! On nous assiège; Avec la verge on frappe sur la joue le juge d’Israël.
- segond MIC 5:1 — Et toi, Bethléhem Éphrata, Petite entre les milliers de Juda, De toi sortira pour moi Celui qui dominera sur Israël, Et dont l’origine remonte aux temps anciens, Aux jours de l’éternité.
- segond MIC 5:2 — C’est pourquoi il les livrera Jusqu’au temps où enfantera celle qui doit enfanter, Et le reste de ses frères Reviendra auprès des enfants d’Israël.

### NAM 1..2 (diffs -1, 1, sum 0)

Boundary NAM 1 → 2:

- segond NAM 1:13 — Je briserai maintenant son joug de dessus toi, Et je romprai tes liens…
- segond NAM 1:14 — Voici ce qu’a ordonné sur toi l’Éternel: Tu n’auras plus de descendants qui portent ton nom; J’enlèverai de la maison de ton dieu les images taillées ou en fonte; Je préparerai ton sépulcre, car tu es trop léger.
- segond NAM 2:1 — Voici sur les montagnes Les pieds du messager qui annonce la paix! Célèbre tes fêtes, Juda, accomplis tes vœux! Car le méchant ne passera plus au milieu de toi, Il est entièrement exterminé…
- segond NAM 2:2 — Le destructeur marche contre toi. Garde la forteresse! Veille sur la route! Affermis tes reins! Recueille toute ta force!…

## Rule 2 — wider-span conservation candidates (size >= 4)

Wider windows whose signed diffs sum to exactly zero (not an adjacent pair/triple). Reported for explicit sign-off; nothing is applied yet.

### 1SA 20..23 (diffs 1, 0, 0, -1, sum 0)

Cumulative offset by chapter: 20:1, 21:1, 22:1, 23:0

Boundary 1SA 20 → 21:

- segond 1SA 20:42 — Et Jonathan dit à David: Va en paix, maintenant que nous avons juré l’un et l’autre, au nom de l’Éternel, en disant: Que l’Éternel soit à jamais entre moi et toi, entre ma postérité et ta postérité!
- segond 1SA 20:43 — David se leva, et s’en alla, et Jonathan rentra dans la ville.
- segond 1SA 21:1 — David se rendit à Nob, vers le sacrificateur Achimélec, qui accourut effrayé au-devant de lui et lui dit: Pourquoi es-tu seul et n’y a-t-il personne avec toi?
- segond 1SA 21:2 — David répondit au sacrificateur Achimélec: Le roi m’a donné un ordre et m’a dit: Que personne ne sache rien de l’affaire pour laquelle je t’envoie et de l’ordre que je t’ai donné. J’ai fixé un rendez-vous à mes gens.

Boundary 1SA 21 → 22:

- segond 1SA 21:14 — Akisch dit à ses serviteurs: Vous voyez bien que cet homme a perdu la raison; pourquoi me l’amenez-vous?
- segond 1SA 21:15 — Est-ce que je manque de fous, pour que vous m’ameniez celui-ci et me rendiez témoin de ses extravagances? Faut-il qu’il entre dans ma maison?
- segond 1SA 22:1 — David partit de là, et se sauva dans la caverne d’Adullam. Ses frères et toute la maison de son père l’apprirent, et ils descendirent vers lui.
- segond 1SA 22:2 — Tous ceux qui se trouvaient dans la détresse, qui avaient des créanciers, ou qui étaient mécontents, se rassemblèrent auprès de lui, et il devint leur chef. Ainsi se joignirent à lui environ quatre cents hommes.

Boundary 1SA 22 → 23:

- segond 1SA 22:22 — David dit à Abiathar: J’ai bien pensé ce jour même que Doëg, l’Édomite, se trouvant là, ne manquerait pas d’informer Saül. C’est moi qui suis cause de la mort de toutes les personnes de la maison de ton père.
- segond 1SA 22:23 — Reste avec moi, ne crains rien, car celui qui cherche ma vie cherche la tienne; près de moi tu seras bien gardé.
- segond 1SA 23:1 — On vint dire à David: Voici, les Philistins ont attaqué Keïla, et ils pillent les aires.
- segond 1SA 23:2 — David consulta l’Éternel, en disant: Irai-je, et battrai-je ces Philistins? Et l’Éternel lui répondit: Va, tu battras les Philistins, et tu délivreras Keïla.

### JOB 38..41 (diffs -3, 8, 4, -9, sum 0)

Cumulative offset by chapter: 38:-3, 39:5, 40:9, 41:0

Boundary JOB 38 → 39:

- segond JOB 38:37 — Qui peut avec sagesse compter les nuages, Et verser les outres des cieux,
- segond JOB 38:38 — Pour que la poussière se mette à ruisseler, Et que les mottes de terre se collent ensemble?
- segond JOB 39:1 — Chasses-tu la proie pour la lionne, Et apaises-tu la faim des lionceaux,
- segond JOB 39:2 — Quand ils sont couchés dans leur tanière, Quand ils sont en embuscade dans leur repaire?

Boundary JOB 39 → 40:

- segond JOB 39:37 — Voici, je suis trop peu de chose; que te répliquerais-je? Je mets la main sur ma bouche.
- segond JOB 39:38 — J’ai parlé une fois, je ne répondrai plus; Deux fois, je n’ajouterai rien.
- segond JOB 40:1 — L’Éternel répondit à Job du milieu de la tempête et dit:
- segond JOB 40:2 — Ceins tes reins comme un vaillant homme; Je t’interrogerai, et tu m’instruiras.

Boundary JOB 40 → 41:

- segond JOB 40:27 — Dresse ta main contre lui, Et tu ne t’aviseras plus de l’attaquer.
- segond JOB 40:28 — Voici, on est trompé dans son attente; A son seul aspect n’est-on pas terrassé?
- segond JOB 41:1 — Nul n’est assez hardi pour l’exciter; Qui donc me résisterait en face?
- segond JOB 41:2 — De qui suis-je le débiteur? Je le paierai. Sous le ciel tout m’appartient.

## Needs individual investigation (unresolved)

Nonzero chapter diffs not covered by a Rule 1 PASS or a Rule 2 conserving window. `class`: unexplained = no rule applies; wider-span = part of an exact-conserving 4+ chapter window above; boundary-candidate = raw count mismatch later resolved by seam review as a MERGE/SPLIT (see Final reviewed disposition) — NOT a textual variant; known-variant = already documented; provisional = canon Greek-addition gap.

| book | ch | canon | segond | diff | class | note |
|---|---|---|---|---|---|---|
| 1SA | 20 | 42 | 43 | 1 | wider-span | 1SA 20..23 exact-conserving wider span (diffs 1, 0, 0, -1) |
| 1KI | 22 | 53 | 54 | 1 | unexplained |  |
| EST | 4 | 46 | 17 | -29 | provisional | provisional canon (Greek additions) |
| EST | 10 | 14 | 3 | -11 | provisional | provisional canon (Greek additions) |
| JOB | 34 | 37 | 36 | -1 | unexplained |  |
| JOB | 38 | 41 | 38 | -3 | wider-span | JOB 38..41 exact-conserving wider span (diffs -3, 8, 4, -9) |
| JOB | 39 | 30 | 38 | 8 | wider-span | JOB 38..41 exact-conserving wider span (diffs -3, 8, 4, -9) |
| JOB | 40 | 24 | 28 | 4 | wider-span | JOB 38..41 exact-conserving wider span (diffs -3, 8, 4, -9) |
| JOB | 41 | 34 | 25 | -9 | wider-span | JOB 38..41 exact-conserving wider span (diffs -3, 8, 4, -9) |
| PSA | 18 | 50 | 51 | 1 | unexplained |  |
| ISA | 64 | 12 | 11 | -1 | unexplained |  |
| DAN | 3 | 97 | 30 | -67 | provisional | provisional canon (Greek additions) |
| DAN | 13 | 64 | 0 | -64 | provisional | provisional canon (Greek additions) |
| DAN | 14 | 42 | 0 | -42 | provisional | provisional canon (Greek additions) |
| MRK | 9 | 50 | 51 | 1 | unexplained |  |
| MRK | 10 | 52 | 53 | 1 | unexplained |  |
| ACT | 19 | 41 | 40 | -1 | boundary-candidate | raw count mismatch; later resolved as a MERGE/SPLIT boundary artifact (see Final reviewed disposition) |
| ROM | 14 | 26 | 23 | -3 | known-variant | known-variant acceptedCounts=[23,26] |
| 2CO | 13 | 14 | 13 | -1 | boundary-candidate | raw count mismatch; later resolved as a MERGE/SPLIT boundary artifact (see Final reviewed disposition) |
| 3JN | 1 | 14 | 15 | 1 | boundary-candidate | raw count mismatch; later resolved as a MERGE/SPLIT boundary artifact (see Final reviewed disposition) |
| REV | 12 | 17 | 18 | 1 | unexplained |  |

## Final reviewed disposition

The reviewed, approved set now applied by `build/import-segond1910.mjs`. The
candidate tables above are the raw pre-transform analysis, retained for history.

| transform | count | notes |
|---|---|---|
| Rule 1 — Psalm superscriptions preserved as `titles` | 62 | includes **PSA 18**, explicitly approved despite its 204-char superscription (longest in the Psalter; parallels 2 Sam 22) |
| Rule 2 — chapter windows (order-preserving re-chunk) | 16 | 15 adjacent pairs + the **JOB 38..41** four-chapter cascade |
| MERGEs (two source verses → one canon verse) | 6 | 1SA 20:42+43, 1KI 22:43+44, MRK 9:50+51, MRK 10:52+53, REV 12:18+13:1 (cross-chapter), 3JN 1:14+15 |
| SPLITs (one source verse → two canon verses, unambiguous seam) | 4 | JOB 34:36 → 34:36/37, ISA 63:19 → 63:19/64:1 (cross-chapter), 2CO 13:12 → 13:12/13, ACT 19:40 → 19:40/41 |

Cases originally flagged as suspected textual variants — all resolved as
boundary artifacts by the seam test (full Segond verse vs KJV/WEB target verses):

- **3JN 1:15** — **MERGE**: Segond splits canon 3 John 1:14 into source 14 (`…bouche à bouche.`) + 15 (`Que la paix soit avec toi!…`); no source content omitted or invented.
- **2CO 13:13** — **SPLIT**: Segond merged canon 13:12 + 13:13 into source 13:12; seam `baiser.` / `Tous les saints` (= "holy kiss." / "All the saints…").
- **ACT 19:40** — **SPLIT**: Segond merged canon 19:40 + 19:41 into source 19:40; seam `attroupement.` / `Après ces paroles` (= "this concourse." / "When he had thus spoken…").

Segond validation triggers only the pre-existing ROM 14 known-variant note;
no new known-variants entries were needed. Every newly investigated
non-provisional mismatch outside the existing known-variant cases resolved as
a title, window, MERGE, or SPLIT artifact.

Final validator result (`node build/validate.mjs data/segond1910.json`):
**0 errors, 3 warnings, 1 known-variant info note**. The 3 warnings are canon's
provisional Greek-addition gaps (EST 4, EST 10, DAN); the info note is ROM 14.

