import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = new URL('../', import.meta.url)
const mark = fileURLToPath(new URL('.site/assets/mark.svg', root))
const source = await sharp(mark).png().toBuffer()
const splash = fileURLToPath(new URL('assets/branding/splash-art.png', root))
const build = new URL('build/', root)
const iconFolder = new URL('icons/', build)
const renderer = new URL('src/renderer/assets/branding/', root)
await mkdir(iconFolder, { recursive: true })
await mkdir(renderer, { recursive: true })

// NSIS requires uncompressed 24-bit BMPs with padded, bottom-up rows.
async function writeBitmap(image, target) {
  const { data, info: { width, height } } = await image.removeAlpha().toColourspace('srgb').raw().toBuffer({ resolveWithObject: true })
  const stride = Math.ceil(width * 3 / 4) * 4
  const bmp = Buffer.alloc(54 + stride * height)
  bmp.write('BM')
  bmp.writeUInt32LE(bmp.length, 2)
  bmp.writeUInt32LE(54, 10)
  bmp.writeUInt32LE(40, 14)
  bmp.writeInt32LE(width, 18)
  bmp.writeInt32LE(height, 22)
  bmp.writeUInt16LE(1, 26)
  bmp.writeUInt16LE(24, 28)
  bmp.writeUInt32LE(stride * height, 34)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const from = (y * width + x) * 3
      const to = 54 + (height - y - 1) * stride + x * 3
      bmp[to] = data[from + 2]
      bmp[to + 1] = data[from + 1]
      bmp[to + 2] = data[from]
    }
  }
  await writeFile(target, bmp)
}

const headerIcon = await sharp(source).resize(46, 46).png().toBuffer()
const headerArt = await sharp(splash).resize(150, 57).composite([{ input: headerIcon, gravity: 'centre' }]).png().toBuffer()
await Promise.all([
  writeFile(new URL('icon.png', build), source),
  writeFile(new URL('assets/branding/my-dump-studio-icon.png', root), source),
  sharp(source).resize(256, 256).png().toFile(fileURLToPath(new URL('studio-icon.png', renderer))),
  sharp(splash).resize({ width: 1024, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(fileURLToPath(new URL('splash-art.webp', renderer))),
  writeBitmap(sharp(splash).resize(164, 314), new URL('installerSidebar.bmp', build)),
  writeBitmap(sharp(headerArt), new URL('installerHeader.bmp', build)),
  ...[16, 32, 48, 64, 128, 256, 512, 1024].map((size) => sharp(source).resize(size, size)
    .png().toFile(fileURLToPath(new URL(`my-dump-studio-${size}.png`, iconFolder))))
])

// PNG-backed ICO entries retain alpha and stay sharp at every Windows scaling level.
const sizes = [16, 20, 24, 32, 40, 48, 64, 96, 128, 256]
const images = await Promise.all(sizes.map((size) => sharp(source).resize(size, size).png().toBuffer()))
const header = Buffer.alloc(6 + images.length * 16)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(images.length, 4)
let offset = header.length
for (let index = 0; index < images.length; index++) {
  const entry = 6 + index * 16
  header.writeUInt8(sizes[index] === 256 ? 0 : sizes[index], entry)
  header.writeUInt8(sizes[index] === 256 ? 0 : sizes[index], entry + 1)
  header.writeUInt16LE(1, entry + 4)
  header.writeUInt16LE(32, entry + 6)
  header.writeUInt32LE(images[index].length, entry + 8)
  header.writeUInt32LE(offset, entry + 12)
  offset += images[index].length
}
await writeFile(new URL('icon.ico', build), Buffer.concat([header, ...images]))
console.log('Branding built: application icons, splash artwork and Windows installer graphics.')
