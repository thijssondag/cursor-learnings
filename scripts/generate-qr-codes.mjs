import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const outputDir = path.join(rootDir, 'public', 'qr')

const BASE_URL = 'https://cursor-learnings-beta.vercel.app'

const QR_CODES = [
  {
    filename: 'cursor-learnings.png',
    url: `${BASE_URL}/?page=learnings`,
  },
  {
    filename: 'cursor-nijmegen-build-plans.png',
    url: `${BASE_URL}/?page=build-plans`,
  },
]

await mkdir(outputDir, { recursive: true })

for (const { filename, url } of QR_CODES) {
  const outputPath = path.join(outputDir, filename)
  const png = await QRCode.toBuffer(url, {
    type: 'png',
    width: 1024,
    margin: 2,
    errorCorrectionLevel: 'Q',
    color: {
      dark: '#26251e',
      light: '#ffffff',
    },
  })
  await writeFile(outputPath, png)
  console.log(`Wrote ${path.relative(rootDir, outputPath)} -> ${url}`)
}
