import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = new URL('../', import.meta.url)
const source = fileURLToPath(new URL('assets/branding/noir-icon.png', root))
const build = new URL('build/', root)
const renderer = new URL('src/renderer/assets/branding/', root)
await mkdir(build, { recursive: true })
await mkdir(renderer, { recursive: true })

await Promise.all([
  sharp(source).resize(1024, 1024).png().toFile(fileURLToPath(new URL('icon.png', build))),
  sharp(source).resize(256, 256).png().toFile(fileURLToPath(new URL('noir-icon.png', renderer))),
  sharp(fileURLToPath(new URL('assets/branding/splash-art.png', root)))
    .webp({ quality: 88 })
    .toFile(fileURLToPath(new URL('splash-art.webp', renderer)))
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
console.log('Branding built: Windows ICO, application PNG, renderer icon and splash artwork.')
