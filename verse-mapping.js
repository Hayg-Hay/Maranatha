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

    // Any metadata ambiguity is recorded so BOTH lookup directions fail closed
    // instead of a later declaration silently overwriting an earlier one:
    //   conflictedTargets  target claimed by two groups, or both mapped and
    //                      negatively asserted, or two negative assertions
    //   conflictedSources  one source ref used by two entries
    //   conflictedGroups   duplicate group ids, or a group participating in a
    //                      source/target conflict (so resolveSource fails too)
    var conflictedTargets = {};
    var conflictedSources = {};
    var conflictedGroups = {};

    if (mapping) {
      var groupsList = (mapping.groups || []).filter(function (g) { return g && g.id !== undefined; });

      // Repeated group IDs must never silently overwrite one definition.
      var seenGroupId = {};
      groupsList.forEach(function (group) {
        if (seenGroupId[group.id]) conflictedGroups[group.id] = true;
        seenGroupId[group.id] = true;
      });

      // Coverage scopes are collected from every declared source.
      groupsList.forEach(function (group) {
        (group.sources || []).forEach(function (source) {
          if (source && source.kind === 'verse') {
            covered[source.book + '|' + String(source.chapter)] = true;
          }
        });
      });

      // Target ownership; a target claimed twice is ambiguous and taints both
      // owning groups.
      groupsList.forEach(function (group) {
        var gid = group.id;
        if (conflictedGroups[gid]) {
          (group.targets || []).forEach(function (t) { conflictedTargets[targetKey(t)] = true; });
          return;
        }
        (group.targets || []).forEach(function (target) {
          var tk = targetKey(target);
          if (groupByTarget[tk]) {
            conflictedTargets[tk] = true;
            conflictedGroups[groupByTarget[tk].id] = true;
            conflictedGroups[gid] = true;
          } else {
            groupByTarget[tk] = group;
          }
        });
      });

      // One source ref used by two entries taints both entries' groups.
      (mapping.entries || []).forEach(function (entry) {
        if (!entry) return;
        var sk = sourceKey(entry.source);
        if (Object.prototype.hasOwnProperty.call(entryBySource, sk)) {
          conflictedSources[sk] = true;
          if (entry.groupId !== undefined) conflictedGroups[entry.groupId] = true;
          var existing = entryBySource[sk];
          if (existing && existing.groupId !== undefined) conflictedGroups[existing.groupId] = true;
        } else {
          entryBySource[sk] = entry;
        }
      });

      // Negative assertions: a mapped target cannot also be negatively
      // asserted, and two assertions for one target are a contradiction.
      var negCount = {};
      (mapping.negativeAssertions || []).forEach(function (neg) {
        if (!neg || !neg.target) return;
        var tk = targetKey(neg.target);
        if (groupByTarget[tk]) {
          conflictedTargets[tk] = true;
          conflictedGroups[groupByTarget[tk].id] = true;
        }
        negCount[tk] = (negCount[tk] || 0) + 1;
        if (negCount[tk] === 1) negativeByTarget[tk] = neg;
        else conflictedTargets[tk] = true;
      });

      // Propagate group conflicts to their targets and keep only unambiguous
      // groups in the id index (duplicate ids included).
      groupsList.forEach(function (group) {
        if (!conflictedGroups[group.id]) return;
        delete groupsById[group.id];
        (group.targets || []).forEach(function (t) { conflictedTargets[targetKey(t)] = true; });
      });
      groupsList.forEach(function (group) {
        if (!conflictedGroups[group.id] && !groupsById[group.id]) groupsById[group.id] = group;
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
      var sources = group.sources || [];
      var targets = group.targets || [];
      // If ANY member's native text is absent the group cannot be presented as
      // a complete correspondence; the missing-source state is retained rather
      // than silently showing the members that did resolve.
      var noText = native !== null && (members.length === 0 || members.some(function (m) { return m.text === null; }));
      var result = {
        state: noText ? STATES.MISSING_SOURCE_TEXT : STATES.CORRESPONDENCE,
        status: group.status || 'proposal',
        groupId: group.id,
        collective: group.collective === true || sources.length > 1 || targets.length > 1,
        // A single source container spanning multiple canonical targets (e.g.
        // GEN 3:1 -> 2:25 and 3:1). The complete source is rendered once per
        // comparison view; no source text is split or duplicated.
        spanning: sources.length === 1 && targets.length > 1,
        presentation: group.presentation || null,
        sources: sources,
        targets: targets,
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
      if (!entry) return { entry: null, group: null, ambiguous: false };
      // A group whose id or membership/targets are ambiguous must not resolve
      // either, even though its source key itself is not a duplicate.
      if (entry.groupId !== undefined && conflictedGroups[entry.groupId]) {
        return { entry: null, group: null, ambiguous: true };
      }
      var group = entry.groupId !== undefined ? (groupsById[entry.groupId] || null) : null;
      return { entry: entry, group: group, ambiguous: false };
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
