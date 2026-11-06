/**
 * Dicionário inglês — FONTE DA VERDADE das chaves de i18n.
 * `pt.ts` precisa ter exatamente a mesma estrutura (garantido pelo tipo `Dictionary`).
 *
 * Convenção: namespaces "de dados" (derivados de config) ficam aqui — `adjustments`,
 * `filters`, `presets`, `grainTypes`, `noirCurves`, `background`. Namespaces de UI/chrome
 * (topbar, home, dialogs etc.) são adicionados por feature.
 */
export const en = {
  common: {
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    confirm: 'Confirm',
    restore: 'Restore',
    close: 'Close',
    duplicate: 'Duplicate',
    none: 'None'
  },

  // Abas do inspetor direito (RightInspector).
  inspector: {
    text: 'Text',
    adjustments: 'Adjustments',
    filters: 'Filters',
    cameras: 'Cameras',
    textures: 'Textures',
    fx: 'FX',
    crop: 'Crop',
    layouts: 'Layouts',
    shape: 'Shape',
    canvas: 'Canvas'
  },

  fxPanel: {
    subtitle: 'Overlays and effects layered on your photos.',
    overlays: 'Overlays',
    shadows: 'Shadows',
    addHint: 'Tap an overlay to add it. In a layout it covers the selected photo.',
    shadowsHint: 'Tap a shadow to drop it behind the selected element.',
    swapHint: 'Tap another to swap it.',
    flip: 'Flip',
    flipH: 'Flip horizontal',
    flipV: 'Flip vertical',
    color: 'Color',
    customColor: 'Custom color',
    opacity: 'Opacity',
    remove: 'Remove overlay',
    noPage: 'Open a page to add overlays.'
  },

  camerasPanel: {
    title: 'Camera looks',
    subtitle: 'Vintage camera presets — applies filter, textures & adjustments in one tap.',
    original: 'Original'
  },

  cameras: {
    ccd_classic: { label: 'CCD Classic', description: 'Cool, punchy early-2000s digital CCD' },
    half_frame: { label: 'Half Frame', description: 'Warm grainy half-frame film' },
    instant_600: { label: 'Instant 600', description: 'Faded warm instant film' },
    super_8: { label: 'Super 8', description: 'Warm 8mm cine with heavy grain' },
    color_35mm: { label: '35mm Color', description: 'Classic 35mm color negative' },
    disposable_flash: { label: 'Disposable Flash', description: 'Hard-flash disposable, high contrast' },
    cross_process: { label: 'Cross Process', description: 'Lomo cross-processed color shift' },
    sepia_antiga: { label: 'Old Sepia', description: 'Worn sepia vintage print' },
    camcorder_vhs: { label: 'Camcorder VHS', description: 'Retro VHS tape camcorder' }
  },

  // Derivado de adjustmentsConfig.ts (grupos por `id`, sliders por `key`).
  adjustments: {
    groups: {
      light: 'Light',
      color: 'Color',
      bw: 'Black & White',
      details: 'Details',
      grain: 'Grain / ISO',
      optics: 'Optics'
    },
    sliders: {
      exposure: 'Exposure',
      brilliance: 'Smart Brightness',
      highlights: 'Highlights',
      shadows: 'Shadows',
      contrast: 'Contrast',
      brightness: 'Brightness',
      blackPoint: 'Black Point',
      saturation: 'Saturation',
      vibrance: 'Vibrance',
      temperature: 'Warmth',
      tint: 'Tint',
      bwIntensity: 'B&W Intensity',
      tonalSeparation: 'Tonal Separation',
      blackDepth: 'Black Depth',
      whiteBoost: 'White Boost',
      fade: 'Fade',
      sharpness: 'Sharpness',
      definition: 'Definition',
      noiseReduction: 'Noise Reduction',
      clarity: 'Clarity',
      texture: 'Texture',
      grain: 'Grain',
      grainSize: 'Grain Size',
      grainRoughness: 'Grain Roughness',
      vignette: 'Vignette',
      vignetteIntensity: 'Vignette Intensity',
      vignetteSoftness: 'Vignette Softness',
      distortion: 'Subtle Distortion'
    }
  },

  // Derivado de adjustmentsConfig.ts (ADJUSTMENT_PRESETS, por `id`).
  presets: {
    noir_soft: 'Soft Noir',
    noir_high_contrast: 'High Contrast Noir',
    clean_silver: 'Clean Silver',
    vintage_fade: 'Vintage Fade',
    grainy_film: 'Grainy Film',
    old_newspaper: 'Old Newspaper'
  },

  // GRAIN_TYPES (por `value`).
  grainTypes: {
    digital: 'Soft digital',
    film35mm: '35mm film',
    old_film: 'Old film',
    newspaper_noir: 'Newspaper noir',
    cinematic: 'Cinematic'
  },

  // NOIR_CURVES (por `value`).
  noirCurves: {
    soft: 'Soft',
    classic: 'Classic',
    high_contrast: 'High Contrast',
    cinematic: 'Cinematic',
    vintage: 'Vintage'
  },

  // BACKGROUND_SWATCHES (por `id`).
  background: {
    black: 'Black',
    dark_gray: 'Dark gray',
    medium_gray: 'Medium gray',
    light_gray: 'Light gray',
    white: 'White',
    transparent: 'Transparent'
  },

  // Derivado de engine/filters/registry.ts. Nomes próprios de filme/marca ficam IDÊNTICOS
  // em pt (Velvia, Classic Chrome, ACROS...); só as descrições são traduzidas de fato.
  filters: {
    none: 'No filter',
    noneDesc: 'Image with only the manual adjustments.',
    sessions: {
      noir: { label: 'Noir', description: 'Black & white' },
      fujifilm: { label: 'Fujifilm', description: 'Film simulations' },
      cinematic: { label: 'Cinematic', description: 'Cinema looks' },
      aesthetic: { label: 'Aesthetic', description: 'Social-ready aesthetics' },
      vintage: { label: 'Vintage', description: 'Retro films' },
      nostalgic: { label: 'Nostalgic', description: 'Washed-out old photos' }
    },
    items: {
      high_contrast_bw: { label: 'High Contrast B&W', description: 'Intense contrast with deep blacks and bright whites.' },
      silver_tones: { label: 'Silver Tones', description: 'Elegant B&W with luminous midtones and a refined finish.' },
      vintage: { label: 'Vintage', description: 'Softened black & white with fade, texture and a timeless feel.' },
      mono: { label: 'Mono', description: 'Clean, neutral black & white inspired by the classic mobile look.' },
      tonal: { label: 'Tonal', description: 'Balanced contrast with rich grays and smooth tonal transitions.' },
      noir: { label: 'Noir', description: 'Dramatic B&W with deep shadows and a cinematic atmosphere.' },
      silvertone: { label: 'Silvertone', description: 'Bright highlights with a metallic feel and a silver finish.' },
      newspaper_noir: { label: 'Newspaper Noir', description: 'Grainy texture and dry contrast, inspired by old printed photography.' },
      fuji_provia: { label: 'Provia / Standard', description: 'Neutral, balanced color with moderate contrast — Fujifilm’s versatile base.' },
      fuji_velvia: { label: 'Velvia / Vivid', description: 'Saturated, vibrant colors with high contrast, ideal for landscapes.' },
      fuji_astia: { label: 'Astia / Soft', description: 'Soft color and low contrast, with pleasing skin tones.' },
      fuji_classic_chrome: { label: 'Classic Chrome', description: 'Desaturated tones and dense shadows, with a documentary mood.' },
      fuji_classic_neg: { label: 'Classic Neg', description: 'Greenish shadows and warm highlights, inspired by Superia film.' },
      fuji_eterna: { label: 'Eterna / Cinema', description: 'Low saturation and soft contrast, with a cinematic film look.' },
      fuji_nostalgic_neg: { label: 'Nostalgic Neg', description: 'Amber highlights and soft shadows, evoking 1970s photographs.' },
      fuji_acros: { label: 'ACROS', description: 'Fine black & white with rich tonal gradation and elegant grain.' },
      cine_teal_orange: { label: 'Teal & Orange', description: 'Teal shadows and orange skin tones — Hollywood’s classic grade.' },
      cine_bleach_bypass: { label: 'Bleach Bypass', description: 'High contrast and low saturation, with a metallic silver sheen.' },
      cine_day_for_night: { label: 'Day for Night', description: 'Darkened and cool, turning daylight into a night scene.' },
      cine_thriller: { label: 'Thriller', description: 'Moss-green tones and dense shadows, with suspense tension.' },
      cine_golden: { label: 'Golden Hour', description: 'Warm, golden light with an epic late-afternoon mood.' },
      aes_pastel: { label: 'Pastel Dream', description: 'Soft pastel colors with lifted highlights and a dreamy air.' },
      aes_faded_matte: { label: 'Faded Matte', description: 'Lifted blacks and a matte finish, with a modern faded look.' },
      aes_moody: { label: 'Moody', description: 'Dark and desaturated, with dense shadows and an introspective mood.' },
      aes_clean: { label: 'Clean & Bright', description: 'Light, clean and airy, with bright whites and delicate color.' },
      aes_warm_peach: { label: 'Warm Peach', description: 'Warm peach tones, flattering for skin.' },
      vint_seventies: { label: '’70s', description: 'Amber cast and soft contrast, with an old-film fade.' },
      vint_polaroid: { label: 'Polaroid', description: 'Washed-out and slightly green, with instant yellowed highlights.' },
      vint_sepia: { label: 'Sepia', description: 'Warm brown monochrome, with the nostalgia of old photography.' },
      vint_kodachrome: { label: 'Kodachrome', description: 'Rich, saturated colors with vibrant slide-film reds and blues.' },
      vint_cross_process: { label: 'Cross Process', description: 'Cyan shadows and yellowed highlights, with the ’90s chemical error.' },
      nost_faded_90s: { label: 'Faded ’90s', description: 'Desaturated color, lifted blacks and a warm cast — that washed-out ’90s fade.' },
      nost_washed_film: { label: 'Washed Film', description: 'Cool fade with bluish shadows and soft highlights, VSCO analog style.' },
      nost_disposable: { label: 'Disposable', description: 'Direct ’90s flash: greenish shadows, yellowed highlights and a slight punch.' },
      nost_muted_vsco: { label: 'Muted', description: 'Very desaturated and matte, with a magenta touch — VSCO’s minimal aesthetic.' },
      nost_sun_faded: { label: 'Sun-Faded', description: 'Extreme fade with amber highlights and magenta shadows, like a photo left in the sun.' }
    }
  },

  // Diálogo de Preferências (PreferencesDialog).
  preferences: {
    title: 'Preferences',
    language: 'Language',
    tabs: {
      appearance: 'Appearance',
      project: 'Project',
      editing: 'Editing',
      export: 'Export',
      autosave: 'Autosave'
    },
    density: 'Density',
    comfortable: 'Comfortable',
    compact: 'Compact',
    filmstripCollapsed: 'Start with photo panel collapsed',
    showTooltips: 'Show tooltips',
    gridByDefault: 'Grid by default',
    rulersByDefault: 'Rulers by default',
    smartGuidesByDefault: 'Smart guides by default',
    snapByDefault: 'Snap by default',
    accordionAdjustments: 'Accordion adjustments (open one section at a time)',
    overlayLineThickness: 'Guide line thickness',
    defaultFormat: 'Default format',
    confirmBeforeFormatChange: 'Confirm before changing format',
    autoSelectImported: 'Select photo on import',
    defaultFilter: 'Default filter',
    filterNone: 'None',
    defaultGrain: 'Default grain',
    defaultVignette: 'Default vignette',
    exportFormat: 'Default format',
    jpgQuality: 'Default JPG quality',
    showSaveStatus: 'Show save status',
    snapshotBeforeExport: 'Snapshot before export',
    snapshotBeforeFormatChange: 'Snapshot before format change',
    footer: 'Saved automatically · affect new projects.'
  },

  home: {
    subtitle: 'Black & white photo dumps with a noir aesthetic.',
    continue: 'Continue',
    newProjectChooseFormat: 'New project · Choose a format',
    recentProjects: 'Recent projects',
    emptyTitle: 'No projects yet',
    emptyDesc: 'Choose a format above to create your first dump.',
    projectOptions: 'Project options',
    deleteConfirm: 'Delete “{name}”?',
    createFailed: 'Could not create the project: {error}',
    openFailed: 'Could not open: {error}',
    duplicated: 'Project duplicated',
    deleted: 'Project deleted',
    photoCount: { one: '{count} photo', other: '{count} photos' }
  },
  topbar: {
    projects: 'Projects',
    prevPhoto: 'Previous photo',
    nextPhoto: 'Next photo',
    photoCounter: 'Photo {index} of {total}',
    newPage: 'New page',
    deletePage: 'Delete page',
    deletePageMessage: 'Are you sure you want to delete this page? You can undo with Ctrl+Z.',
    fitScreen: 'Fit to screen (recenter)',
    snapshots: 'Project States',
    preview: 'Preview',
    export: 'Export',
    preferences: 'Preferences',
    undo: 'Undo',
    redo: 'Redo',
    saving: 'Saving…',
    saved: 'Saved',
    savedAt: 'Saved at {time}',
    saveError: 'Error saving',
    formatTooltip: 'Instagram format',
    formatChangeWarning: 'Switching to {format} may reframe the images.',
    switch: 'Switch'
  },
  project: {
    title: 'Project',
    collapsePanel: 'Collapse panel',
    collapsePanelAria: 'Collapse project panel',
    format: 'Format',
    photos: 'Photos',
    status: 'Status',
    layers: 'Layers',
    addPhotosToPool: 'Add photos to pool',
    statusSaving: 'Saving…',
    statusError: 'Error saving',
    statusSaved: 'Saved automatically'
  },
  layers: {
    noActivePage: 'No active page.',
    hide: 'Hide',
    show: 'Show',
    unlock: 'Unlock',
    lock: 'Lock',
    options: 'Options',
    bringForward: 'Bring forward',
    sendBackward: 'Send backward',
    opacity: 'Opacity',
    names: { background: 'Background', text: 'Text', shape: 'Shape', border: 'Border', layer: 'Layer' }
  },
  assets: {
    photoCount: { one: '{count} photo', other: '{count} photos' },
    hint: '· drag to the canvas or click to add',
    addPhotos: 'Add Photos',
    expand: 'Expand',
    collapse: 'Collapse',
    emptyCta: 'Add photos to the project — they become a pool to build the pages.',
    usedTimes: ' · used {count}×',
    add: 'add'
  },
  shell: {
    dropToAdd: 'Drop to add to the dump',
    showPanel: 'Show panel',
    showLeftPanel: 'Show left panel',
    showRightPanel: 'Show right panel'
  },
  canvas: {
    tools: {
      select: 'Select / Move',
      pan: 'Hand / Pan',
      crop: 'Crop',
      transform: 'Transform',
      mask: 'Local adjustment (coming soon)',
      text: 'Text',
      shape: 'Shapes',
      zoom: 'Zoom'
    },
    shapes: {
      rectangle: 'Rectangle',
      square: 'Square',
      circle: 'Circle',
      triangle: 'Triangle',
      line: 'Line'
    },
    emptyState: {
      title: 'No pages yet',
      desc: 'Import photos into the pool below and create pages with the + at the top to build your dump.',
      newPage: 'New Page'
    },
    dropHint: 'Drag photos from the pool or click a photo to add it here.',
    addPhotos: 'Add Photos to pool',
    carousel: {
      goToPage: 'Go to page {n}',
      newPage: 'New page',
      deleteCurrentPage: 'Delete current page',
      duplicatePage: 'Duplicate page',
      deletePage: 'Delete page',
      deletePageConfirm: 'Are you sure you want to delete this page? You can undo with Ctrl+Z.'
    },
    selection: {
      align: {
        left: 'Align left',
        centerH: 'Center horizontally',
        right: 'Align right',
        top: 'Align top',
        centerV: 'Center vertically',
        bottom: 'Align bottom'
      },
      distributeH: 'Distribute horizontally',
      distributeV: 'Distribute vertically',
      bringToFront: 'Bring to front',
      sendToBack: 'Send to back',
      quickFilter: 'Quick filter',
      removeFilter: 'Remove filter'
    }
  },
  shadersPanel: {
    subtitle: 'Stackable textures and effects — applied to this photo only.',
    removeAll: 'Remove all effects',
    intensity: 'Intensity',
    sessions: { screen: 'Screen & Signal', film: 'Film & Grain', leak: 'Light Leaks', surface: 'Surface', aging: 'Time & Wear', games: 'Games', fisheye: 'Fisheye' },
    effects: {
      crt: { label: 'CRT', description: 'Scanlines, phosphor mask and old-monitor aberration.' },
      vhs: { label: 'VHS', description: 'Chroma bleed, line jitter and tracking bands.' },
      glitch: { label: '3D Anaglyph', description: 'Offset red and blue channels, like 3D glasses.' },
      signalLoss: { label: 'Signal Loss', description: 'Horizontal tears, black drops and a sync line.' },
      interference: { label: 'Interference', description: 'Analog static, noise bars and chroma ghosting.' },
      scanlines: { label: 'Scanlines', description: 'Horizontal monitor lines, without the CRT aberration.' },
      filmGrain: { label: 'Film Grain', description: 'Classic film grain, strongest in the midtones.' },
      darkGrainy: { label: 'Dark Grainy', description: 'Darkens, boosts contrast and adds heavy grain.' },
      halation: { label: 'Halation', description: 'Analog glow bleeding from the highlights.' },
      concrete: { label: 'Concrete Wall', description: 'Rough, mottled concrete-wall texture.' },
      grunge: { label: 'Grunge', description: 'Dirty stains, scratches and distorted dry grain.' },
      burn: { label: 'Burned', description: 'Scorched edges, like a photo touched by fire.' },
      worn: { label: 'Worn', description: 'Fade, light sepia, dust and the scratches of time.' },
      dustVintage: { label: 'Dust & Film Grain', description: 'Warm vintage fade with film grain, dust and scratches.' },
      personaRed: { label: 'Red Ghost', description: 'Red echo/silhouette with a crimson duotone — bold JRPG style.' },
      personaBlue: { label: 'Blue Ghost', description: 'Blue contours and echo with a melancholic mood.' },
      darkKnight: { label: 'Vigilante Noir', description: 'Urban gloom with red/amber tones and deep blacks.' },
      cyberNeon: { label: 'Cyber Neon', description: 'Chromatic aberration, cyan/magenta split-tone and neon saturation.' },
      inkToon: { label: 'Cel-Shade', description: 'Posterized color with black ink outlines, comic-book style.' },
      dreadFog: { label: 'Dread Fog', description: 'Desaturates, darkens and shrouds in fog and grain — horror mood.' },
      lightLeak: { label: 'Warm Leak', description: 'Warm light bleeding in from the corners.' },
      leakStreak: { label: 'Diagonal Streak', description: 'Warm golden streak crossing the frame diagonally.' },
      leakRainbow: { label: 'Prism Rainbow', description: 'Rainbow prism-dispersion band.' },
      leakEdge: { label: 'End of Roll', description: 'Intense red/orange band on an edge, like the end of a film roll.' },
      leakSpot: { label: 'Lens Flare', description: 'Soft golden orb/hotspot with a halo.' },
      filmBloom: { label: 'Diffusion Glow', description: 'Soft dreamy glow, pro-mist filter style.' },
      anamorphic: { label: 'Anamorphic Flare', description: 'Horizontal blue streak off the highlights, cinematic.' },
      pixelArt: { label: 'Pixel Art', description: 'Pixelates and reduces the palette, retro 8-bit console style.' },
      gameboy: { label: 'Green LCD', description: 'Pixelated 4-shade green screen, classic handheld style.' },
      thermal: { label: 'Thermal Vision', description: 'Infrared heat map, tactical/sci-fi style.' },
      vaporwave: { label: 'Vaporwave', description: 'Pink/cyan synthwave duotone with scanlines, Outrun style.' },
      fisheye: { label: 'Fisheye', description: 'Barrel lens distortion — lines bow outward, center magnified.' },
      antiFisheye: { label: 'Anti-Fisheye', description: 'Pincushion distortion — lines bow inward, edges magnified.' }
    }
  },
  cropPanel: {
    aspectRatio: 'Aspect Ratio',
    ratios: { free: 'Free', original: 'Original' },
    rotateLeft: 'Rotate left',
    rotateRight: 'Rotate right',
    flipHorizontal: 'Flip horizontal',
    flipVertical: 'Flip vertical',
    straighten: 'Straighten',
    perspectiveVertical: 'Vertical Perspective',
    perspectiveHorizontal: 'Horizontal Perspective',
    reset: 'Reset',
    apply: 'Apply'
  },
  shapePanel: {
    shapes: { rectangle: 'Rectangle', square: 'Square', circle: 'Circle', triangle: 'Triangle', line: 'Line' },
    borderColor: 'Border Color',
    noStroke: 'No outline',
    noFill: 'No fill',
    stroke: 'Outline',
    lineColor: 'Line color',
    fill: 'Fill',
    thickness: 'Thickness',
    cornerRadius: 'Corner Radius',
    gutter: 'Spacing (gutter)',
    lineThickness: 'Line thickness',
    strokeWidth: 'Stroke Width',
    opacity: 'Opacity'
  },
  canvasPanelUi: {
    hint: 'Select a photo on the canvas to edit adjustments, filters and crop. Below, the page background.',
    background: 'Canvas Background',
    custom: 'Custom color',
    eyedropper: 'Eyedropper — pick any color on screen',
    eyedropperUnavailable: 'Eyedropper not available in this environment'
  },
  textPanel: {
    addText: 'Add text',
    emptyHint: 'Add a text or select an existing text on the canvas to edit.',
    textLabel: 'Text',
    font: 'Font',
    size: 'Size',
    curve: 'Curvature',
    opacity: 'Opacity',
    style: 'Style',
    bold: 'Bold',
    color: 'Color',
    customColor: 'Custom color (RGB / Hex)',
    alignment: 'Alignment'
  },

  // Chrome do inspetor (RightInspector).
  inspectorPanel: {
    collapse: 'Collapse panel',
    collapseAria: 'Collapse tools panel',
    editing: 'Editing:'
  },

  filtersPanel: {
    title: 'Filter Presets',
    subtitle: 'Applied to this photo only.',
    intensity: 'Filter Intensity'
  },

  adjustmentsPanel: {
    editingThisPhoto: 'Editing this photo',
    auto: 'Auto',
    noirCurve: 'Noir Curve',
    isoSimulated: 'Simulated ISO',
    grainType: 'Grain Type',
    borders: 'Borders',
    presets: 'Adjustment Presets',
    resetAll: 'Reset Adjustments',
    borderWidth: 'Border width',
    borderColor: 'Border color',
    colorAria: 'Color {color}',
    cornerRadius: 'Rounding',
    cornerTL: 'Top-left corner',
    cornerTR: 'Top-right corner',
    cornerBR: 'Bottom-right corner',
    cornerBL: 'Bottom-left corner',
    individualCorners: 'Individual corners',
    colorGrading: 'Color Grading',
    colorMixer: 'Color Mixer',
    curves: 'Curves'
  },

  colorGrade: {
    shadows: 'Shadows',
    midtones: 'Midtones',
    highlights: 'Highlights',
    global: 'Global',
    luminance: 'Luminance'
  },
  colorMix: {
    pickColor: 'Select a color',
    eyedropper: 'Eyedropper — pick a color from the photo to target its band',
    eyedropperUnavailable: 'Eyedropper not available in this environment',
    hue: 'Hue',
    saturation: 'Saturation',
    luminance: 'Luminance',
    red: 'Red',
    orange: 'Orange',
    yellow: 'Yellow',
    green: 'Green',
    aqua: 'Aqua',
    blue: 'Blue',
    purple: 'Purple',
    magenta: 'Magenta'
  },
  curves: {
    rgb: 'RGB',
    red: 'Red',
    green: 'Green',
    blue: 'Blue',
    reset: 'Reset',
    hint: 'Click to add a point · double-click to remove',
    parametric: 'Parametric',
    point: 'Point',
    parametricHint: 'Drag the region sliders to shape the tone curve',
    region: {
      highlights: 'Highlights',
      lights: 'Lights',
      darks: 'Darks',
      shadows: 'Shadows'
    }
  },

  layouts: {
    title: 'Page layout',
    subtitle: 'Pick a layout and drag photos from the pool into the slots.',
    freeNoLayout: 'Free / No layout',
    sessions: {
      grades: 'Grids',
      tiras: 'Strips',
      destaque: 'Highlight',
      editorial: 'Editorial',
      stories: 'Stories',
      'stories-mix': 'Stories Mix',
      polaroid: 'Polaroid',
      dynamics: 'Dynamics',
      carousel: 'Continuous Carousel'
    },
    templates: {
      full: 'Full',
      grid2x2: '2×2',
      grid3x3: '3×3',
      grid2x3: '2×3',
      grid3x2: '3×2',
      grid2x4: '2×4',
      '2v': '2 vertical',
      '2h': '2 horizontal',
      triptych: '3 vertical',
      strip3h: '3 horizontal',
      strip4h: '4 horizontal',
      strip4v: '4 vertical',
      'big-left': '1 + 2 (right)',
      'big-top': '1 + 2 (bottom)',
      'big-left-3': '1 + 3 (right)',
      'big-top-3': '1 + 3 (bottom)',
      'big-right': '1 + 2 (left)',
      'big-bottom': '1 + 2 (top)',
      'big-right-3': '1 + 3 (left)',
      'big-bottom-3': '1 + 3 (top)',
      'hero-6': 'Hero 6',
      'hero-23-top': 'Hero 2/3 (top)',
      'hero-23-bottom': 'Hero 2/3 (bottom)',
      'hero-23-left': 'Hero 2/3 (left)',
      'hero-23-right': 'Hero 2/3 (right)',
      editorial: 'Editorial',
      'editorial-3': 'Editorial 3',
      'editorial-mag': 'Magazine',
      'editorial-pinwheel': 'Pinwheel',
      'st-2v': '2 side by side',
      'st-2h': '2 stacked',
      'st-3h': '3 bands',
      'st-4': '4 (2×2)',
      'st-6': '6 (2×3)',
      'st-hero-top': '1 large + 2',
      'st-hero-bottom': '2 + 1 large',
      'st-hero-strips': '1 large + 3 bands',
      'st-hero-left': '1 large + 2 (side)',
      'pol-single': '1 photo',
      'pol-model-01': 'Portrait 9:16',
      'pol-model-02': 'Strip',
      'pol-model-03': 'Portrait 3:4',
      'pol-model-04': 'Portrait 4:5',
      'pol-2h': '2 stacked',
      'pol-2v': '2 side by side',
      'pol-3h': '3 bands',
      'pol-stagger': '3 staggered',
      'pol-grid9': 'Contact 3×3',
      'pol-land': '1 landscape',
      'pol-2-stagger': '2 staggered',
      'pol-2-port': '2 portraits',
      'pol-hero': '1 large + 2',
      'pol-grid4': 'Contact 2×2',
      'pol-grid6': 'Contact 2×3',
      'pol-4-scatter': '4 scattered',
      'p5-hero-tilt': '1 tilted',
      'p5-vs': 'Showdown (2)',
      'p5-diag-2': '2 parallel',
      'p5-diag-3': '3 diagonal',
      'p5-diag-3-rev': '3 diagonal (mirror)',
      'p5-split-2': 'Diagonal split (2)',
      'p5-diag-4': '4 diagonal',
      'p5-slash-3': '1 + 2 slash',
      'p5-zigzag-3': 'Zigzag (3)',
      'p5-shards-4': 'Shards (4)',
      'p5-edge': 'Hero + strip',
      'p5-band': 'Hero + base',
      'p5-mosaic': 'Mosaic 1 + 3',
      'p5-hero-side-3': 'Hero + 3 (side)',
      'p5-hero-band': 'Hero + tilted band',
      'p5-diamond': 'Diamond',
      'p5-x-cross': 'X cross',
      'p5-fan-3': 'Fan (3)',
      'p5-burst-4': 'Burst (4)',
      'p3-hero': '1 highlight',
      'p3-hero-duo': 'Hero + 2',
      'p3-diamond': 'Diamond',
      'p3-diamond-duo': '2 diamonds',
      'p3-stack': '3 bands',
      'p3-chevron': 'Chevron (2)',
      'car-pano-1': 'Panorama · 1',
      'car-pano-2': 'Panorama · 2',
      'car-band-1': 'Band+photo · 1',
      'car-band-2': 'Band+photo · 2',
      'car-mid-1': 'Middle+2 · 1',
      'car-mid-2': 'Middle+2 · 2',
      'car-hero-1': 'Hero+side · 1',
      'car-hero-2': 'Hero+side · 2'
    }
  },

  exportDialog: {
    title: 'Export',
    whatToExport: 'What to export',
    currentPhoto: 'Current photo',
    fullDump: 'Full dump ({count})',
    fileFormat: 'File format',
    jpgQuality: 'JPG quality',
    quality: 'Quality',
    namePattern: 'Name pattern',
    namePatternHelp: 'Use {index} and {name}. e.g.: noir-dump-01.{format}',
    destFolder: 'Destination folder',
    chooseFolder: 'Choose folder…',
    resolution: 'Export resolution:',
    exportingProgress: 'Exporting {done}/{total}…',
    exporting: 'Exporting…',
    export: 'Export',
    chooseFolderAndExport: 'Choose folder and export',
    exported: { one: '{count} file exported', other: '{count} files exported' },
    failed: 'Export failed: {error}'
  },

  snapshotsDialog: {
    title: 'Project States',
    defaultName: 'State {n}',
    namePlaceholder: 'State name (e.g.: Before filters)',
    saveState: 'Save State',
    empty: 'No saved states yet.',
    replaceCurrent: 'Replace current state?'
  },

  previewOverlay: {
    toggleTheme: 'Toggle light/dark theme',
    close: 'Close (Esc)',
    generating: 'Generating preview…',
    nothing: 'Nothing to preview.',
    page: 'Page {n}',
    likes: '{count} likes',
    timeAgo: '2 hours ago',
    now: 'now',
    prev: 'Previous',
    next: 'Next',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    pause: 'Pause (Space)',
    play: 'Play (Space)',
    sendMessage: 'Send message'
  },

  toasts: {
    importedToPool: { one: '{count} photo in the pool', other: '{count} photos in the pool' },
    alreadyExisting: { one: '{count} already there', other: '{count} already there' },
    importFailed: 'Import failed: {error}',
    layersCopied: { one: '{count} layer copied', other: '{count} layers copied' },
    snapshotSaved: 'State saved',
    snapshotRestored: 'State restored'
  },

  shortcuts: {
    saved: 'Saved'
  },

  license: {
    expiredTitle: 'License expired',
    expiredBody:
      'Your access to Noir Dump Studio ended on {date}. To keep using the app, purchase a license.',
    buy: 'Buy a license'
  }
} as const

/** Versão "alargada" de `en`: mesma estrutura de chaves, mas folhas como `string` (para `pt` traduzir). */
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> }
export type Dictionary = Widen<typeof en>
