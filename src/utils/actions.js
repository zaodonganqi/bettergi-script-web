import { getWebPath } from "@/utils/basePaths.js";

// 跳转到GitHub仓库指定位置
export function jumpToGitHub(selectedScript) {
  if (!selectedScript) return;
  const baseUrl = getWebPath();
  let targetPath = selectedScript.path;

  // 清理路径，移除多余斜杠和点
  targetPath = targetPath
    .replace(/\/+/g, '/')
    .replace(/^\/|\/$/g, '');

  // 对路径进行编码，特别注意编码方括号等特殊字符
  const encodedPath = encodeURI(targetPath)
    .replace(/\[/g, '%5B')
    .replace(/\]/g, '%5D')
    .replace(/#/g, '%23');

  const githubUrl = baseUrl + encodedPath;
  console.log(githubUrl);
  window.open(githubUrl, '_blank');
}

//