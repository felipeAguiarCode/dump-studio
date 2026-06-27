export interface OriginalAsset {
  id: string
  projectId: string
  sourcePath?: string
  internalCopyPath: string
  fileName: string
  mimeType?: string
  width?: number
  height?: number
  sizeBytes?: number
  checksum?: string
  createdAt: string
}

export interface ImportResult {
  asset: OriginalAsset
  /** data URL do thumbnail para exibição imediata no renderer. */
  thumbnailDataUrl?: string
}
