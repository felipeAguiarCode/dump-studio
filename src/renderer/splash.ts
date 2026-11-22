import '@fontsource-variable/inter'
import './styles/splash.css'
import { APP_CREATOR, APP_RELEASE } from '@shared/appInfo'

const query = new URLSearchParams(window.location.search)
const theme = query.get('theme') === 'noir_dark' ? 'noir_dark' : 'instagram_light'
document.documentElement.dataset.theme = theme
document.documentElement.style.colorScheme = theme === 'noir_dark' ? 'dark' : 'light'
const portuguese = (query.get('lang') ?? navigator.language).toLowerCase().startsWith('pt')
document.documentElement.lang = portuguese ? 'pt-BR' : 'en'
document.getElementById('version')!.textContent = `v${query.get('version') ?? ''}`
document.getElementById('edition-name')!.textContent = APP_RELEASE.name.toUpperCase()
document.getElementById('creator-name')!.textContent = APP_CREATOR.name
;(document.getElementById('creator-github') as HTMLAnchorElement).href = APP_CREATOR.github
;(document.getElementById('creator-linkedin') as HTMLAnchorElement).href = APP_CREATOR.linkedin
if (portuguese) {
  document.getElementById('description')!.textContent = 'Suas fotos, seu estilo.'
  document.getElementById('status')!.textContent = 'Iniciando seu estúdio…'
}
