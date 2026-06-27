import { useMemo } from 'react'
import type { AppLanguage } from '@shared/types'
import { usePreferencesStore } from '../stores/preferencesStore'
import { en, type Dictionary } from './en'
import { pt } from './pt'

export type { AppLanguage, Dictionary }

/** Dicionários por idioma. `en` é a fonte da verdade das chaves; `pt` precisa ter a mesma forma. */
export const dictionaries: Record<AppLanguage, Dictionary> = { en, pt }

export const LANGUAGE_OPTIONS: { value: AppLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' }
]

type Params = Record<string, string | number>

/** Caminhos em dot-path até folhas string (ex.: 'topbar.export'). */
type DotPaths<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends object
      ? `${K}.${DotPaths<T[K]>}`
      : never
}[keyof T & string]

/** Caminhos cujo valor é um objeto de plural { one, other } — usados por t.plural(). */
type PluralPaths<T> = {
  [K in keyof T & string]: T[K] extends { one: string; other: string }
    ? K
    : T[K] extends object
      ? `${K}.${PluralPaths<T[K]>}`
      : never
}[keyof T & string]

export type TKey = DotPaths<typeof en>
export type PluralKey = PluralPaths<typeof en>

/** Aceita chaves conhecidas (com autocomplete) e também chaves dinâmicas (`...${id}`). */
type LooseKey = TKey | (string & {})

export interface TFunction {
  (key: LooseKey, params?: Params): string
  /** Plural simples (one/other) escolhido por `count`. Interpola `{count}` automaticamente. */
  plural(key: PluralKey | (string & {}), count: number, params?: Params): string
}

function resolve(dict: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part]
    return undefined
  }, dict)
}

function interpolate(str: string, params?: Params): string {
  if (!params) return str
  return str.replace(/\{(\w+)\}/g, (_m, k: string) => (k in params ? String(params[k]) : `{${k}}`))
}

/** Resolve uma chave para o idioma; cai em inglês e, por fim, na própria chave. */
export function translate(lang: AppLanguage, key: string, params?: Params): string {
  const val = resolve(dictionaries[lang], key) ?? resolve(dictionaries.en, key)
  if (typeof val !== 'string') return key
  return interpolate(val, params)
}

export function translatePlural(lang: AppLanguage, key: string, count: number, params?: Params): string {
  const val = resolve(dictionaries[lang], key) ?? resolve(dictionaries.en, key)
  const form =
    val && typeof val === 'object'
      ? (count === 1 ? (val as { one?: unknown }).one : (val as { other?: unknown }).other)
      : undefined
  if (typeof form !== 'string') return key
  return interpolate(form, { ...params, count })
}

function makeT(lang: AppLanguage): TFunction {
  const fn = ((key: string, params?: Params) => translate(lang, key, params)) as TFunction
  fn.plural = (key, count, params) => translatePlural(lang, key, count, params)
  return fn
}

function currentLang(): AppLanguage {
  return usePreferencesStore.getState().prefs?.appearance.language ?? 'en'
}

/** Hook reativo: re-renderiza quando o idioma muda nas preferências. */
export function useT(): TFunction {
  const lang = usePreferencesStore((s) => s.prefs?.appearance.language ?? 'en')
  return useMemo(() => makeT(lang), [lang])
}

/**
 * `t` imperativo para código fora de React (toasts, actions). Lê o idioma atual a cada chamada.
 */
export const t: TFunction = (() => {
  const fn = ((key: string, params?: Params) => translate(currentLang(), key, params)) as TFunction
  fn.plural = (key, count, params) => translatePlural(currentLang(), key, count, params)
  return fn
})()
