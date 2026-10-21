// Supplemental reference grammar. Never edit or enrich source token records.
// Scope, review inventory and references: docs/GRAMMATICAL_ANNOTATIONS.md.
// Original summaries of Thayer's historical lexicon entries, reviewed 2026-10-20.
(function () {
  'use strict';
  const entries = {};
  function reviewed(id, lemma, cases, note, section) {
    entries[id] = { lemma, status: 'reviewed', cases, note, section };
  }
  function unresolved(id, lemma, note, section) {
    entries[id] = { lemma, status: 'unresolved', cases: [], note, section };
  }
  reviewed('260', 'ἅμα', ['Dative'], 'Together with. Also used independently as an adverb.', '2');
  reviewed('303', 'ἀνά', ['Accusative'], 'NT prepositional use: distribution or in the midst (ἀνὰ μέσον). Adverbial distribution can occur without an accusative, as in Revelation 21:21; this badge does not parse this occurrence.', '1–2; adverbial exception');
  reviewed('427', 'ἄνευ', ['Genitive'], 'Without; apart from.', 'opening paragraph');
  reviewed('473', 'ἀντί', ['Genitive'], 'Exchange, substitution or correspondence; sometimes cause.', 'opening; 2');
  reviewed('481', 'ἄντικρυς', ['Genitive'], 'Opposite; used adverbially with a genitive in Acts 20:15.', 'opening paragraph');
  reviewed('495', 'ἀντιπέρα', ['Genitive'], 'On the opposite side; also spelled ἀντιπέραν.', 'opening paragraph');
  reviewed('561', 'ἀπέναντι', ['Genitive'], 'Opposite, in the presence of, or in opposition to.', '1–3');
  reviewed('575', 'ἀπό', ['Genitive'], 'Separation or origin: from, away from.', 'opening paragraph');
  reviewed('817', 'ἄτερ', ['Genitive'], 'Without; apart from.', 'opening paragraph');
  reviewed('891', 'ἄχρι', ['Genitive'], 'A limit in time or place: until, as far as. Also used as a conjunction.', '1');
  reviewed('1223', 'διά', ['Genitive', 'Accusative'], 'Genitive: commonly through, by means of, or agency. Accusative: commonly because of or for the sake of; spatial through also occurs (Luke 17:11).', 'A; B.I–II');
  reviewed('1451', 'ἐγγύς', ['Genitive', 'Dative'], 'Both cases can express nearness; dative examples include Acts 9:38 and 27:8. Also used independently as an adverb. Case alone does not establish a distinct English meaning.', '1a');
  reviewed('1519', 'εἰς', ['Accusative'], 'Direction, entrance, goal or reference; English rendering depends on context.', 'opening; A–B');
  reviewed('1537', 'ἐκ', ['Genitive'], 'Out of, from; origin or separation. ἐξ is the form before a vowel.', 'opening paragraph');
  reviewed('1622', 'ἐκτός', ['Genitive'], 'Outside of or except. Independent adverbial uses and ἐκτὸς εἰ μή are separate constructions.', 'b');
  reviewed('1715', 'ἔμπροσθεν', ['Genitive'], 'Before or in front of; also used independently as an adverb.', '2');
  reviewed('1722', 'ἐν', ['Dative'], 'Common uses include location, sphere, time and means. This is general government, not a selection of the meaning here.', 'opening; I–II');
  reviewed('1725', 'ἔναντι', ['Genitive'], 'Before; in the presence or judgment of.', 'opening paragraph');
  unresolved('1726', 'ἐναντίον', 'The consulted entry does not supply an accessible historical Thayer government statement under this identity. General government is withheld pending a precise reference; nearby noun morphology is not evidence of a syntactic link.', 'entry checked; historical government reference pending');
  reviewed('1752', 'ἕνεκα', ['Genitive'], 'On account of or for the sake of. Variants include ἕνεκεν and εἵνεκεν; it can follow its dependent expression.', 'ἕνεκα / ἕνεκεν');
  reviewed('1787', 'ἐντός', ['Genitive'], 'Within. The interpretation of Luke 17:21 is not settled by this government note; substantival use is separate.', 'opening paragraph');
  reviewed('1799', 'ἐνώπιον', ['Genitive'], 'Before or in the sight of; an adverb used prepositionally.', 'opening paragraph');
  reviewed('1854', 'ἔξω', ['Genitive'], 'Outside of; also used independently as an adverb.', '1b; 2b');
  reviewed('1855', 'ἔξωθεν', ['Genitive'], 'Outside of; independent adverbial uses are separate.', '2');
  reviewed('1883', 'ἐπάνω', ['Genitive'], 'Prepositional use: above or over. Adverbial more than before a numeral does not govern that numeral’s case (compare 1 Corinthians 15:6).', '2; contrast 1b');
  reviewed('1900', 'ἐπέκεινα', ['Genitive'], 'Beyond; an adverb used with a genitive.', 'opening paragraph');
  reviewed('1909', 'ἐπί', ['Genitive', 'Dative', 'Accusative'], 'Genitive: on, upon, over; dative: on, at, on the basis of; accusative: onto, toward, over an extent. Uses overlap, including location; case alone does not determine motion or meaning.', 'A; B; C');
  reviewed('2080', 'ἔσω', ['Genitive'], 'Into or within; the genitive construction is illustrated by Mark 15:16. Independent adverbial uses are separate.', '1');
  reviewed('2193', 'ἕως', ['Genitive'], 'Prepositional use: until or as far as. Also introduces clauses or precedes adverbs; those uses do not establish nominal case government here.', 'II.1a; II.2a');
  reviewed('2596', 'κατά', ['Genitive', 'Accusative'], 'Genitive: commonly down from or against. Accusative: commonly according to, throughout, or distributively. Fixed and adverbial expressions require context.', 'I; II');
  reviewed('2713', 'κατέναντι', ['Genitive'], 'Opposite or before; in the presence of.', 'opening paragraph');
  reviewed('2714', 'κατενώπιον', ['Genitive'], 'Before; in the presence or sight of.', 'opening paragraph');
  reviewed('2943', 'κυκλόθεν', ['Genitive'], 'Around; also independently all around. The lexicon’s τίνος construction specifies the genitive.', 'κυκλόθεν τίνος');
  reviewed('2945', 'κύκλῳ', ['Genitive'], 'Around something. The form itself is an adverbial dative of κύκλος; that does not make its dependent genitive a dative.', 'τίνος construction');
  reviewed('3326', 'μετά', ['Genitive', 'Accusative'], 'Genitive: with, among, accompaniment. Accusative: after, in sequence or time. The poetic dative is outside this NT reference scope.', 'I; II');
  reviewed('3342', 'μεταξύ', ['Genitive'], 'Between; also used adverbially of intervening time.', '1b');
  reviewed('3360', 'μέχρι', ['Genitive'], 'A limit: until, as far as. Also spelled μέχρις and used as a conjunction.', '1');
  reviewed('3693', 'ὄπισθεν', ['Genitive'], 'Behind; independent adverbial uses are separate.', 'prepositional paragraph');
  reviewed('3694', 'ὀπίσω', ['Genitive'], 'Behind or after; also used independently as an adverb.', '2');
  unresolved('3796', 'ὀψέ', 'Matthew 28:1 has competing analyses: prepositional after versus adverbial late with a partitive genitive. The historical entry records the disagreement. No government badge or resolution of the chronology is supplied.', 'b and editorial qualification');
  reviewed('3844', 'παρά', ['Genitive', 'Dative', 'Accusative'], 'Genitive: from beside or from a person. Dative: beside, with, in someone’s presence. Accusative: beside, along, beyond or contrary to; context distinguishes these uses.', 'I; II; III');
  reviewed('3924', 'παρεκτός', ['Genitive'], 'Except; independent adverbial besides is separate.', '1; contrast 2');
  reviewed('4008', 'πέραν', ['Genitive'], 'Beyond or on the other side of; also used independently as an adverb.', '2');
  reviewed('4012', 'περί', ['Genitive', 'Accusative'], 'Genitive: commonly about or concerning. Accusative: commonly around in place or time, also concerning. Meanings overlap; the classical dative is outside NT scope.', 'I; II');
  reviewed('4133', 'πλήν', ['Genitive'], 'Prepositional use: except. Conjunctive or independent adverbial however is separate.', '2');
  reviewed('4139', 'πλησίον', ['Genitive'], 'Near a place (John 4:5). Substantival neighbor is a different function.', 'opening; contrast ὁ πλησίον');
  reviewed('4253', 'πρό', ['Genitive'], 'Before in place, time or precedence.', 'a–c');
  reviewed('4314', 'πρός', ['Genitive', 'Dative', 'Accusative'], 'Genitive (rare): for someone’s advantage or interest (Acts 27:34). Dative (rare): at or near. Accusative (usual): toward, to, with or in relation to; it need not indicate motion.', 'I; II; III');
  reviewed('4862', 'σύν', ['Dative'], 'With; accompaniment or association.', 'opening; I');
  reviewed('5228', 'ὑπέρ', ['Genitive', 'Accusative'], 'Genitive: commonly on behalf of or for the sake of. Accusative: beyond or more than.', 'I; II');
  reviewed('5231', 'ὑπεράνω', ['Genitive'], 'Above in place, rank or power; the lexicon’s τίνος construction specifies the genitive.', 'opening paragraph');
  unresolved('5238', 'ὑπερέκεινα', 'The reference illustrates substantival τὰ ὑπερέκεινα with a dependent genitive in 2 Corinthians 10:16. Whether to describe that relation as prepositional government needs further review; no blanket government is supplied.', 'τὰ ὑπερέκεινα τίνος');
  reviewed('5259', 'ὑπό', ['Genitive', 'Accusative'], 'Genitive: commonly agency, by. Accusative: under in place or subjection. The classical dative is outside NT scope.', 'I; II');
  reviewed('5270', 'ὑποκάτω', ['Genitive'], 'Under or underneath; the lexicon’s τίνος construction specifies the genitive.', 'opening paragraph');
  reviewed('5484', 'χάριν', ['Genitive'], 'For the sake of or because of; often follows its dependent expression. Its origin as an accusative noun does not mean it governs the accusative.', 'opening paragraph');
  reviewed('5565', 'χωρίς', ['Genitive'], 'Without or apart from; independent adverbial separately is a different use.', '2');

  for (const [id, entry] of Object.entries(entries)) {
    entry.source = Object.freeze({ title: `Thayer, G${id}, ${entry.section}`, url: `https://biblehub.com/greek/${id}.htm` });
    Object.freeze(entry.cases);
    Object.freeze(entry);
  }
  Object.freeze(entries);
  const scope = 'General NT Greek reference grammar only. No complement, case used here, or occurrence-specific meaning has been identified.';
  const schemes = Object.freeze({ berean: 'Prep', robinson: 'PREP' });
  function lookup({ language, scheme, morph, strongs } = {}) {
    if (language !== 'grc' || !Object.hasOwn(schemes, scheme) || morph !== schemes[scheme]) {
      return { status: 'non-applicable', scope };
    }
    // Exact lexical identifiers only: no surface guessing or nearby-token scan.
    const id = typeof strongs === 'string' && /^(?:G)?[1-9]\d*$/.test(strongs) ? strongs.replace(/^G/, '') : null;
    const entry = id && Object.hasOwn(entries, id) ? entries[id] : null;
    if (!entry) return { status: 'unresolved', cases: [], note: 'No reviewed grammatical reference for this token identity.', scope };
    return { ...entry, scope };
  }
  window.MARANATHA_GRAMMATICAL_ANNOTATIONS = Object.freeze({ version: 1, language: 'grc', scope, entries, lookup });
}());
