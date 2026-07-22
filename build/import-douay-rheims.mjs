import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

const inputPath = path.join(
    dir,
    "..",
    "data",
    "translations",
    "douay-rheims",
    "genesis-raw.json"
);

const outputPath = path.join(
    dir,
    "..",
    "data",
    "translations",
    "douay-rheims",
    "genesis.json"
);

const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));

function cleanVerse(text) {
    return text
        .replace(/<[^>]+>/g, "")
        .replace(/\[\d+\]/g, "")
        .replace(/\([a-z]\)/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
const output = {
    translation: "douay-rheims",
    book: "GEN",
    chapters: raw.chapters.map(chapter =>
        chapter.verses.map(verse =>
            cleanVerse(verse.text)
        )
    )
};

fs.writeFileSync(
    outputPath,
    JSON.stringify(output, null, 2)
);

console.log(`Created ${outputPath}`);
console.log(
    `${output.chapters.length} chapters imported`
);