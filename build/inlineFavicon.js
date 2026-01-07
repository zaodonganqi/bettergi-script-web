import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs'
import { resolve, join } from 'path'

/**
 * Vite插件：将favicon.ico编码并内联到HTML中
 */
export function inlineFavicon() {
  return {
    name: 'inline-favicon',
    enforce: 'post', // 确保在其他插件之后执行
    closeBundle() {
      // 在构建完成后处理文件
      const distPath = resolve(process.cwd(), 'dist')
      const htmlPath = join(distPath, 'index.html')
      const faviconPath = join(distPath, 'favicon.ico')

      if (existsSync(htmlPath) && existsSync(faviconPath)) {
        // 读取HTML文件
        let htmlContent = readFileSync(htmlPath, 'utf-8')

        // 读取favicon文件并转换为base64
        const faviconBuffer = readFileSync(faviconPath)
        const base64Favicon = `data:image/x-icon;base64,${faviconBuffer.toString('base64')}`

        // 替换HTML中的favicon引用
        htmlContent = htmlContent.replace(
          /<link[^>]*rel=["']icon["'][^>]*>/gi,
          `<link rel="icon" type="image/x-icon" href="${base64Favicon}">`
        )

        // 写回HTML文件
        writeFileSync(htmlPath, htmlContent, 'utf-8')

        // 删除favicon文件
        try {
          unlinkSync(faviconPath)
        } catch (error) {
          console.warn('无法删除favicon.ico文件:', error.message)
        }
      }
    }
  }
}
