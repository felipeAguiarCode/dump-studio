import { useEffect, useState } from 'react'
import { Github, Linkedin, ArrowUpRight } from 'lucide-react'
import { APP_CREATOR, APP_RELEASE } from '@shared/appInfo'
import { ipc } from '../../services/ipcClient'
import { useT } from '../../i18n'
import { useUiStore } from '../../stores/uiStore'
import { Modal } from '../../components/ui/Modal'
import appIcon from '../../assets/branding/noir-icon.png'

export function AboutContent(): JSX.Element {
  const t = useT()
  const [version, setVersion] = useState('')
  useEffect(() => { void ipc('app:version').then(setVersion).catch(console.error) }, [])
  const links = [
    { label: 'GitHub', detail: 'felipeAguiarCode', url: APP_CREATOR.github, icon: <Github size={17} /> },
    { label: 'LinkedIn', detail: 'felipeaguiar-exe', url: APP_CREATOR.linkedin, icon: <Linkedin size={17} /> }
  ]
  return <section data-testid="about-content">
    <div className="flex items-center gap-4">
      <img src={appIcon} width={72} height={72} alt="" className="h-[72px] w-[72px] shrink-0 object-contain" />
      <div><h2 className="text-lg font-medium tracking-tight">Noir Dump Studio</h2><p className="mt-1 text-xs text-noir-muted">{t('about.version')} {version || '…'} — {APP_RELEASE.name}</p></div>
    </div>
    <p className="mt-5 text-xs leading-relaxed text-noir-muted">{t('home.subtitle')}</p>
    <div className="mt-6 border-t border-noir-border pt-5">
      <p className="text-xs text-noir-muted">Created by <strong className="font-semibold text-noir-text">{APP_CREATOR.name}</strong></p>
      <div className="mt-4 space-y-2">
        {links.map((link) => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-noir-border bg-noir-panel px-3 py-3 text-xs text-noir-text transition-colors hover:border-noir-border-active/50 hover:bg-noir-selection">
          <span className="text-brand-accent">{link.icon}</span><span className="min-w-0 flex-1"><span className="block font-medium">{link.label}</span><span className="mt-0.5 block truncate text-[10px] text-noir-muted">{link.detail}</span></span><ArrowUpRight size={14} className="shrink-0 text-noir-muted" />
        </a>)}
      </div>
    </div>
  </section>
}

export function AboutDialog(): JSX.Element {
  const t = useT()
  const close = useUiStore((s) => s.closeDialog)
  return <Modal title={t('about.title')} onClose={close} width={440}><AboutContent /></Modal>
}
