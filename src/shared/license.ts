/**
 * Licença com validade fixa "assada" no build.
 *
 * `__LICENSE_EXPIRY_MS__` é um timestamp (ms) injetado em build-time pelo
 * `define` do electron-vite (data do build + 60 dias). Veja `electron.vite.config.ts`.
 * Módulo PURO (sem electron/node/DOM) — compilado nos dois lados.
 */
declare const __LICENSE_EXPIRY_MS__: number

/** Timestamp (ms) em que a licença expira. Se o define não foi aplicado, não expira. */
export const LICENSE_EXPIRY_MS: number =
  typeof __LICENSE_EXPIRY_MS__ === 'number' ? __LICENSE_EXPIRY_MS__ : Number.MAX_SAFE_INTEGER

/** URL de compra mostrada na tela de bloqueio. TROQUE pela sua loja/checkout. */
export const LICENSE_PURCHASE_URL = 'https://www.noirdumpstudio.com/comprar'

/** `true` quando o prazo da licença já passou. */
export function isLicenseExpired(now: number = Date.now()): boolean {
  return now >= LICENSE_EXPIRY_MS
}

/** Data de expiração como `Date`. */
export function licenseExpiryDate(): Date {
  return new Date(LICENSE_EXPIRY_MS)
}
