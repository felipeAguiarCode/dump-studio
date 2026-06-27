/** Altura do dock "Photos Assets" (sobreposto, full-width no rodapé). */
export const ASSETS_BAR_COLLAPSED = 40
export const ASSETS_BAR_EXPANDED = 132

export function assetsBarHeight(collapsed: boolean): number {
  return collapsed ? ASSETS_BAR_COLLAPSED : ASSETS_BAR_EXPANDED
}
