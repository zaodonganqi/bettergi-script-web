import fs from "fs";
import path from "path";

const rootDir = process.cwd(); // 项目根目录
const targetDir = path.join(rootDir, "src"); // 要处理的目录
const outputDir = path.join(rootDir, "src/assets/readme"); // 输出目录

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function fileToBase64(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}`);
        return null;
    }
    const ext = path.extname(filePath).toLowerCase();
    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString("base64");
    let mime = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") mime = "image/jpeg";
    else if (ext === ".gif") mime = "image/gif";
    else if (ext === ".svg") mime = "image/svg+xml";
    else if (ext === ".webp") mime = "image/webp";

    console.log(`✅ Converted to Base64: ${filePath}`);
    return `data:${mime};base64,${base64}`;
}

function processMarkdownFile(filePath) {
    console.log(`\n🔹 Processing Markdown: ${filePath}`);
    let content = fs.readFileSync(filePath, "utf8");
    const mdDir = path.dirname(filePath);

    // Markdown 图片
    content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
        if (/^(https?:)?\/\//.test(src)) return match;
        const absPath = path.resolve(mdDir, src);
        const base64 = fileToBase64(absPath);
        return base64 ? `![${alt}](${base64})` : match;
    });

    // HTML 图片
    content = content.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/g, (match, src) => {
        if (/^(https?:)?\/\//.test(src)) return match;
        const absPath = path.resolve(mdDir, src);
        const base64 = fileToBase64(absPath);
        return base64 ? match.replace(src, base64) : match;
    });

    // 输出文件名直接放到 outputDir 下
    const fileName = path.basename(filePath);
    const outputPath = path.join(outputDir, fileName);

    fs.writeFileSync(outputPath, content, "utf8");
    console.log(`💾 Markdown saved to: ${outputPath}`);
}

function traverseDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // 排除输出目录
        if (fullPath === outputDir || fullPath.startsWith(outputDir + path.sep)) continue;

        if (entry.isDirectory()) traverseDir(fullPath);
        else if (entry.isFile() && fullPath.endsWith(".md")) processMarkdownFile(fullPath);
    }
}

// 执行
console.log(`\n🚀 Starting Markdown image inlining from: ${targetDir}`);
traverseDir(targetDir);
console.log("\n🎉 All done.");
