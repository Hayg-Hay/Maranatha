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
(function (root) {
  'use strict';

  var STATES = {
    CORRESPONDENCE: 'correspondence',
    ALIGNMENT_UNAVAILABLE: 'alignment-unavailable',
    NO_CORRESPONDING: 'no-corresponding-verse',
    MISSING_SOURCE_TEXT: 'missing-source-text',
    MISSING_EDITION: 'missing-edition',
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

    if (mapping) {
      (mapping.groups || []).forEach(function (group) {
        groupsById[group.id] = group;
        (group.targets || []).forEach(function (target) { groupByTarget[targetKey(target)] = group; });
        (group.sources || []).forEach(function (source) {
          if (group.kind !== 'unnumbered' && source.kind === 'verse') {
            var scope = source.book + '|' + String(source.chapter);
            covered[scope] = true;
          }
        });
      });
      (mapping.entries || []).forEach(function (entry) { entryBySource[sourceKey(entry.source)] = entry; });
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
      return chapter.segments[source.segmentIndex] || null;
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
      var anyText = members.some(function (m) { return m.text !== null; });
      var noText = native !== null && !anyText;
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
      var group = groupByTarget[key];
      if (group) {
        var result = correspondenceFor(group);
        result.requestedTarget = { book: bookId, chapter: chapter, verse: verse };
        return result;
      }
      if (negativeByTarget[key]) {
        return {
          state: STATES.NO_CORRESPONDING,
          target: negativeByTarget[key].target,
          note: negativeByTarget[key].attestation,
          provenance: negativeByTarget[key].provenance,
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
      var entry = entryBySource[sourceKey(ref)];
      var group = entry ? groupsById[entry.groupId] : null;
      return { entry: entry || null, group: group || null };
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
