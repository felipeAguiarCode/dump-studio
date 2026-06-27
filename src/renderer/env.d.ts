/// <reference types="vite/client" />

import type { NoirApi } from '../preload/api'

declare global {
  interface Window {
    noir: NoirApi
  }
}

export {}
