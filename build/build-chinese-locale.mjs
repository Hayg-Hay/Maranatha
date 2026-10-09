// Book labels and aliases only; never converts or modifies Chinese Scripture.
import fs from 'node:fs';
import vm from 'node:vm';
import { loadAndBuild, ROOT } from './import-cuv-traditional.mjs';
const { translation } = loadAndBuild();
const context = { window: {} }; vm.runInNewContext(fs.readFileSync(`${ROOT}/data/canon.js`, 'utf8'), context);
const english = JSON.parse(fs.readFileSync(`${ROOT}/data/locales/en.json`, 'utf8'));
// Authored Simplified names and standard abbreviations are parser aliases;
// the displayed Traditional names come from the selected source's h records.
const simplified = '创世记 出埃及记 利未记 民数记 申命记 约书亚记 士师记 路得记 撒母耳记上 撒母耳记下 列王纪上 列王纪下 历代志上 历代志下 以斯拉记 尼希米记 以斯帖记 约伯记 诗篇 箴言 传道书 雅歌 以赛亚书 耶利米书 耶利米哀歌 以西结书 但以理书 何西阿书 约珥书 阿摩司书 俄巴底亚书 约拿书 弥迦书 那鸿书 哈巴谷书 西番雅书 哈该书 撒迦利亚书 玛拉基书 马太福音 马可福音 路加福音 约翰福音 使徒行传 罗马书 哥林多前书 哥林多后书 加拉太书 以弗所书 腓立比书 歌罗西书 帖撒罗尼迦前书 帖撒罗尼迦后书 提摩太前书 提摩太后书 提多书 腓利门书 希伯来书 雅各书 彼得前书 彼得后书 约翰一书 约翰二书 约翰三书 犹大书 启示录'.split(' ');
const abbreviations = '創/创 出 利 民 申 書/书 士 得 撒上 撒下 王上 王下 代上 代下 拉 尼 斯 伯 詩/诗 箴 傳/传 歌 賽/赛 耶 哀 結/结 但 何 珥 摩 俄 拿 彌/弥 鴻/鸿 哈 番 該/该 亞/亚 瑪/玛 太 可 路 約/约 徒 羅/罗 林前 林後/林后 加 弗 腓 西 帖前 帖後/帖后 提前 提後/提后 多 門/门 來/来 雅 彼前 彼後/彼后 約一/约一 約二/约二 約三/约三 猶/犹 啟/启'.split(' ');
const ids = Object.keys(translation.bookNames);
if (ids.length !== simplified.length || ids.length !== abbreviations.length) throw new Error('Chinese alias list length mismatch');
const translated = Object.fromEntries(ids.map((id, i) => [id, { name: translation.bookNames[id], aliases: [...new Set([simplified[i], ...abbreviations[i].split('/')])].filter(a => a !== translation.bookNames[id]) }]));
const locale = { language: 'zh-Hant', label: '繁體中文', testaments: { OT: '舊約聖經', NT: '新約聖經' }, books: {} };
for (const book of context.window.MARANATHA_CANON.books) locale.books[book.id] = translated[book.id] || english.books[book.id];
const output = { json: JSON.stringify(locale, null, 2) + '\n', js: `window.MARANATHA_LOCALE_ZH_HANT=${JSON.stringify(locale)};\n` };
for (const [ext, text] of Object.entries(output)) {
  const filename = `${ROOT}/data/locales/zh-Hant.${ext}`;
  if (process.argv.includes('--check')) { if (fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n') !== text) throw new Error(`Stale locale: ${filename}`); }
  else fs.writeFileSync(filename, text);
}
console.log('Chinese locale: 73 book labels; Traditional/Simplified reference aliases OK.');
