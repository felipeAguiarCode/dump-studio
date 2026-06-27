import { createHash } from 'node:crypto'
import { readFile, copyFile, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { v4 as uuid } from 'uuid'
import sharp from 'sharp'
import { assetsDir, thumbnailsDir } from './paths'

const THUMB_MAX = 512

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff'
}

export interface ImportedFile {
  id: string
  fileName: string
  sourcePath: string
  internalCopyPath: string
  thumbnailPath: string
  mimeType: string
  width: number
  height: number
  sizeBytes: number
  checksum: string
}

/**
 * Copia o arquivo original para a pasta interna do projeto (nunca altera o original),
 * extrai metadados e gera um thumbnail otimizado. Tolerante a formatos sem suporte de
 * decodificação (ex.: HEIC sem libheif) — nesses casos copia o original sem thumbnail.
 */
export async function importImageFile(
  projectId: string,
  sourcePath: string
): Promise<ImportedFile> {
  const buffer = await readFile(sourcePath)
  const checksum = createHash('sha256').update(buffer).digest('hex')
  const ext = (extname(sourcePath) || '.jpg').toLowerCase()
  const mimeType = MIME_BY_EXT[ext] ?? 'application/octet-stream'
  const id = uuid()
  const internalCopyPath = join(assetsDir(projectId), `${id}${ext}`)
  await copyFile(sourcePath, internalCopyPath)

  let width = 0
  let height = 0
  const thumbnailPath = join(thumbnailsDir(projectId), `${id}.jpg`)

  try {
    const image = sharp(buffer, { failOn: 'none' })
    const meta = await image.metadata()
    width = meta.width ?? 0
    height = meta.height ?? 0
    // EXIF orientation aplicada via rotate(); thumbnail contido em THUMB_MAX.
    await image
      .rotate()
      .resize(THUMB_MAX, THUMB_MAX, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toFile(thumbnailPath)
  } catch (error) {
    console.warn(`[assets] não foi possível decodificar ${basename(sourcePath)}:`, error)
    // Fallback: usa o próprio original como "thumbnail" (renderer ainda consegue exibir JPEG/PNG/WEBP).
    await writeFile(thumbnailPath, buffer).catch(() => undefined)
  }

  return {
    id,
    fileName: basename(sourcePath),
    sourcePath,
    internalCopyPath,
    thumbnailPath,
    mimeType,
    width,
    height,
    sizeBytes: buffer.byteLength,
    checksum
  }
}
