# Noto Sans Coptic

Unmodified regular TTF from Google Fonts, retrieved 2026-10-18:
https://raw.githubusercontent.com/google/fonts/main/ofl/notosanscoptic/NotoSansCoptic-Regular.ttf

Copyright 2022 The Noto Project Authors (https://github.com/notofonts/coptic).
SIL Open Font License 1.1: see `NotoSansCoptic-OFL.txt` in this directory.

Retained upstream `build/sources/bohairica/font-METADATA.pb` identifies the
NotoSansCoptic-v2.004 release and upstream commit
`ed3522436a4e3c41b0479c8d7785facd3c397eaa`.
The source manifest pins the downloaded font and licence bytes, including the
Google Fonts URL. No font modification/subsetting was performed.

Served locally, precached with shell v67. `.coptic-verse` uses this face;
the general UI font stack also includes it as a fallback for Coptic book names.
The focused smoke verifies cmap coverage of Scripture and title code points.
The independent audit confirms the pinned TTF/OFL bytes and licence. Desktop and
mobile-breakpoint headless Chrome review covered Coptic glyphs, the 3 John
combining overline, long-line wrapping and gap/placeholder notices; no
missing-glyph boxes were observed. Physical-device shaping review remains open.
