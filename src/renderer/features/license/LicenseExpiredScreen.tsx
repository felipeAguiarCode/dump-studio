import { Lock, ArrowUpRight } from 'lucide-react'
import { LICENSE_PURCHASE_URL, licenseExpiryDate } from '@shared/license'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { useT } from '@renderer/i18n'

/**
 * Tela cheia de bloqueio exibida quando a licença expira. Substitui toda a UI,
 * tornando o app inutilizável e direcionando para a compra de uma licença.
 */
export function LicenseExpiredScreen(): JSX.Element {
  const t = useT()
  const lang = usePreferencesStore((s) => s.prefs?.appearance.language ?? 'en')
  const date = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
    dateStyle: 'long'
  }).format(licenseExpiryDate())

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-noir-bg px-6">
      <div className="w-full max-w-md rounded-2xl border border-noir-border bg-noir-panel p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-noir-border bg-noir-elevated text-noir-muted">
          <Lock size={24} strokeWidth={1.5} />
        </div>

        <h1 className="mt-6 text-lg font-medium tracking-tight text-noir-text">
          {t('license.expiredTitle')}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-noir-muted">
          {t('license.expiredBody', { date })}
        </p>

        <a
          href={LICENSE_PURCHASE_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-noir-text px-5 py-2.5 text-sm font-medium text-noir-bg transition-opacity hover:opacity-90"
        >
          {t('license.buy')}
          <ArrowUpRight size={16} />
        </a>
      </div>
    </div>
  )
}
