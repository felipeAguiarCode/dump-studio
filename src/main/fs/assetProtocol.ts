import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { protocol, net } from 'electron'
import { assetsRepo } from '../repositories/assets.repo'
import { thumbnailsDir } from './paths'

export const ASSET_SCHEME = 'noir-asset'

/** Deve ser chamado ANTES de app.whenReady(). */
export function registerAssetScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: ASSET_SCHEME,
      privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true }
    }
  ])
}

/** Deve ser chamado DEPOIS de app.whenReady(). Mapeia noir-asset://{asset|thumb}/<assetId> → arquivo. */
export function handleAssetProtocol(): void {
  protocol.handle(ASSET_SCHEME, async (request) => {
    try {
      const url = new URL(request.url)
      const kind = url.hostname // 'asset' | 'thumb'
      const assetId = decodeURIComponent(url.pathname.replace(/^\//, ''))
      const asset = assetsRepo.getById(assetId)
      if (!asset) return new Response('not found', { status: 404 })

      const filePath =
        kind === 'thumb'
          ? join(thumbnailsDir(asset.projectId), `${asset.id}.jpg`)
          : asset.internalCopyPath

      return net.fetch(pathToFileURL(filePath).toString())
    } catch (error) {
      console.error('[assets] protocolo falhou:', error)
      return new Response('error', { status: 500 })
    }
  })
}

/** Helpers de URL usados pelo renderer (espelhados em shared se necessário). */
export function assetUrl(assetId: string): string {
  return `${ASSET_SCHEME}://asset/${assetId}`
}
export function thumbUrl(assetId: string): string {
  return `${ASSET_SCHEME}://thumb/${assetId}`
}
