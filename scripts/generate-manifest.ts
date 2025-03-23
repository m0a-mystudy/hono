import { readdir } from 'fs/promises'
import { join } from 'path'
import { readFileSync, writeFileSync } from 'fs'

async function generateManifest() {
  const distDir = join(process.cwd(), 'dist/client')
  const manifest: Record<string, string> = {
    '/': '/index.html',
    '/index.html': '/index.html'
  }

  async function scanDir(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      const relativePath = fullPath.replace(distDir, '')
      
      if (entry.isDirectory()) {
        await scanDir(fullPath)
      } else {
        manifest[relativePath] = relativePath
      }
    }
  }

  await scanDir(distDir)
  
  // index.tsを更新
  const indexPath = join(process.cwd(), 'src/index.ts')
  let indexContent = readFileSync(indexPath, 'utf-8')
  
  // マニフェスト部分を置換
  const manifestStr = JSON.stringify(manifest, null, 2)
    .split('\n')
    .map(line => '      ' + line)
    .join('\n')
  
  indexContent = indexContent.replace(
    /manifest: \{[\s\S]*?\}/,
    `manifest: {\n${manifestStr}`
  )
  
  writeFileSync(indexPath, indexContent)
}

generateManifest() 