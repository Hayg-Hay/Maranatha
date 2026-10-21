# Supplemental grammatical annotations

The Greek and Berean NT interlinears display compact chips such as `+Dat`,
`+Gen/Acc` and `+Gen/Dat/Acc`. A chip lists general supported cases, never a
selected case for this occurrence. The controlling button or summary references
a hidden accessible description giving full case names and “General government”.
The chip tooltip gives the same text. The chip border and separately labelled,
dashed supplemental note distinguish grammar from the source data.
Cards align at the top and retain their natural heights, so a grammar line or
expanded note does not stretch every neighboring word card vertically.

In dense cards, activate the native chip/caret disclosure with a click, touch,
Enter or Space. In expandable cards, open the existing word button to read
the supplemental section below the unchanged source/detail rows. Reviewed
expandable cards place the chip and caret together in one footer row. Unresolved
entries have no case chip: the existing disclosure retains the unresolved note;
its dense summary reads “Grammar”. Source links
are explicitly labelled online; all explanations are included locally and
work without opening those links. No additional preference or storage is added.

## Scope and evidence

These notes describe **general NT Greek grammatical case government**, not
syntactic analysis of a verse. They do not identify complements, determine a
case used here, select a contextual meaning or replace an English gloss. The
lookup does not receive surrounding tokens, a verse identifier or a gloss.
No nearby-noun heuristic or ending-based inference is used.

The reference review dated **2026-10-20** consulted the historical **Thayer's
Greek Lexicon** sections reproduced at the per-entry Bible Hub URLs below.
The runtime includes original short summaries and an entry/section citation,
not copied modern topical commentary or the site's generated lexical summaries.
The historical lexicon is the primary reference for this first increment;
the statuses are an implementation reference review, not independent expert
certification or a claim that every occurrence has been syntactically reviewed.
Robertson's grammar was considered during the audit, but its PDF was access
blocked and is not counted as verified evidence for this table.

Examples of the references used:

- [Thayer, G1722, opening and I–II](https://biblehub.com/greek/1722.htm):
  dative government of ἐν, with location, time and instrumental uses.
- [Thayer, G1223, A and B](https://biblehub.com/greek/1223.htm):
  διά with genitive and accusative, including spatial accusative Luke 17:11.
- [Thayer, G4314, I–III](https://biblehub.com/greek/4314.htm):
  πρός with usual accusative, rare dative and rare genitive (Acts 27:34).
- [Thayer, G1451, 1a](https://biblehub.com/greek/1451.htm):
  ἐγγύς with genitive and dative; nearness does not have a simple case/meaning split.
- [Thayer, G3796, b and editorial qualification](https://biblehub.com/greek/3796.htm):
  disagreement about the analysis of ὀψὲ σαββάτων in Matthew 28:1.

“NT” limits the case lists: poetic/classical dative uses of μετά, περί and
ὑπό are not added to NT government lists. The lists are reference grammar,
not claims about which cases occur in every shipped edition. Meaning summaries
give common uses, not exhaustive definitions or mechanical translation rules.
For ἐπί in particular, location and other senses overlap across cases.

## Architecture and preservation

`grammatical-annotations.js` is a standalone classic script loaded before
`app.js`. Its frozen `MARANATHA_GRAMMATICAL_ANNOTATIONS` global exposes a version,
scope, the Greek coverage table and a pure `lookup` function. There is no build
step, module import, runtime network dependency or local `fetch()`.

`lookup({ language, scheme, morph, strongs })` explicitly requires `grc` and one
of two adapters: `berean` accepts exactly `Prep`; `robinson` accepts exactly
`PREP`. Exact positive numeric Strong's identifiers (optionally prefixed `G`)
select entries. Missing, compound or unfamiliar identifiers return unresolved;
spelling and transliteration are never guessed. Surface elision such as
ἐκ/ἐξ and ἀπό/ἀπ/ἀφ works through the source lexical identity.

Only the two Greek interlinear configurations declare `grammarScheme`.
Both rendering paths call the same lookup and shared note helpers, independently
of the existing gloss override pipeline. Source arrays, morphology strings,
glosses, intentional blanks, Strong's dictionary content, fixtures, importers
and downloaded source datasets are not edited. Case abbreviations on nouns
remain their source values: Berean `N-DFS` and Byzantine `N-DSF` are not treated
as the same parsing scheme. Byzantine `N-PRI` does not gain an invented case.

The small module is shell-precached (shell v81); existing translation/interlinear
data cache v3 is retained. A missing module leaves the original interlinear
usable without annotations. New files must accompany the application when it
is copied for local offline use.

Language and morphology scheme are separate from display-language attributes.
`grc` identifies the rules here; the existing `el` DOM language attribute is
unchanged. Future Hebrew, Aramaic or other-language rules need their own table,
scheme adapter, evidence and appropriate annotation kinds (for example bound
prepositions or verbal constructions). They must not inherit Greek case lists
from a Strong's number, an OT/NT flag, or script direction. A generic plugin
registry and occurrence-analysis framework are deliberately not introduced.

## Context, qualifications and unresolved questions

- Different functions are **non-applicable** to this government layer when
  tagged as something other than a preposition. For example, Berean ἕως is
  `Prep` in 1 Corinthians 1:8 and `Conj` in 4:5; ἐγγύς is `Prep` in Acts 1:12
  and `Adv` in Ephesians 2:13. Source tags are respected even when another
  tradition classifies a word differently. No correction is silently imposed.
- ἀνά can be adverbial/distributive without an accusative (Revelation 21:21).
  The note states this exception; the general badge does not assert a case here.
  In ἀνὰ μέσον, a later genitive is not evidence that ἀνά itself governs it.
- ἐπάνω before numerals can mean more than while the numeral's case belongs
  to the larger construction. Its prepositional genitive note is explicitly
  distinguished from that adverbial use.
- χάριν may follow its dependent expression and originates as an accusative
  noun; κύκλῳ is itself an adverbial dative. Neither fact determines the case
  of its dependent expression. Lexicon notation `τίνος` denotes genitive;
  this is lexical reference evidence, not inference from corpus noun tags.
- G1726 **ἐναντίον**: the consulted page did not expose a historical Thayer
  government statement for this identity. A precise grammatical reference
  is still needed; observed neighboring genitives are not a substitute.
- G3796 **ὀψέ**: the historical entry records competing prepositional versus
  adverbial/partitive analyses. No government or chronological decision is made.
- G5238 **ὑπερέκεινα**: Thayer illustrates nominalized `τὰ ὑπερέκεινα τίνος`.
  The status withholds a blanket government claim pending review of that
  nominal/adverbial relation. It does not deny that a genitive occurs there.
- Ellipsis, nested phrases, intervening modifiers, coordinated expressions,
  indeclinables, textual variants, compounds and incomplete parses are not
  resolved by this module. No syntax is fabricated to fill those gaps.

Any later occurrence-specific annotation must be a separate edition-keyed,
reference- and token-guarded record with its own evidence. Berean and Byzantine
positions cannot be interchanged. It must be visibly distinguished from this
general reference layer and from morphology supplied by the source.

## Coverage inventory

All **56** Strong's identities tagged `Prep` in the shipped Berean NT were
examined against the consulted reference entries. **53 reviewed** entries
publish government and qualifications; **3 unresolved** publish only the
reason for withholding it. All **28** identities tagged `PREP` in Byzantine
are included in this inventory. Counts below count Berean `Prep` tokens only,
not every occurrence of a lexical identity or the site's concordance counts.
There are 10,923 such tokens: 10,916 fall under reviewed reference entries and
7 under unresolved entries. These are lexical coverage counts, not verified
occurrence analyses. No entire identity in this preposition-only inventory is
classified non-applicable.

Status definitions:

| Status | Behavior |
| --- | --- |
| reviewed | Reference supports the listed general government; show compact chip and note. |
| unresolved | Review is recorded but government is withheld; show unresolved and reason inside the disclosure, without a case chip. Unknown identities also fail closed to this status. |
| non-applicable | Runtime classification for another language/scheme or a non-preposition token; show nothing. No whole identity in the 56 is excluded solely because it also has other functions. |

Recorded non-applicable examples (separate from the preposition-only counts):

| Identity / context | Source tag | Result |
| --- | --- | --- |
| G2193 ἕως, 1 Corinthians 4:5 | Berean `Conj` | non-applicable; no government badge |
| G4133 πλήν, 1 Corinthians 11:11 | Berean `Conj` | non-applicable; no government badge |
| G1451 ἐγγύς, Ephesians 2:13 | Berean `Adv` | non-applicable; no government badge |
| Hebrew interlinear tokens | Hebrew morphology schemes | non-applicable; no Greek rules |

The inventory table below is checked against the real corpus and runtime table
by `build/test-grammatical-annotations.mjs`. The final column links the consulted
entry; runtime notes specify its historical section. Unresolved URLs record
the consultation, not positive evidence for government.

| Identity | Lemma | Status | Berean tokens | General government | Reference |
| --- | --- | --- | ---: | --- | --- |
| G260 | ἅμα | reviewed | 2 | Dative | [Thayer / entry](https://biblehub.com/greek/260.htm) |
| G303 | ἀνά | reviewed | 5 | Accusative | [Thayer / entry](https://biblehub.com/greek/303.htm) |
| G427 | ἄνευ | reviewed | 3 | Genitive | [Thayer / entry](https://biblehub.com/greek/427.htm) |
| G473 | ἀντί | reviewed | 22 | Genitive | [Thayer / entry](https://biblehub.com/greek/473.htm) |
| G481 | ἄντικρυς | reviewed | 1 | Genitive | [Thayer / entry](https://biblehub.com/greek/481.htm) |
| G495 | ἀντιπέρα | reviewed | 1 | Genitive | [Thayer / entry](https://biblehub.com/greek/495.htm) |
| G561 | ἀπέναντι | reviewed | 5 | Genitive | [Thayer / entry](https://biblehub.com/greek/561.htm) |
| G575 | ἀπό | reviewed | 645 | Genitive | [Thayer / entry](https://biblehub.com/greek/575.htm) |
| G817 | ἄτερ | reviewed | 2 | Genitive | [Thayer / entry](https://biblehub.com/greek/817.htm) |
| G891 | ἄχρι | reviewed | 43 | Genitive | [Thayer / entry](https://biblehub.com/greek/891.htm) |
| G1223 | διά | reviewed | 667 | Genitive / Accusative | [Thayer / entry](https://biblehub.com/greek/1223.htm) |
| G1451 | ἐγγύς | reviewed | 13 | Genitive / Dative | [Thayer / entry](https://biblehub.com/greek/1451.htm) |
| G1519 | εἰς | reviewed | 1768 | Accusative | [Thayer / entry](https://biblehub.com/greek/1519.htm) |
| G1537 | ἐκ | reviewed | 915 | Genitive | [Thayer / entry](https://biblehub.com/greek/1537.htm) |
| G1622 | ἐκτός | reviewed | 4 | Genitive | [Thayer / entry](https://biblehub.com/greek/1622.htm) |
| G1715 | ἔμπροσθεν | reviewed | 44 | Genitive | [Thayer / entry](https://biblehub.com/greek/1715.htm) |
| G1722 | ἐν | reviewed | 2754 | Dative | [Thayer / entry](https://biblehub.com/greek/1722.htm) |
| G1725 | ἔναντι | reviewed | 2 | Genitive | [Thayer / entry](https://biblehub.com/greek/1725.htm) |
| G1726 | ἐναντίον | unresolved | 5 | Withheld | [Thayer / entry](https://biblehub.com/greek/1726.htm) |
| G1752 | ἕνεκα | reviewed | 26 | Genitive | [Thayer / entry](https://biblehub.com/greek/1752.htm) |
| G1787 | ἐντός | reviewed | 1 | Genitive | [Thayer / entry](https://biblehub.com/greek/1787.htm) |
| G1799 | ἐνώπιον | reviewed | 94 | Genitive | [Thayer / entry](https://biblehub.com/greek/1799.htm) |
| G1854 | ἔξω | reviewed | 19 | Genitive | [Thayer / entry](https://biblehub.com/greek/1854.htm) |
| G1855 | ἔξωθεν | reviewed | 2 | Genitive | [Thayer / entry](https://biblehub.com/greek/1855.htm) |
| G1883 | ἐπάνω | reviewed | 17 | Genitive | [Thayer / entry](https://biblehub.com/greek/1883.htm) |
| G1900 | ἐπέκεινα | reviewed | 1 | Genitive | [Thayer / entry](https://biblehub.com/greek/1900.htm) |
| G1909 | ἐπί | reviewed | 890 | Genitive / Dative / Accusative | [Thayer / entry](https://biblehub.com/greek/1909.htm) |
| G2080 | ἔσω | reviewed | 1 | Genitive | [Thayer / entry](https://biblehub.com/greek/2080.htm) |
| G2193 | ἕως | reviewed | 108 | Genitive | [Thayer / entry](https://biblehub.com/greek/2193.htm) |
| G2596 | κατά | reviewed | 473 | Genitive / Accusative | [Thayer / entry](https://biblehub.com/greek/2596.htm) |
| G2713 | κατέναντι | reviewed | 7 | Genitive | [Thayer / entry](https://biblehub.com/greek/2713.htm) |
| G2714 | κατενώπιον | reviewed | 3 | Genitive | [Thayer / entry](https://biblehub.com/greek/2714.htm) |
| G2943 | κυκλόθεν | reviewed | 2 | Genitive | [Thayer / entry](https://biblehub.com/greek/2943.htm) |
| G2945 | κύκλῳ | reviewed | 3 | Genitive | [Thayer / entry](https://biblehub.com/greek/2945.htm) |
| G3326 | μετά | reviewed | 468 | Genitive / Accusative | [Thayer / entry](https://biblehub.com/greek/3326.htm) |
| G3342 | μεταξύ | reviewed | 7 | Genitive | [Thayer / entry](https://biblehub.com/greek/3342.htm) |
| G3360 | μέχρι | reviewed | 16 | Genitive | [Thayer / entry](https://biblehub.com/greek/3360.htm) |
| G3693 | ὄπισθεν | reviewed | 2 | Genitive | [Thayer / entry](https://biblehub.com/greek/3693.htm) |
| G3694 | ὀπίσω | reviewed | 26 | Genitive | [Thayer / entry](https://biblehub.com/greek/3694.htm) |
| G3796 | ὀψέ | unresolved | 1 | Withheld | [Thayer / entry](https://biblehub.com/greek/3796.htm) |
| G3844 | παρά | reviewed | 192 | Genitive / Dative / Accusative | [Thayer / entry](https://biblehub.com/greek/3844.htm) |
| G3924 | παρεκτός | reviewed | 2 | Genitive | [Thayer / entry](https://biblehub.com/greek/3924.htm) |
| G4008 | πέραν | reviewed | 13 | Genitive | [Thayer / entry](https://biblehub.com/greek/4008.htm) |
| G4012 | περί | reviewed | 332 | Genitive / Accusative | [Thayer / entry](https://biblehub.com/greek/4012.htm) |
| G4133 | πλήν | reviewed | 4 | Genitive | [Thayer / entry](https://biblehub.com/greek/4133.htm) |
| G4139 | πλησίον | reviewed | 1 | Genitive | [Thayer / entry](https://biblehub.com/greek/4139.htm) |
| G4253 | πρό | reviewed | 47 | Genitive | [Thayer / entry](https://biblehub.com/greek/4253.htm) |
| G4314 | πρός | reviewed | 702 | Genitive / Dative / Accusative | [Thayer / entry](https://biblehub.com/greek/4314.htm) |
| G4862 | σύν | reviewed | 129 | Dative | [Thayer / entry](https://biblehub.com/greek/4862.htm) |
| G5228 | ὑπέρ | reviewed | 149 | Genitive / Accusative | [Thayer / entry](https://biblehub.com/greek/5228.htm) |
| G5231 | ὑπεράνω | reviewed | 3 | Genitive | [Thayer / entry](https://biblehub.com/greek/5231.htm) |
| G5238 | ὑπερέκεινα | unresolved | 1 | Withheld | [Thayer / entry](https://biblehub.com/greek/5238.htm) |
| G5259 | ὑπό | reviewed | 220 | Genitive / Accusative | [Thayer / entry](https://biblehub.com/greek/5259.htm) |
| G5270 | ὑποκάτω | reviewed | 11 | Genitive | [Thayer / entry](https://biblehub.com/greek/5270.htm) |
| G5484 | χάριν | reviewed | 9 | Genitive | [Thayer / entry](https://biblehub.com/greek/5484.htm) |
| G5565 | χωρίς | reviewed | 40 | Genitive | [Thayer / entry](https://biblehub.com/greek/5565.htm) |

## Verification

Run `npm run test:grammar` for pure lookup checks, full-corpus inventory coverage,
real `file://` app journeys for both Greek interlinears and both modes,
multi-function and unresolved examples, Hebrew isolation, local-only resource
loading, and source preservation (loaded corpora and disk hashes before/after).
The test does not synthesize keyboard events and claim that jsdom implements
native keyboard behavior: native summary structure and existing accessible
button state are checked there; actual key activation needs a real browser.

Also run the existing Berean validator/runtime/offline tests, reviewed Greek
gloss tests, Hebrew interlinear regressions and service-worker tests. The
Berean validator checks generated source hashes against the pre-existing build
metadata, independently of the new runtime immutability checks.

Browser QA should inspect John 6:59 in all four layouts, expand the notes using
the keyboard, and check wrapping at a narrow viewport. Physical mobile devices
and assistive-technology combinations are not certified by DOM tests.

## Compact chip verification — 2026-10-21

Single-case cards retain the 4.5rem minimum width. Two-case cards reserve 6.5rem
and three-case cards 8rem, allowing a readable single-line chip plus caret.
At the default 16px root size these minima are 72px, 104px and 128px, respectively
(border-box); they scale with the reader's font setting. This horizontal space
is deliberate: a three-case chip must not be squeezed or clipped to preserve
the single-case minimum width.

The footer uses normal flow. Dense cards add a chip/caret row; expandable cards
replace the reserved caret space with a chip/caret row. Neither arrangement is
claimed to be height-neutral. DOM tests check the row structure, full accessible
descriptions, nowrap styling and minimum-width rules, but cannot measure pixels.

Generate the local measurement page with:

```text
node build/test-grammatical-annotations.mjs --layout-fixture
```

Open `build/reports/grammar-chip-layout.html` in a normal browser. It captures
real app cards from both editions/modes for one, two and three cases, forces
the narrowest permitted widths, waits for fonts, and reports actual widths,
heights, differences from the same card without supplemental UI, and chip/caret
overlap or overflow. Try root font sizes 16, 18, 20 and 23px and narrow the window.
The expandable-button captures are static layout specimens, not a keyboard
interaction test. The real app's controls still need browser keyboard review.

The connected test browser denied local-file navigation. The user supplied
browser screenshots on 2026-10-21 showing these height increases against the
same-width baseline without supplemental UI (CSS pixels):

| Root font | Dense cards | Expandable cards |
| --- | ---: | ---: |
| 16px | +19.07px | +9.07px |
| 18px | +20.68px | +10.68px |
| 20px | +22.32px | +12.32px |
| 23px | +24.77px | +14.77px |

Dense means Berean Reading / Byzantine Study; expandable means Berean Study /
Byzantine Reading. Both layouts add height; neither is height-neutral.

Those screenshots also exposed a measurement bug: checker revision 1 captured
the chip card's position before resizing the neighboring baseline. Resizing
could move the card or wrap it onto another flex row, making the subsequent
fit check compare coordinates from two different layouts. Its FAIL results
cannot establish clipping. Revision 2 resizes the baseline first and then reads
all comparison geometry. The JSON report now includes individual failure
reasons. The user's revision-2 screenshots on 2026-10-21 show all 12 sample
checks passing at each of 16, 18, 20 and 23px: **48/48 browser fit checks**.
This covers both editions, both layouts and one-, two- and three-case chips at
their minimum card widths. The screenshots report a 1879px viewport: they verify
constrained card fit, not a narrow/mobile viewport or real-device interaction.
The measured height increases in the table above are unchanged.

`build/test-grammar-chip-layout-fixture.mjs` passes 4 mock-geometry regression
checks for sibling movement, row wrapping, genuine overflow, overlap and text
clipping. These test checker logic, not real-browser appearance. `test:grammar`
and the full test chain include these checks.

On 2026-10-21 the updated annotation suite passed **32/32** checks. All seven
regression suites listed below were rerun and passed with the same counts:
**362 checks total** including the updated annotation suite. Syntax checks and
`git diff --check` also passed; original source datasets remain unchanged.

Earlier implementation verification on 2026-10-20 (before the chip increment):

| Suite | Result |
| --- | --- |
| `build/test-grammatical-annotations.mjs` | 28/28 |
| `build/validate-berean-interlinear.mjs` | 31/31 |
| `build/test-berean-interlinear.mjs` | 80/80 |
| `build/test-berean-offline.mjs` | 12/12 |
| `build/validate-reviewed-greek-gloss.mjs` | 30/30 |
| `build/test-reviewed-greek-gloss.mjs` | 31/31 |
| `build/test-berean-hebrew.mjs` | 114/114 |
| `build/test-service-worker.mjs` | 32/32 |

JavaScript syntax checks and `git diff --check` passed. No tracked file under
`data/` or `build/sources/` changed. The full unrelated edition regression chain
was not run. Browser security policy rejected local `file://` navigation in the
test browser, so actual keyboard activation, visual wrapping and mobile
appearance remain unverified; local-only jsdom journeys passed.
