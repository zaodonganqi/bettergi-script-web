import fs from "fs";
import path from "path";
import sharp from "sharp";

// 全局配置
const CONFIG = {
  SCALE: 0.8,              // ⬅⬅ 按比例缩放（0.5 = 缩小一半）
  QUALITY: 60,             // JPG/WebP 质量
  PNG_COLORS: 256,         // PNG 最大颜色数
  LOG: false,              // 是否输出详细日志
};

const rootDir = process.cwd();
const targetDir = path.join(rootDir, "src");
const outputDir = path.join(rootDir, "src/assets/readme");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// 图片压缩转码
async function compressAndBase64(filePath) {
  if (!fs.existsSync(filePath)) return null;

  try {
    const ext = path.extname(filePath).toLowerCase();
    let mime = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") mime = "image/jpeg";
    else if (ext === ".gif") mime = "image/gif";
    else if (ext === ".svg") mime = "image/svg+xml";
    else if (ext === ".webp") mime = "image/webp";

    // svg 不可压缩
    if (ext === ".svg") {
      const raw = fs.readFileSync(filePath, "utf8");
      return `data:${mime};base64,${Buffer.from(raw).toString("base64")}`;
    }

    const info = await sharp(filePath).metadata();
    const newW = Math.round(info.width * CONFIG.SCALE);
    const newH = Math.round(info.height * CONFIG.SCALE);

    let img = sharp(filePath).resize({
      width: newW,
      height: newH,
    });

    if (ext === ".jpg" || ext === ".jpeg") {
      img = img.jpeg({ quality: CONFIG.QUALITY });
    } else if (ext === ".webp") {
      img = img.webp({ quality: CONFIG.QUALITY });
    } else if (ext === ".png") {
      img = img.png({
        compressionLevel: 9,
        palette: true,
        colors: CONFIG.PNG_COLORS,
      });
    }

    const buffer = await img.toBuffer();
    return `data:${mime};base64,${buffer.toString("base64")}`;

  } catch (err) {
    console.error("❌ 图片处理失败:", filePath, err);
    return null;
  }
}

// markdown解析
async function processMarkdownFile(filePath) {
  if (CONFIG.LOG) console.log(`📄 ${filePath}`);

  let content = fs.readFileSync(filePath, "utf8");
  const mdDir = path.dirname(filePath);

  // ![]()
  content = await replaceAsync(
    content,
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    async (match, alt, src) => {
      if (/^(https?:)?\/\//.test(src)) return match;
      const abs = path.resolve(mdDir, src);
      const base64 = await compressAndBase64(abs);
      return base64 ? `![${alt}](${base64})` : match;
    }
  );

  // <img>
  content = await replaceAsync(
    content,
    /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/g,
    async (match, src) => {
      if (/^(https?:)?\/\//.test(src)) return match;
      const abs = path.resolve(mdDir, src);
      const base64 = await compressAndBase64(abs);
      return base64 ? match.replace(src, base64) : match;
    }
  );

  const outFile = path.join(outputDir, path.basename(filePath));
  fs.writeFileSync(outFile, content, "utf8");
}

// 图片标签异步替换
async function replaceAsync(str, regex, asyncFn) {
  const promises = [];
  str.replace(regex, (match, ...args) => {
    promises.push(asyncFn(match, ...args));
  });
  const results = await Promise.all(promises);
  return str.replace(regex, () => results.shift());
}

// 目录遍历检索
async function traverseDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (full.startsWith(outputDir)) continue;

    if (entry.isDirectory()) await traverseDir(full);
    else if (entry.isFile() && full.endsWith(".md"))
      await processMarkdownFile(full);
  }
}

export async function markdownInlineImages() {
  console.log("开始处理 Markdown 图片...");
  await traverseDir(targetDir);
  console.log("已内联全部markdown图片\n");
}
