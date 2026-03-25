import { readFileSync, writeFileSync } from "fs";

const regular = readFileSync("d:/MeiLearning System/frontend/src/lib/fonts/Roboto-Regular.ttf").toString("base64");
const bold = readFileSync("d:/MeiLearning System/frontend/src/lib/fonts/Roboto-Bold.ttf").toString("base64");
const logo = readFileSync("d:/MeiLearning System/frontend/public/Logo.png").toString("base64");

const out = `// Auto-generated — do not edit manually
export const ROBOTO_REGULAR: string = ${JSON.stringify(regular)};
export const ROBOTO_BOLD: string = ${JSON.stringify(bold)};
export const LOGO_BASE64: string = ${JSON.stringify("data:image/png;base64," + logo)};
`;

writeFileSync("d:/MeiLearning System/frontend/src/lib/fonts/pdf-assets.ts", out);
console.log("Written pdf-assets.ts:", Math.round(out.length / 1024), "KB");
