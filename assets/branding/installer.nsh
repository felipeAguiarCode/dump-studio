!macro customWelcomePage
  !insertmacro skipPageIfUpdated
  !define MUI_WELCOMEPAGE_TITLE "$(StudioWelcomeTitle)"
  !define MUI_WELCOMEPAGE_TEXT "$(StudioWelcomeText)"
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customHeader
  LangString StudioWelcomeTitle ${LANG_ENGLISH} "Welcome to My Dump Studio"
  LangString StudioWelcomeText ${LANG_ENGLISH} "Cherry Pie Version$\r$\n$\r$\nEdit photos, save your favorite looks and put together your next photo dump.$\r$\n$\r$\nSelect Next to choose where to install My Dump Studio."
  LangString StudioWelcomeTitle ${LANG_PORTUGUESEBR} "Bem-vindo ao My Dump Studio"
  LangString StudioWelcomeText ${LANG_PORTUGUESEBR} "Cherry Pie Version$\r$\n$\r$\nEdite fotos, salve seus looks favoritos e monte seu próximo photo dump.$\r$\n$\r$\nClique em Avançar para escolher onde instalar o My Dump Studio."
!macroend
