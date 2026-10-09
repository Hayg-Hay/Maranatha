# Malay editions for Malaysia

Investigation, 2026-10-09. Scope: Malaysian Malay / Bahasa Melayu, not
Indonesian, Malayalam, Baba Malay, or other languages spoken in Malaysia.
No source archive was imported and no application files were changed.

## Finding and recommendation

No readily importable, openly redistributable modern full Malaysian Malay
Bible was established in this investigation. There are two practical paths:
add an available redistributable New Testament now, or obtain permission for
a modern complete Bible. Do not substitute Indonesian AYT for Malay coverage.

### Immediate candidate: KSZI, New Testament only

**Kitab Suci Zabur dan Injil (KSZI)**, eBible artifact `zlmKSZI`, copyright
2013 Pengamat Kitab Mulia. Distributor identifies the text as a contextualized
New Testament in the Malay language of Malaysia. Its published contents list
all 27 New Testament books and no Psalms or other Old Testament books. Do not
infer Psalms coverage from Zabur in the title; audit the archive before import.

eBible provides USFM and USFX downloads and explicitly specifies **CC BY-ND
4.0**, allowing redistribution with attribution while forbidding changes to
Scripture words or punctuation. Keep exact text and clearly separate notes;
technical format conversion must preserve the work. It must not be relabelled
CC BY-SA or treated like the recent Biblica open editions.

Source samples use **Isa al-Masih**, **Yahya**, **Putera Allah**, and **Roh Suci**.
Those are this edition's terminology and must be retained. Its contextualized
style is a reader-facing selection consideration, not a reason to rewrite it.

Sources:

- https://ebible.org/Scriptures/details.php?id=zlmKSZI
- https://ebible.org/zlmKSZI/
- https://ebible.org/zlmKSZI/JHN01.htm
- Listed USFM: https://ebible.org/Scriptures/zlmKSZI_usfm.zip
- Listed USFX: https://ebible.org/Scriptures/zlmKSZI_usfx.zip

### Modern full-Bible candidate: Alkitab Versi Borneo (AVB)

The publisher describes AVB as a formal translation in Standard Malay for
Malaysian readers. Its timeline records the full translation and 2015 AVB
publication, plus deuterocanonical/Catholic edition additions in 2024.
It is a strong candidate if the user wants a modern complete Malay Bible.

**Full offline inclusion needs publisher permission.** Published standard
terms allow limited quotation (up to 1,000 verses, with additional book/work
proportion limits), not redistribution of the complete text. They also restrict
quotations in publications offered under Creative Commons. Request a grant
covering offline bundling, downloadable source text, public repository/source
redistribution, attribution and the app's distribution model. Availability in
their free app or on their website does not establish these permissions.
No publisher was contacted and no permission was requested on the user's behalf.

Sources:

- https://www.alkitabversiborneo.org/about-us
- https://www.alkitabversiborneo.org/about-us/timeline
- https://www.alkitabversiborneo.org/en/terms-and-condition

### Alkitab Berita Baik / Today's Malay Version (ABB/TMV)

Another complete Malaysian Malay option, published by Bible Society of
Malaysia, including versions with deuterocanonical books. The available
publisher-supplied platform listing establishes the edition/publisher, not an
open offline redistribution grant. SABDA's reproduced 1996 copyright notice
limits quotation to 100 verses under stated proportions and requires written
permission for broader use. Later editions must be assessed separately;
the reproduced 1996 terms are not assumed to govern every current revision.
Treat ABB as a permission route until an applicable full-text grant is obtained.

Sources:

- https://www.bible.com/versions/402
- https://sejarah.co/hak_cipta/tmv.htm
- https://copyright.sabda.org/content.php

### Historical lead: Shellabear 1912

SABDA lists an historical full Malay translation, with separate Jawi and Latin
print histories and a 1949 spelling/word revision. Its digital materials are
listed under old Malay and some module listings identify drafts. A modern
reprint's public-domain claim or an openly licensed photograph of a cover is
not sufficient evidence for the exact digital text. Pin a specific artifact,
confirm edition/completeness and redistribution status, and distinguish it
from revised Shellabear texts and the separate Baba Malay New Testament.
Older wording makes this a historical companion rather than the first modern
reading recommendation. No ready import was established here.

Sources:

- https://sejarah.sabda.org/sejarah/ver_shellabear/
- https://labs.sabda.org/Alkitab

## Implementation after selection

Pin source/rights evidence; preserve words, punctuation, names and numbering.
Use Malay labels/reference aliases and accurately disclose NT-only coverage
where applicable. Audit reference and chapter exceptions before enabling
ordinary comparison rows. Keep annotations collapsed below Scripture.

Follow README's allowance-saving workflow: Codex implements architecture and
complex decisions, establishes basic functionality, then supplies a concise
ASCII prompt for manual DeepSeek OpenCode handoff. DeepSeek performs independent
fidelity checks, dedicated tests, npm test, routine fixes/retesting, staged-diff
verification, and commit/push. Escalate unresolved fidelity or architectural
problems back to Codex. No full regression run is needed for this investigation.

## Selected edition

The user selected KSZI. The initial NT-only implementation and basic smoke
check are complete; independent fidelity/tests/regression verification remain
with the manual DeepSeek handoff. See [../KSZI.md](../KSZI.md).
