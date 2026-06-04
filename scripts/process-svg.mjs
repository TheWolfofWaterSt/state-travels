import fs from "fs";

let svg = fs.readFileSync("public/us-map-source.svg", "utf8");
svg = svg.replace(/<defs>[\s\S]*?<\/defs>/, "");
svg = svg.replace(/<g class="state">/, "<g>");
svg = svg.replace(/<path class="([a-z]{2})"/g, (_, code) => {
  const upper = code.toUpperCase();
  return `<path id="${upper}" data-state-code="${upper}" class="state"`;
});
svg = svg.replace(
  /<svg[^>]*>/,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 959 593">'
);
fs.writeFileSync("components/us-map-inner.svg", svg);
console.log("Wrote components/us-map-inner.svg", svg.length, "bytes");
