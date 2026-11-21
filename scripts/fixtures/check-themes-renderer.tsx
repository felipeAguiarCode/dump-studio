import { ipcRenderer } from 'electron'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { usePreferencesStore } from '../../src/renderer/stores/preferencesStore'
import { Button } from '../../src/renderer/components/ui/Button'
import { Toggle } from '../../src/renderer/components/ui/Toggle'
import { Slider } from '../../src/renderer/components/ui/Slider'
import { ThemeToggle } from '../../src/renderer/components/ui/ThemeToggle'
import { CurveEditor } from '../../src/renderer/components/ui/CurveEditor'
import { ParametricCurvePreview } from '../../src/renderer/components/ui/ParametricCurvePreview'
import { DEFAULT_PARAMETRIC_CURVE } from '../../src/shared/defaults'

Object.assign(window, { noir: { invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args) } })
const check = (condition: unknown, message: string): void => { if (!condition) throw new Error(message) }
const wait = async (condition: () => boolean): Promise<void> => {
  for (let count = 0; count < 150; count++) { if (condition()) return; await new Promise((resolve) => setTimeout(resolve, 20)) }
  throw new Error('Theme update timed out')
}
const rgb = (value: string): number[] => value.match(/[\d.]+/g)!.slice(0, 3).map(Number)
const luminance = (color: number[]): number => color.map((value) => { const s = value / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4 }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0)
const contrast = (first: number[], second: number[]): number => (Math.max(luminance(first), luminance(second)) + .05) / (Math.min(luminance(first), luminance(second)) + .05)

function Fixture(): JSX.Element {
  const prefs = usePreferencesStore((state) => state.prefs)
  return <main style={{ padding: 24, height: '100vh', display: 'flex', flexDirection: 'column', gap: 18 }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div><h1 style={{ fontSize: 20, fontWeight: 600 }}>White Studio / Noir</h1><p className="text-xs text-noir-muted">Controles reais · {prefs?.appearance.theme}</p></div>
      <div id="theme-toggle"><ThemeToggle /></div>
    </header>
    <section id="panel" className="rounded-xl border border-noir-border bg-noir-panel shadow-panel" style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <h2 className="mb-3 text-sm font-medium">Botões e preferências</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}><Button id="primary" variant="primary">Exportar</Button><Button variant="ghost">Cancelar</Button><Button id="danger" variant="danger">Excluir</Button></div>
        <Toggle checked onChange={() => {}} label="Mostrar guias" />
        <Slider label="Exposição" value={35} min={-100} max={100} onChange={() => {}} />
        <Slider label="Contraste" value={0} min={-100} max={100} onChange={() => {}} />
        <div id="opacity" className="mt-3 rounded-lg border border-noir-border/60 bg-noir-elevated p-3 text-xs text-noir-muted">Bordas com transparência e texto secundário</div>
        <div className="mt-3 rounded-lg bg-noir-selection p-3 text-xs text-brand-accent">Ferramenta selecionada</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div><p className="mb-2 text-xs text-noir-muted">Curva RGB</p><CurveEditor channel="rgb" points={[{ x: 0, y: 0 }, { x: .5, y: .62 }, { x: 1, y: 1 }]} onChange={() => {}} /></div>
        <div><p className="mb-2 text-xs text-noir-muted">Curva paramétrica</p><ParametricCurvePreview parametric={DEFAULT_PARAMETRIC_CURVE} /></div>
      </div>
    </section>
    <section className="rounded-xl border border-noir-border bg-noir-canvas" style={{ flex: 1, minHeight: 90, padding: 20 }}>
      <p className="text-xs text-noir-muted">Área de trabalho neutra · as cores das páginas e fotos permanecem no projeto</p>
      <div className="mt-3 rounded-lg border border-noir-border bg-noir-panel p-3 text-sm">Texto principal com contraste nos dois temas</div>
    </section>
  </main>
}

async function run(): Promise<void> {
  await usePreferencesStore.getState().load()
  createRoot(document.getElementById('root')!).render(<Fixture />)
  await wait(() => !!document.getElementById('primary'))
  await new Promise((resolve) => setTimeout(resolve, 180))
  const inspect = (dark: boolean): void => {
    check(document.documentElement.dataset.theme === (dark ? 'noir_dark' : 'instagram_light'), 'Wrong active theme')
    const body = getComputedStyle(document.body)
    check(contrast(rgb(body.color), rgb(body.backgroundColor)) >= 7, 'Body text contrast is too low')
    const panel = getComputedStyle(document.getElementById('panel')!)
    check(dark ? rgb(panel.backgroundColor)[0] < 70 : rgb(panel.backgroundColor)[0] > 245, 'Panel did not follow the theme')
    const primary = getComputedStyle(document.getElementById('primary')!)
    check(primary.backgroundImage.includes('linear-gradient'), 'Primary action lost its gradient')
    check(rgb(primary.color).every((value) => value === 255), 'Primary action text must stay white')
    for (const color of primary.backgroundImage.match(/rgb\([^)]+\)/g) ?? []) check(contrast(rgb(color), [255, 255, 255]) >= 4.5, 'Gradient action text contrast is too low')
    const danger = getComputedStyle(document.getElementById('danger')!)
    check(contrast(rgb(danger.color), rgb(panel.backgroundColor)) >= 4.5, `Danger action text is unreadable: ${danger.color} on ${panel.backgroundColor}, theme ${document.documentElement.dataset.theme}`)
    const curve = getComputedStyle(document.querySelector('svg polyline')!)
    check(contrast(rgb(curve.stroke), rgb(body.backgroundColor)) >= 7, 'RGB curve is not visible')
    check(getComputedStyle(document.getElementById('opacity')!).borderColor.includes('0.6'), 'Tailwind opacity suffix stopped working')
  }
  inspect(false)
  await ipcRenderer.invoke('theme-check:capture', 'white-controls')
  document.querySelector<HTMLButtonElement>('#theme-toggle button')!.click()
  await wait(() => usePreferencesStore.getState().prefs?.appearance.theme === 'noir_dark' && !document.querySelector<HTMLButtonElement>('#theme-toggle button')!.disabled)
  await new Promise((resolve) => setTimeout(resolve, 180))
  inspect(true)
  check((await ipcRenderer.invoke('preferences:get')).appearance.theme === 'noir_dark', 'Dark selection was not saved')
  await ipcRenderer.invoke('theme-check:capture', 'noir-controls')
  document.querySelector<HTMLButtonElement>('#theme-toggle button')!.click()
  await wait(() => usePreferencesStore.getState().prefs?.appearance.theme === 'instagram_light' && !document.querySelector<HTMLButtonElement>('#theme-toggle button')!.disabled)
  await new Promise((resolve) => setTimeout(resolve, 180))
  inspect(false)
  ipcRenderer.send('theme-check:result', { ok: true, message: 'PASS: real shared controls switch White/Noir live, persist the preference, retain Tailwind opacity, and pass body/action/danger/curve contrast checks.' })
}
void run().catch((error) => ipcRenderer.send('theme-check:result', { ok: false, message: String(error.stack ?? error) }))
