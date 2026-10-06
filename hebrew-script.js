// Display transliteration of the existing WLC/OSHB consonantal text, not a
// reconstruction of an ancient manuscript. Unicode's Phoenician block also
// encodes Paleo-Hebrew; the bundled font supplies Phoenician letterforms.
(() => {
  'use strict';
  const alphabet = Array.from('אבגדהוזחטיכלמנסעפצקרשת');
  const finals = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
  const forward = new Map(alphabet.map((letter, i) => [letter, String.fromCodePoint(0x10900 + i)]));
  const reverse = new Map(alphabet.map((letter, i) => [String.fromCodePoint(0x10900 + i), letter]));
  // Only combining Hebrew points/accents, not consonantal matres lectionis.
  const points = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/g;
  function toPaleo(text) {
    return Array.from(String(text).normalize('NFD').replace(points, ''), (letter) => {
      if (letter === '\u05BE') return ' '; // Masoretic maqqef: separate the words.
      if (letter === '\u05C0' || letter === '\u05C3') return ''; // paseq / sof pasuq
      return forward.get(finals[letter] || letter) || letter;
    }).join('');
  }
  function toSquare(text) {
    return Array.from(String(text), (letter) => reverse.get(letter) || letter).join('');
  }
  window.MARANATHA_HEBREW_SCRIPT = Object.freeze({ toPaleo, toSquare });
})();
