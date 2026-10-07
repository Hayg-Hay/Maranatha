// verse-mapping.js — Stage 2a aligned Greek resolver (classic script).
//
// This file is loaded through a normal <script> tag (and precached in the app
// shell), so it works under a bare file:// double-click. It defines one global,
// window.MARANATHA_VERSE_MAPPING, with a small resolver factory. It does not
// load any data and does not reorder or copy the native Greek corpus: text is
// read from the existing native dataset, by native label, exactly as shipped.
//
// Cell states:
//   correspondence          a proposed/verified source -> target passage
//   alignment-unavailable   source book exists but this reference is unresolved
//   no-corresponding-verse  explicit, attested target negative assertion
//   missing-source-text     mapping resolves but the native segment is absent
//   missing-edition         source book is not in the source edition at all
//   ambiguous-metadata      conflicting/duplicate mapping claims; fail closed
(function (root) {
  'use strict';

  var STATES = {
    CORRESPONDENCE: 'correspondence',
    ALIGNMENT_UNAVAILABLE: 'alignment-unavailable',
    NO_CORRESPONDING: 'no-corresponding-verse',
    MISSING_SOURCE_TEXT: 'missing-source-text',
    MISSING_EDITION: 'missing-edition',
    // Invalid or self-contradictory metadata. The resolver fails closed and
    // never guesses or silently prefers one of two conflicting claims.
    AMBIGUOUS_METADATA: 'ambiguous-metadata',
  };

  function sourceKey(ref) {
    if (!ref) return '';
    return [ref.book, String(ref.chapter), ref.kind,
      ref.kind === 'unnumbered' ? String(ref.segmentIndex) : String(ref.label)].join('|');
  }

  function targetKey(ref) {
    if (!ref) return '';
    return [ref.book, ref.chapter, ref.verse].join('|');
  }

  function createResolver(mapping, options) {
    options = options || {};
    var native = options.native || null;
    var nativeBooks = {};
    if (native && Array.isArray(native.books)) {
      for (var i = 0; i < native.books.length; i++) nativeBooks[native.books[i].id] = native.books[i];
    }

    var groupsById = {};
    var groupByTarget = {};
    var entryBySource = {};
    var negativeByTarget = {};
    var covered = {};

    // A target or source claimed by more than one group/entry is an unresolved
    // conflict. It is recorded so the resolver fails closed instead of letting
    // a later declaration silently overwrite an earlier one.
    var conflictedTargets = {};
    var conflictedSources = {};

    if (mapping) {
      (mapping.groups || []).forEach(function (group) {
        groupsById[group.id] = group;
        (group.targets || []).forEach(function (target) {
          var tk = targetKey(target);
          if (groupByTarget[tk] && groupByTarget[tk].id !== group.id) conflictedTargets[tk] = true;
          else groupByTarget[tk] = group;
        });
        (group.sources || []).forEach(function (source) {
          if (source.kind === 'verse') {
            covered[source.book + '|' + String(source.chapter)] = true;
          }
        });
      });
      (mapping.entries || []).forEach(function (entry) {
        var sk = sourceKey(entry.source);
        if (Object.prototype.hasOwnProperty.call(entryBySource, sk)) conflictedSources[sk] = true;
        else entryBySource[sk] = entry;
      });
      (mapping.negativeAssertions || []).forEach(function (neg) {
        if (neg && neg.target) negativeByTarget[targetKey(neg.target)] = neg;
      });
    }

    function segmentFor(source) {
      var book = nativeBooks[source.book];
      if (!book) return null;
      var chapter = null;
      for (var c = 0; c < book.chapters.length; c++) {
        if (String(book.chapters[c].n) === String(source.chapter)) { chapter = book.chapters[c]; break; }
      }
      if (!chapter) return null;
      if (source.kind === 'verse') {
        for (var s = 0; s < chapter.segments.length; s++) {
          var seg = chapter.segments[s];
          if (seg.kind === 'verse' && String(seg.l) === String(source.label)) return seg;
        }
        return null;
      }
      // Unnumbered refs must resolve to an actual unnumbered segment at the
      // declared index; a verse segment there is not a valid unnumbered ref.
      var unnum = chapter.segments[source.segmentIndex];
      if (!unnum || unnum.kind !== 'unnumbered') return null;
      return unnum;
    }

    function memberFor(source) {
      var seg = native ? segmentFor(source) : null;
      var label = source.kind === 'verse' ? String(source.label) : ('segment ' + source.segmentIndex);
      return {
        source: source,
        label: label,
        refLabel: source.book + ' ' + source.chapter + (source.kind === 'verse' ? ':' + source.label : ''),
        text: seg ? seg.t : null,
        flags: seg && seg.flags ? seg.flags : [],
      };
    }

    function correspondenceFor(group) {
      var members = (group.sources || []).map(memberFor);
      // If ANY member's native text is absent the group cannot be presented as
      // a complete correspondence; the missing-source state is retained rather
      // than silently showing the members that did resolve.
      var noText = native !== null && (members.length === 0 || members.some(function (m) { return m.text === null; }));
      var result = {
        state: noText ? STATES.MISSING_SOURCE_TEXT : STATES.CORRESPONDENCE,
        status: group.status || 'proposal',
        groupId: group.id,
        collective: group.collective === true || (group.sources || []).length > 1 || (group.targets || []).length > 1,
        sources: group.sources || [],
        targets: group.targets || [],
        members: members,
        note: group.notes || '',
      };
      return result;
    }

    function resolveTarget(bookId, chapter, verse) {
      var key = targetKey({ book: bookId, chapter: chapter, verse: verse });
      if (conflictedTargets[key]) {
        return { state: STATES.AMBIGUOUS_METADATA, target: { book: bookId, chapter: chapter, verse: verse } };
      }
      var group = groupByTarget[key];
      if (group) {
        var result = correspondenceFor(group);
        result.requestedTarget = { book: bookId, chapter: chapter, verse: verse };
        return result;
      }
      // An explicit no-counterpart claim is only rendered for an attested
      // negative assertion; unattested metadata never produces a definitive
      // "no corresponding verse" claim.
      var neg = negativeByTarget[key];
      if (neg && typeof neg.attestation === 'string' && neg.attestation) {
        return {
          state: STATES.NO_CORRESPONDING,
          target: neg.target,
          note: neg.attestation,
          provenance: neg.provenance,
        };
      }
      var scope = bookId + '|' + String(chapter);
      if (covered[scope] || nativeBooks[bookId]) {
        return { state: STATES.ALIGNMENT_UNAVAILABLE, book: bookId, chapter: chapter, verse: verse };
      }
      var missing = native && Array.isArray(native.missing)
        ? native.missing.some(function (m) { return m.id === bookId; })
        : false;
      return {
        state: STATES.MISSING_EDITION,
        book: bookId,
        reason: missing ? 'not-available-in-edition' : 'outside-edition',
      };
    }

    function resolveSource(ref) {
      var sk = sourceKey(ref);
      if (conflictedSources[sk]) return { entry: null, group: null, ambiguous: true };
      var entry = entryBySource[sk];
      var group = entry ? groupsById[entry.groupId] : null;
      return { entry: entry || null, group: group || null, ambiguous: false };
    }

    return {
      mapping: mapping,
      native: native,
      states: STATES,
      resolveTarget: resolveTarget,
      resolveSource: resolveSource,
      groupById: function (id) { return groupsById[id] || null; },
      targetKeys: function () { return Object.keys(groupByTarget); },
    };
  }

  root.MARANATHA_VERSE_MAPPING = {
    version: 1,
    STATES: STATES,
    sourceKey: sourceKey,
    targetKey: targetKey,
    createResolver: createResolver,
  };
})(typeof window !== 'undefined' ? window : this);
