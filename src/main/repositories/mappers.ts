/** Helpers de conversão entre linhas SQLite e o domínio. */

export const nowIso = (): string => new Date().toISOString()

export const toBool = (n: number | null | undefined): boolean => n === 1
export const fromBool = (b: boolean | undefined): number => (b ? 1 : 0)

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (value == null) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

/** Constrói SET dinâmico para UPDATE a partir de um mapa coluna→valor (ignora undefined). */
export function buildUpdate(
  columns: Record<string, unknown>
): { clause: string; values: unknown[] } {
  const entries = Object.entries(columns).filter(([, v]) => v !== undefined)
  const clause = entries.map(([c]) => `${c} = ?`).join(', ')
  const values = entries.map(([, v]) => v)
  return { clause, values }
}
