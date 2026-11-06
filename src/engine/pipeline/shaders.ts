export const VERTEX_SHADER = `
precision highp float;
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

/**
 * Pipeline noir em passe único (ordem: detalhe → luz → cor → P&B → filtro → grão → vinheta).
 * Opera por camada de imagem; sem efeito global no canvas.
 */
export const FRAGMENT_SHADER = `
precision highp float;
varying vec2 uv;
uniform sampler2D uTex;
uniform vec2 uTexel;
uniform sampler2D uCurveLUT;   // LUT 256×1 das curvas de tom (.r/.g/.b por canal, .a = mestre)
uniform float uCurveOn;        // 1 = aplicar curvas; 0 = ignorar

uniform float uExposure, uContrast, uHighlights, uShadows, uBrightness, uBlackPoint, uBrilliance;
uniform float uSaturation, uVibrance, uTemperature, uTint;
uniform float uBwIntensity, uTonalSeparation, uBlackDepth, uWhiteBoost, uFade;
uniform int uNoirCurve;
uniform float uClarity, uTexture, uSharpness, uDefinition, uNoiseReduction;
uniform float uGrain, uGrainSize, uGrainRoughness, uReferenceWidth, uSeed;
uniform float uIso;          // granulação de sensor simulada (0 = ISO 100)
uniform int uGrainType;      // 0 digital, 1 35mm, 2 filme antigo, 3 jornal, 4 cinemático
uniform float uVignette, uVignetteSoftness, uVignetteIntensity;
uniform vec2 uVignetteCenter;
uniform int uFilter;
uniform float uFilterIntensity;
uniform vec4 uCropRect;      // x, y, w, h (normalizado na origem)
uniform float uFlipX, uFlipY, uRotate90, uStraighten;
uniform float uCrt, uBurn, uWorn, uHalation, uVhs;   // texturas empilháveis (0..1)
uniform float uFilmGrain, uDarkGrainy, uConcrete, uGrunge, uGlitch, uDustVintage;
uniform float uSignalLoss, uInterference, uScanlines;
uniform float uLightLeak, uLeakStreak, uLeakRainbow, uLeakEdge, uLeakSpot; // sessão Leak
uniform float uFilmBloom, uAnamorphic;   // extras de Filme & Grão
uniform float uPersonaRed, uPersonaBlue, uDarkKnight, uCyberNeon, uInkToon, uDreadFog; // sessão Games
uniform float uPixelArt, uGameboy, uThermal, uVaporwave; // extras de Games
uniform float uFisheye, uAntiFisheye; // distorção de lente radial (barril / pincushion)
// Color grading (split-toning) + Color mixer (HSL)
uniform vec3 uCgShadows, uCgMidtones, uCgHighlights, uCgGlobal;
uniform float uCgShadowsLum, uCgMidtonesLum, uCgHighlightsLum, uCgGlobalLum;
uniform float uHslHue[8];
uniform float uHslSat[8];
uniform float uHslLum[8];

// Geometria do crop (passe 1): rotaciona/espelha/recorta em espaço UV.
vec2 sampleUv(vec2 uv){
  // Distorção radial de lente: barril (uFisheye) e pincushion (uAntiFisheye) combinam
  // num fator assinado. Aplicada antes do crop p/ deformar o quadro final de forma coerente.
  float kLens = uFisheye - uAntiFisheye;
  if (abs(kLens) > 0.0001) {
    vec2 d = uv - 0.5;
    float aspect = uTexel.y / uTexel.x;   // largura/altura → distorção circular, não elíptica
    d.x *= aspect;
    float r2 = dot(d, d);
    d *= 1.0 + kLens * 0.6 * r2;           // 0.6 = força máx; >0 estufa (fisheye), <0 contrai
    d.x /= aspect;
    uv = d + 0.5;
  }
  vec2 c = uv - 0.5;
  float ang = uStraighten + uRotate90 * 1.5707963;
  float s = sin(ang), co = cos(ang);
  c = vec2(c.x * co - c.y * s, c.x * s + c.y * co);
  c += 0.5;
  if (uFlipX > 0.5) c.x = 1.0 - c.x;
  if (uFlipY > 0.5) c.y = 1.0 - c.y;
  return uCropRect.xy + c * uCropRect.zw;
}

float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
vec3 toLin(vec3 c){ return pow(max(c, 0.0), vec3(2.2)); }
vec3 toGam(vec3 c){ return pow(max(c, 0.0), vec3(1.0/2.2)); }
float rand(vec2 co){ return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }

float sCurve(float x, float amount){
  return clamp(mix(x, smoothstep(0.0, 1.0, x), amount), 0.0, 1.0);
}

// Conversões RGB <-> HSL (h,s,l em 0..1) para o Color Mixer.
vec3 rgb2hsl(vec3 c){
  float mx = max(max(c.r, c.g), c.b);
  float mn = min(min(c.r, c.g), c.b);
  float l = (mx + mn) * 0.5;
  float h = 0.0, s = 0.0;
  float d = mx - mn;
  if (d > 1e-5) {
    s = l < 0.5 ? d / (mx + mn) : d / (2.0 - mx - mn);
    if (mx == c.r)      h = mod((c.g - c.b) / d, 6.0);
    else if (mx == c.g) h = (c.b - c.r) / d + 2.0;
    else                h = (c.r - c.g) / d + 4.0;
    h /= 6.0;
  }
  return vec3(h, s, l);
}
float hueToRgb(float p, float q, float t){
  if (t < 0.0) t += 1.0;
  if (t > 1.0) t -= 1.0;
  if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
  if (t < 1.0/2.0) return q;
  if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
  return p;
}
vec3 hsl2rgb(vec3 hsl){
  float h = hsl.x, s = hsl.y, l = hsl.z;
  if (s <= 0.0) return vec3(l);
  float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;
  return vec3(hueToRgb(p, q, h + 1.0/3.0), hueToRgb(p, q, h), hueToRgb(p, q, h - 1.0/3.0));
}

float applyCurve(float x, int curve){
  if (curve == 0) return sCurve(x, 0.25);            // Suave
  if (curve == 1) return sCurve(x, 0.5);             // Clássica
  if (curve == 2) return sCurve(x, 0.95);            // Alta contraste
  if (curve == 3) { float v = sCurve(x, 0.7); return mix(0.06, 0.96, v); } // Cinemática
  if (curve == 4) return mix(0.10, 0.88, sCurve(x, 0.2));                  // Vintage
  return x;
}

// Simulações de filme Fujifilm (sessão "fujifilm"): operam sobre a cor pré-P&B,
// por isso preservam o croma mesmo quando há conversão monocromática anterior.
vec3 applyFuji(vec3 c, int f){
  float l = luma(c);
  vec3 r = c;
  if (f == 9) {                                                            // Provia / Standard
    r = (c - 0.5) * 1.06 + 0.5;
    r = mix(vec3(l), r, 1.08);
  } else if (f == 10) {                                                    // Velvia / Vivid
    r = (c - 0.5) * 1.16 + 0.5;
    r = mix(vec3(l), r, 1.5);
    r *= vec3(1.03, 1.0, 1.02);
  } else if (f == 11) {                                                    // Astia / Soft
    r = (c - 0.5) * 0.92 + 0.5;
    r = mix(vec3(l), r, 1.06);
    r += vec3(0.015, 0.006, 0.0);
  } else if (f == 12) {                                                    // Classic Chrome
    r = mix(vec3(l), c, 0.74);
    r = (r - 0.5) * 1.08 + 0.5;
    r -= (1.0 - smoothstep(0.0, 0.5, l)) * 0.025;
    r += vec3(0.0, 0.0, 0.012);
  } else if (f == 13) {                                                    // Classic Neg
    r = mix(vec3(l), c, 0.95);
    float sh = 1.0 - smoothstep(0.0, 0.5, l);
    float hi = smoothstep(0.5, 1.0, l);
    r += vec3(0.0, sh * 0.03, sh * 0.025);                                 // sombras teal/verde
    r += vec3(hi * 0.035, hi * 0.012, 0.0);                               // realces quentes
    r = (r - 0.5) * 1.1 + 0.5;
  } else if (f == 14) {                                                    // Eterna / Cinema
    r = mix(vec3(l), c, 0.58);
    r = (r - 0.5) * 0.9 + 0.5;
    r = r * 0.9 + 0.06;                                                    // levanta sombras (fade)
    r += vec3(0.0, 0.0, 0.012);
  } else if (f == 15) {                                                    // Nostalgic Neg
    r = mix(vec3(l), c, 0.85);
    float hi = smoothstep(0.45, 1.0, l);
    r += vec3(hi * 0.05, hi * 0.025, 0.0);                                // realces âmbar
    r = r * 0.94 + 0.04;
  } else if (f == 16) {                                                    // ACROS (P&B)
    r = vec3(sCurve(l, 0.7));
  }
  return clamp(r, 0.0, 1.0);
}

// Sessão Cinematográfico: gradações de cor inspiradas em cinema.
vec3 applyCine(vec3 c, int f){
  float l = luma(c);
  vec3 r = c;
  float lo = 1.0 - smoothstep(0.0, 0.5, l);                              // sombras
  float hi = smoothstep(0.4, 1.0, l);                                    // luzes
  if (f == 17) {                                                          // Teal & Orange
    r += vec3(-0.02, 0.01, 0.05) * lo;
    r += vec3(0.06, 0.02, -0.04) * hi;
    r = (r - 0.5) * 1.12 + 0.5;
    r = mix(vec3(l), r, 1.06);
  } else if (f == 18) {                                                   // Bleach Bypass
    r = mix(vec3(l), c, 0.4);
    r = (r - 0.5) * 1.3 + 0.5;
    r = mix(r, vec3(luma(r)), 0.12);
  } else if (f == 19) {                                                   // Day for Night
    r = mix(vec3(l), c, 0.7);
    r *= 0.6;
    r += vec3(0.0, 0.02, 0.09) * (1.0 - l);
    r = (r - 0.5) * 1.1 + 0.5;
  } else if (f == 20) {                                                   // Thriller
    r = mix(vec3(l), c, 0.62);
    r += vec3(-0.02, 0.03, -0.02);
    r.g += lo * 0.03;
    r = (r - 0.5) * 1.08 + 0.5;
    r *= 0.93;
  } else if (f == 21) {                                                   // Golden Hour
    r = mix(vec3(l), c, 1.08);
    r += vec3(0.06, 0.03, -0.03) * hi;
    r += vec3(0.02, 0.005, -0.01);
    r = (r - 0.5) * 1.08 + 0.5;
  }
  return clamp(r, 0.0, 1.0);
}

// Sessão Aesthetic: estéticas suaves e contemporâneas para redes sociais.
vec3 applyAesthetic(vec3 c, int f){
  float l = luma(c);
  vec3 r = c;
  float hi = smoothstep(0.4, 1.0, l);
  if (f == 22) {                                                          // Pastel Dream
    r = mix(vec3(l), c, 0.78);
    r = (r - 0.5) * 0.85 + 0.5;
    r = r * 0.9 + 0.08;
    r += vec3(0.025, 0.0, 0.025) * hi;
  } else if (f == 23) {                                                   // Faded Matte
    r = mix(vec3(l), c, 0.85);
    r = r * 0.85 + 0.12;
    r = (r - 0.5) * 0.92 + 0.5;
    r += vec3(0.012, 0.0, 0.012);
  } else if (f == 24) {                                                   // Moody
    r = mix(vec3(l), c, 0.68);
    r = (r - 0.5) * 1.12 + 0.5;
    r -= (1.0 - smoothstep(0.0, 0.45, l)) * 0.05;
    r += vec3(-0.01, 0.0, 0.025) * (1.0 - l);
    r *= 0.95;
  } else if (f == 25) {                                                   // Clean & Bright
    r = mix(vec3(l), c, 1.08);
    r = r * 0.96 + 0.04;
    r += hi * 0.04;
    r = (r - 0.5) * 1.02 + 0.5;
  } else if (f == 26) {                                                   // Warm Peach
    r = mix(vec3(l), c, 0.9);
    r += vec3(0.045, 0.018, -0.012);
    r = r * 0.92 + 0.06;
  }
  return clamp(r, 0.0, 1.0);
}

// Sessão Vintage: filmes coloridos retrô (sépia em monocromático quente).
vec3 applyVintage(vec3 c, int f){
  float l = luma(c);
  vec3 r = c;
  float hi = smoothstep(0.45, 1.0, l);
  float lo = 1.0 - smoothstep(0.0, 0.5, l);
  if (f == 27) {                                                          // Anos 70
    r = mix(vec3(l), c, 0.8);
    r += vec3(0.05, 0.02, -0.05);
    r = r * 0.85 + 0.1;
    r = (r - 0.5) * 0.92 + 0.5;
  } else if (f == 28) {                                                   // Polaroid
    r = mix(vec3(l), c, 0.82);
    r += vec3(-0.012, 0.02, 0.012);
    r += vec3(0.03, 0.02, -0.02) * hi;
    r = r * 0.88 + 0.1;
  } else if (f == 29) {                                                   // Sépia
    r = vec3(l) * vec3(1.12, 0.94, 0.66);
    r = (r - 0.5) * 1.04 + 0.5;
  } else if (f == 30) {                                                   // Kodachrome
    r = mix(vec3(l), c, 1.28);
    r = (r - 0.5) * 1.12 + 0.5;
    r *= vec3(1.04, 0.99, 1.02);
  } else if (f == 31) {                                                   // Cross Process
    r = mix(vec3(l), c, 1.1);
    r += vec3(-0.02, 0.0, 0.05) * lo;
    r += vec3(0.045, 0.045, -0.045) * hi;
    r = (r - 0.5) * 1.15 + 0.5;
  }
  return clamp(r, 0.0, 1.0);
}

// Sessão Nostalgic: fotos antigas lavadas — pretos levantados, baixo contraste,
// cor dessaturada e dominantes sutis (estética VSCO / anos 90).
vec3 applyNostalgic(vec3 c, int f){
  float l = luma(c);
  vec3 r = c;
  float hi = smoothstep(0.5, 1.0, l);
  float lo = 1.0 - smoothstep(0.0, 0.5, l);
  if (f == 32) {                                                          // Anos 90 Lavado
    r = mix(vec3(l), c, 0.72);                                            // dessatura
    r = (r - 0.5) * 0.86 + 0.5;                                          // baixo contraste
    r = r * 0.82 + 0.14;                                                 // fade forte
    r += vec3(0.028, 0.012, -0.018);                                    // dominante quente sutil
  } else if (f == 33) {                                                   // Filme Lavado (frio)
    r = mix(vec3(l), c, 0.7);
    r = (r - 0.5) * 0.88 + 0.5;
    r = r * 0.85 + 0.12;                                                 // fade frio
    r += vec3(-0.02, 0.0, 0.03) * lo;                                   // sombras azuladas
    r += vec3(0.0, 0.01, 0.022) * hi;                                   // luzes levemente frias
  } else if (f == 34) {                                                   // Câmera Descartável
    r = mix(vec3(l), c, 0.9);
    r += vec3(-0.012, 0.026, -0.012) * lo;                              // sombras esverdeadas
    r += vec3(0.042, 0.03, -0.02) * hi;                                // luzes amareladas (flash)
    r = r * 0.9 + 0.08;
    r = (r - 0.5) * 1.05 + 0.5;                                         // leve punch de flash
  } else if (f == 35) {                                                   // Suave Fosco (VSCO)
    r = mix(vec3(l), c, 0.58);                                           // bem dessaturado
    r = (r - 0.5) * 0.9 + 0.5;
    r = r * 0.84 + 0.13;                                                 // matte
    r += vec3(0.01, 0.0, 0.014);                                        // magenta/roxo sutil
  } else if (f == 36) {                                                   // Desbotado ao Sol
    r = mix(vec3(l), c, 0.64);
    r += vec3(0.05, 0.022, 0.0) * hi;                                   // realces âmbar
    r += vec3(0.022, 0.0, 0.016) * lo;                                 // sombras magenta desbotadas
    r = r * 0.8 + 0.16;                                                  // fade extremo
    r = (r - 0.5) * 0.85 + 0.5;
  }
  return clamp(r, 0.0, 1.0);
}

vec3 applyFilter(vec3 c, vec3 colorBase, int f, float t){
  if (f == 0) return c;
  vec3 r = c;
  if (f >= 32) {                                                          // Sessão Nostalgic (cor)
    r = applyNostalgic(colorBase, f);
  } else if (f >= 27) {                                                   // Sessão Vintage (cor)
    r = applyVintage(colorBase, f);
  } else if (f >= 22) {                                                   // Sessão Aesthetic (cor)
    r = applyAesthetic(colorBase, f);
  } else if (f >= 17) {                                                   // Sessão Cinematográfico (cor)
    r = applyCine(colorBase, f);
  } else if (f >= 9) {                                                    // Sessão Fujifilm (cor)
    r = applyFuji(colorBase, f);
  } else {                                                                // Sessão Noir (P&B)
    float l = luma(c);
    if (f == 1) { l = sCurve(l, 0.95); r = vec3(l); }                       // P&B alto contraste
    else if (f == 2) { l = mix(0.08, 0.95, sCurve(l, 0.35)); r = vec3(l) * vec3(0.99,1.0,1.02); } // Tons de prata
    else if (f == 3) { l = mix(0.12, 0.86, sCurve(l, 0.25)); r = vec3(l) * vec3(1.03,1.0,0.95); } // Vintage
    else if (f == 4) { l = sCurve(l, 0.45); r = vec3(l); }                  // Mono
    else if (f == 5) { l = sCurve(l, 0.55); r = vec3(l); }                  // Tonal
    else if (f == 6) { l = sCurve(l, 0.9); r = vec3(l) * vec3(0.98,0.99,1.0); } // Noir
    else if (f == 7) { l = mix(0.04, 1.0, sCurve(l, 0.6)); r = vec3(l) * vec3(0.97,1.0,1.05); } // Silvertone
    else if (f == 8) { l = sCurve(l, 0.85); l = floor(l*9.0)/9.0; r = vec3(l); } // Jornal noir
  }
  return mix(c, r, clamp(t, 0.0, 1.0));
}

void main(){
  vec2 suv = sampleUv(uv);
  vec3 c = texture2D(uTex, suv).rgb;
  vec3 srcColor = c;   // origem crua preservada (aberração/halação dos shaders)

  // Vizinhança próxima (1px): nitidez / definição / textura / redução de ruído.
  vec3 n = texture2D(uTex, sampleUv(uv + vec2(0.0, -uTexel.y))).rgb
         + texture2D(uTex, sampleUv(uv + vec2(0.0,  uTexel.y))).rgb
         + texture2D(uTex, sampleUv(uv + vec2(-uTexel.x, 0.0))).rgb
         + texture2D(uTex, sampleUv(uv + vec2( uTexel.x, 0.0))).rgb;
  vec3 blur = (c + n) / 5.0;
  vec3 highFreq = c - blur;
  // Vizinhança larga (~4px): claridade = contraste local (muito mais visível que micro).
  vec3 nw = texture2D(uTex, sampleUv(uv + vec2(0.0, -uTexel.y * 4.0))).rgb
          + texture2D(uTex, sampleUv(uv + vec2(0.0,  uTexel.y * 4.0))).rgb
          + texture2D(uTex, sampleUv(uv + vec2(-uTexel.x * 4.0, 0.0))).rgb
          + texture2D(uTex, sampleUv(uv + vec2( uTexel.x * 4.0, 0.0))).rgb;
  vec3 localContrast = c - (c + nw) / 5.0;

  // Redução de ruído
  c = mix(c, blur, uNoiseReduction * 0.85);
  // Nitidez + definição + textura (microcontraste) — resposta reforçada.
  c = c + highFreq * (uSharpness * 2.6 + uDefinition * 1.7 + uTexture * 1.5);
  // Claridade: contraste local de raio maior (efeito perceptível).
  c = c + localContrast * (uClarity * 1.8);
  c = clamp(c, 0.0, 1.0);

  // ---- Luz (em espaço linear para exposição/temperatura) ----
  vec3 lin = toLin(c);
  lin *= pow(2.0, uExposure * 1.6);
  lin.r += uTemperature * 0.12; lin.b -= uTemperature * 0.12;
  lin.g -= uTint * 0.10;        lin.r += uTint * 0.04; lin.b += uTint * 0.04;
  vec3 g = toGam(max(lin, 0.0));

  float L = luma(g);
  g += uShadows * (1.0 - smoothstep(0.0, 0.55, L)) * 0.5;
  g += uHighlights * smoothstep(0.45, 1.0, L) * 0.45;
  g += uBrightness * 0.28;
  g += uBrilliance * ((1.0 - L) * 0.30 - smoothstep(0.6, 1.0, L) * 0.16);
  g = (g - 0.5) * (1.0 + uContrast) + 0.5;
  float bp = uBlackPoint * 0.16;
  g = (g - bp) / max(1.0 - bp, 0.05);
  g = clamp(g, 0.0, 1.0);

  // ---- Curvas de tom (LUT) — mestre (canal .a) por componente, depois a curva do componente ----
  if (uCurveOn > 0.5) {
    float mr = texture2D(uCurveLUT, vec2(g.r, 0.5)).a;
    float mg = texture2D(uCurveLUT, vec2(g.g, 0.5)).a;
    float mb = texture2D(uCurveLUT, vec2(g.b, 0.5)).a;
    g = vec3(
      texture2D(uCurveLUT, vec2(mr, 0.5)).r,
      texture2D(uCurveLUT, vec2(mg, 0.5)).g,
      texture2D(uCurveLUT, vec2(mb, 0.5)).b
    );
  }

  // ---- Cor (antes da conversão) ----
  float lc = luma(g);
  g = mix(vec3(lc), g, 1.0 + uSaturation);
  float sat = max(max(g.r, g.g), g.b) - min(min(g.r, g.g), g.b);
  g = mix(vec3(lc), g, 1.0 + uVibrance * (1.0 - sat));
  g = clamp(g, 0.0, 1.0);

  // ---- Color Mixer (HSL) — por faixa de matiz, antes da conversão P&B ----
  {
    vec3 hsl = rgb2hsl(g);
    float centers[8];
    centers[0]=0.0;     centers[1]=0.08333; centers[2]=0.16667; centers[3]=0.33333;
    centers[4]=0.5;     centers[5]=0.66667; centers[6]=0.77778; centers[7]=0.88889;
    float hueShift = 0.0, satAdj = 0.0, lumAdj = 0.0, wsum = 0.0;
    for (int i = 0; i < 8; i++) {
      float dh = abs(hsl.x - centers[i]);
      dh = min(dh, 1.0 - dh);                  // distância circular de matiz
      float w = smoothstep(0.16667, 0.0, dh);  // ~60° de alcance, falloff suave
      hueShift += uHslHue[i] * w;
      satAdj   += uHslSat[i] * w;
      lumAdj   += uHslLum[i] * w;
      wsum += w;
    }
    if (wsum > 1e-4) {
      hsl.x = fract(hsl.x + hueShift * 0.15);
      hsl.y = clamp(hsl.y * (1.0 + satAdj), 0.0, 1.0);   // multiplicativo: cinzas seguem cinzas
      hsl.z = clamp(hsl.z + lumAdj * 0.5 * hsl.y, 0.0, 1.0); // só afeta pixels coloridos
      g = clamp(hsl2rgb(hsl), 0.0, 1.0);
    }
  }

  // ---- Modelagem tonal + Preto e branco ----
  // A modelagem tonal (separação, pretos, brancos, fade) age na PRÓPRIA cor — assim a
  // seção afeta a foto mesmo sem desaturar (Intensidade P&B baixa). A Intensidade P&B
  // desatura para cinza; a Curva Noir molda o canal P&B.
  vec3 toned = (g - 0.5) * (1.0 + uTonalSeparation * 0.9) + 0.5;
  float lt = luma(toned);
  toned -= uBlackDepth * 0.32 * (1.0 - smoothstep(0.0, 0.5, lt));
  toned += uWhiteBoost * 0.30 * smoothstep(0.5, 1.0, lt);
  toned = mix(toned, 0.12 + toned * 0.86, uFade);
  toned = clamp(toned, 0.0, 1.0);
  float bw = applyCurve(luma(toned), uNoirCurve);
  vec3 outc = mix(toned, vec3(bw), uBwIntensity);

  // ---- Filtro (Noir P&B ou simulação de filme Fujifilm) ----
  // 'g' é a cor já graduada (pré-P&B): filtros Fujifilm a usam para preservar o croma.
  outc = applyFilter(outc, g, uFilter, uFilterIntensity);

  // ---- Color Grading (split-toning) — após P&B: tinge sombras/médios/realces/global ----
  {
    float Lg = luma(outc);
    float wS = 1.0 - smoothstep(0.0, 0.5, Lg);
    float wH = smoothstep(0.5, 1.0, Lg);
    float wM = 1.0 - wS - wH;
    outc += (uCgShadows * wS + uCgMidtones * wM + uCgHighlights * wH + uCgGlobal) * 0.6;
    outc += vec3(uCgShadowsLum * wS + uCgMidtonesLum * wM + uCgHighlightsLum * wH + uCgGlobalLum) * 0.5;
    outc = clamp(outc, 0.0, 1.0);
  }

  // ---- Granulação (Granulação + ISO simulado; caráter por Tipo de Grão) ----
  float grainAmt = clamp(uGrain + uIso * 0.7, 0.0, 1.4); // ISO adiciona ruído de sensor
  if (grainAmt > 0.001) {
    float sizeScale = max(uGrainSize, 0.5);
    float rough = clamp(uGrainRoughness, 0.0, 1.0);
    float strength = 0.40;       // 35mm (padrão)
    float shadowBias = 0.0;      // 0 = médios; 1 = concentra nas sombras
    if (uGrainType == 0) { sizeScale *= 0.7; strength = 0.30; }                                   // Digital: fino e sutil
    else if (uGrainType == 2) { sizeScale *= 1.8; rough = max(rough, 0.6); strength = 0.6; shadowBias = 0.55; } // Filme antigo: grosso, nas sombras
    else if (uGrainType == 3) { sizeScale *= 1.3; strength = 0.85; }                              // Jornal noir: duro/dithered
    else if (uGrainType == 4) { sizeScale *= 0.85; strength = 0.30; }                             // Cinemático: fino nos médios
    vec2 gcoord = uv * (uReferenceWidth / sizeScale) + uSeed;
    float fine = rand(gcoord) - 0.5;
    float coarse = rand(floor(gcoord * 0.45)) - 0.5;
    float grain = mix(fine, coarse, rough);
    if (uGrainType == 3) grain = sign(grain) * step(0.15, abs(grain)) * 0.5; // dither de jornal
    float midMask = 1.0 - abs(luma(outc) - 0.45) * 1.4;
    float shadMask = 1.0 - smoothstep(0.0, 0.6, luma(outc));
    float lmask = mix(midMask, shadMask, shadowBias);
    outc += grain * grainAmt * strength * clamp(lmask, 0.15, 1.0);
  }

  // ---- Vinheta ----
  if (abs(uVignette) > 0.001) {
    float dist = distance(uv, uVignetteCenter) * 1.41421;
    float inner = mix(0.9, 0.2, uVignetteSoftness);
    float v = smoothstep(inner, 1.05, dist) * uVignetteIntensity;
    outc *= 1.0 - v * uVignette;
  }

  // ===== Shaders de textura / tela (empilháveis, só nesta foto) =====
  // Offsets em espaço UV (frações) → idênticos no preview e no export (WYSIWYG).
  float edist = distance(uv, vec2(0.5)) * 1.41421356;

  // Halação: brilho analógico que vaza das altas luzes (glow quente).
  if (uHalation > 0.001) {
    vec3 bloom = texture2D(uTex, sampleUv(uv + vec2( 0.012, 0.0))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(-0.012, 0.0))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(0.0,  0.012))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(0.0, -0.012))).rgb
               + texture2D(uTex, sampleUv(uv + vec2( 0.008,  0.008))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(-0.008, -0.008))).rgb;
    bloom /= 6.0;
    float hl = smoothstep(0.55, 1.0, luma(bloom));
    outc += bloom * hl * uHalation * vec3(0.95, 0.62, 0.5);
  }

  // CRT: aberração cromática + scanlines + máscara de fósforo + curvatura escura.
  if (uCrt > 0.001) {
    float ab = uCrt * (0.0025 + edist * 0.004);
    float rC = texture2D(uTex, sampleUv(uv + vec2(ab, 0.0))).r;
    float bC = texture2D(uTex, sampleUv(uv - vec2(ab, 0.0))).b;
    outc += vec3(rC - srcColor.r, 0.0, bC - srcColor.b) * 0.9;
    float scan = 0.5 + 0.5 * sin(uv.y * 480.0 * 3.14159265);
    outc *= 1.0 - uCrt * 0.28 * scan;
    float triad = mod(floor(uv.x * 540.0), 3.0);
    vec3 mask = vec3(0.82);
    if (triad < 0.5) mask.r = 1.0; else if (triad < 1.5) mask.g = 1.0; else mask.b = 1.0;
    outc *= mix(vec3(1.0), mask, uCrt * 0.5);
    outc *= 1.0 - uCrt * 0.30 * smoothstep(0.55, 1.05, edist);
  }

  // VHS: sangramento de croma horizontal + jitter por linha + faixas de tracking.
  if (uVhs > 0.001) {
    float row = floor(uv.y * 240.0);
    float jit = rand(vec2(row, 7.0)) - 0.5;
    float dxv = uVhs * (0.006 + jit * 0.012);
    float rV = texture2D(uTex, sampleUv(uv + vec2(dxv, 0.0))).r;
    float bV = texture2D(uTex, sampleUv(uv - vec2(dxv, 0.0))).b;
    outc += vec3(rV - srcColor.r, 0.0, bV - srcColor.b) * 1.1;
    float band = smoothstep(0.992, 1.0, rand(vec2(row * 0.13, 3.0)));
    outc += band * uVhs * 0.18;
    outc *= 1.0 - uVhs * 0.10 * (0.5 + 0.5 * sin(uv.y * 240.0 * 3.14159265));
  }

  // Queimado: bordas chamuscadas crescendo das bordas com limite irregular.
  if (uBurn > 0.001) {
    float n1 = rand(floor(uv * 7.0));
    float n2 = rand(floor(uv * 23.0));
    float edge = smoothstep(0.30, 1.0, edist + (n1 - 0.5) * 0.35 + (n2 - 0.5) * 0.12);
    float scorch = edge * uBurn;
    float ember = smoothstep(0.25, 0.7, scorch) * (1.0 - smoothstep(0.7, 1.0, scorch));
    outc += ember * uBurn * vec3(0.55, 0.22, 0.04);                  // anel de brasa
    outc = mix(outc, outc * vec3(0.20, 0.10, 0.04), smoothstep(0.5, 1.0, scorch)); // carvão marrom
    outc *= 1.0 - smoothstep(0.45, 1.0, scorch) * 0.85;              // escurecimento
  }

  // Desgastado: fade, leve sépia, poeira e arranhões verticais (posição estável).
  if (uWorn > 0.001) {
    outc = mix(outc, outc * 0.85 + 0.13, uWorn * 0.5);               // fade (levanta os pretos)
    float wl = luma(outc);
    outc = mix(outc, vec3(wl) * vec3(1.12, 1.02, 0.82), uWorn * 0.35); // sépia suave
    float dust = rand(floor(uv * vec2(260.0, 320.0)));
    outc += step(0.9965, dust) * (1.0 - outc) * uWorn;               // poeira clara
    outc -= step(dust, 0.0035) * outc * uWorn;                       // pontos escuros
    float scr = rand(vec2(floor(uv.x * 200.0), 4.0));
    outc += smoothstep(0.991, 1.0, scr) * (1.0 - outc) * 0.6 * uWorn; // arranhão vertical
  }

  // Grão de filme: ruído de luminância de duas frequências, mais forte nos médios.
  if (uFilmGrain > 0.001) {
    vec2 fco = uv * (uReferenceWidth / 2.2) + uSeed;
    float g1 = rand(fco) - 0.5;
    float g2 = rand(fco * 1.7 + 5.0) - 0.5;
    float grain = (g1 + g2) * 0.5;
    float lmask = 1.0 - abs(luma(outc) - 0.5) * 1.2;
    outc += grain * uFilmGrain * 0.22 * clamp(lmask, 0.2, 1.0);
  }

  // Escuro e granulado: escurece, reforça o contraste e empilha grão pesado.
  if (uDarkGrainy > 0.001) {
    outc = mix(outc, outc * 0.55, uDarkGrainy);                       // escurecer
    outc = mix(outc, (outc - 0.5) * 1.2 + 0.5, uDarkGrainy * 0.7);    // contraste
    vec2 dco = uv * (uReferenceWidth / 1.7) + uSeed * 1.3;
    float dg = rand(dco) - 0.5;
    outc += dg * uDarkGrainy * 0.34;                                  // grão pesado
  }

  // Parede de concreto: textura mosqueada multi-frequência em multiplicação.
  if (uConcrete > 0.001) {
    float c1 = rand(floor(uv * 90.0));
    float c2 = rand(floor(uv * 230.0));
    float c3 = rand(floor(uv * 28.0));
    float tex = c1 * 0.5 + c2 * 0.3 + c3 * 0.2;
    float mottle = mix(0.78, 1.08, tex);
    outc = mix(outc, outc * mottle, uConcrete * 0.85);
    outc -= smoothstep(0.86, 1.0, c3) * uConcrete * 0.15;            // manchas escuras
  }

  // Grunge: manchas sujas, riscos, granulado seco e leve dessaturação.
  if (uGrunge > 0.001) {
    float b1 = rand(floor(uv * 14.0));
    float b2 = rand(floor(uv * 47.0));
    float blot = smoothstep(0.55, 1.0, b1 * 0.6 + b2 * 0.4);
    outc = mix(outc, outc * 0.45, blot * uGrunge);                   // manchas escuras
    float scrg = rand(vec2(floor(uv.x * 130.0), 9.0));
    outc -= smoothstep(0.985, 1.0, scrg) * uGrunge * 0.5;            // riscos
    float gn = rand(uv * uReferenceWidth * 0.5 + uSeed) - 0.5;
    outc += gn * uGrunge * 0.12;                                     // granulado seco
    outc = mix(outc, vec3(luma(outc)) * vec3(1.02, 1.0, 0.95), uGrunge * 0.3);
  }

  // Anáglifo 3D ("glitch"): cópias deslocadas em sentidos opostos geram franjas vermelha
  // (lado direito) e azul (lado esquerdo), como uma imagem de óculos 3D vista sem os óculos.
  // Baseado em deltas de luminância da fonte → franjas só nas BORDAS; áreas chapadas ficam
  // intactas (sem blocos brancos) e independe do grade/P&B aplicado.
  if (uGlitch > 0.001) {
    float d = uGlitch * 0.03;                                              // deslocamento horizontal
    float l0 = luma(srcColor);                                            // luminância base (sem deslocar)
    float lr = luma(texture2D(uTex, sampleUv(uv + vec2(d, 0.0))).rgb);    // cópia deslocada p/ direita
    float lb = luma(texture2D(uTex, sampleUv(uv - vec2(d, 0.0))).rgb);    // cópia deslocada p/ esquerda
    outc.r += (lr - l0) * uGlitch * 1.1;                                  // franja vermelha
    outc.b += (lb - l0) * uGlitch * 1.1;                                  // franja azul
    outc = clamp(outc, 0.0, 1.0);
  }

  // Poeira e grão vintage: fade quente + grão de filme + poeira e arranhões.
  if (uDustVintage > 0.001) {
    outc = mix(outc, outc * 0.88 + 0.10, uDustVintage * 0.6);         // fade
    float dvl = luma(outc);
    outc = mix(outc, vec3(dvl) * vec3(1.10, 1.02, 0.86), uDustVintage * 0.3); // sépia suave
    vec2 vco = uv * (uReferenceWidth / 2.0) + uSeed;
    outc += (rand(vco) - 0.5) * uDustVintage * 0.18;                 // grão de filme
    float dv = rand(floor(uv * vec2(300.0, 360.0)) + uSeed * 0.7);
    outc += step(0.9965, dv) * (1.0 - outc) * uDustVintage;          // poeira clara
    outc -= step(dv, 0.0035) * outc * uDustVintage;                  // pontos escuros
    float scrv = rand(vec2(floor(uv.x * 220.0), 4.0));
    outc += smoothstep(0.992, 1.0, scrv) * (1.0 - outc) * 0.5 * uDustVintage; // arranhão
  }

  // Perda de sinal: rasgos horizontais por faixa, quedas em preto e linha de sincronismo.
  if (uSignalLoss > 0.001) {
    float band = floor(uv.y * 18.0);
    float tr = rand(vec2(band, uSeed + 1.0));
    float active = step(0.55, tr);
    float tear = active * (rand(vec2(band, 3.0)) - 0.5) * uSignalLoss * 0.18;
    vec3 s = texture2D(uTex, sampleUv(uv + vec2(tear, 0.0))).rgb;
    outc = mix(outc, s, active * uSignalLoss);                              // rasgo horizontal
    float ca = uSignalLoss * 0.02;
    outc.r = mix(outc.r, texture2D(uTex, sampleUv(uv + vec2(tear + ca, 0.0))).r, active * uSignalLoss); // croma deslocado
    float drop = rand(vec2(floor(uv.y * 40.0), uSeed * 1.7));
    outc *= 1.0 - step(0.9, drop) * uSignalLoss;                            // quedas (faixas pretas)
    float syncLine = step(0.985, rand(vec2(floor(uv.y * 70.0), uSeed)));
    outc += syncLine * uSignalLoss * 0.5;                                   // linha brilhante de sync
  }

  // Interferência: chuvisco (snow) analógico, barras horizontais de ruído e fantasma de croma.
  if (uInterference > 0.001) {
    float snow = rand(uv * uReferenceWidth * 0.8 + uSeed * 2.0) - 0.5;
    outc += snow * uInterference * 0.45;                                    // chuvisco
    float hum = 0.5 + 0.5 * sin(uv.y * 200.0 + uSeed);
    outc *= 1.0 - uInterference * 0.12 * hum;                              // barras horizontais
    vec3 ghost = texture2D(uTex, sampleUv(uv + vec2(uInterference * 0.03, 0.0))).rgb;
    outc = mix(outc, max(outc, ghost), uInterference * 0.35);              // fantasma de croma
  }

  // Scanlines: linhas horizontais de monitor (sem a aberração cromática do CRT).
  if (uScanlines > 0.001) {
    float sl = 0.5 + 0.5 * sin(uv.y * 600.0 * 3.14159265);
    outc *= 1.0 - uScanlines * 0.5 * sl;                                    // escurece as linhas
    outc += uScanlines * 0.04 * (1.0 - sl);                                // leve realce entre linhas
  }

  // ===== Sessão Games (estéticas inspiradas em jogos) =====

  // Fantasma Vermelho (JRPG estiloso, ex. Persona 5): eco/silhueta vermelha deslocada + duotone carmesim.
  if (uPersonaRed > 0.001) {
    float p = uPersonaRed;
    vec2 off = vec2(0.022, -0.016) * p;
    float l0 = luma(srcColor);
    float le = luma(texture2D(uTex, sampleUv(uv + off)).rgb);
    float ghost = clamp((le - l0) * 1.6 + abs(le - l0) * 0.6, 0.0, 1.0);   // eco do deslocado
    float lq = luma(outc);
    vec3 duo = mix(vec3(0.03, 0.0, 0.015), vec3(1.0, 0.16, 0.16), smoothstep(0.18, 0.82, lq));
    outc = mix(outc, duo, p * 0.5);                                        // estilo vermelho/preto
    outc += vec3(1.0, 0.02, 0.06) * ghost * p * 1.2;                       // fantasma vermelho
    outc = clamp(outc, 0.0, 1.0);
  }

  // Fantasma Azul (JRPG melancólico, ex. Persona 3): contornos azuis (edge) + eco azul + duotone frio.
  if (uPersonaBlue > 0.001) {
    float p = uPersonaBlue;
    float lC = luma(srcColor);
    float lU = luma(texture2D(uTex, sampleUv(uv + vec2(0.0,  uTexel.y * 1.5))).rgb);
    float lD = luma(texture2D(uTex, sampleUv(uv + vec2(0.0, -uTexel.y * 1.5))).rgb);
    float lL = luma(texture2D(uTex, sampleUv(uv + vec2(-uTexel.x * 1.5, 0.0))).rgb);
    float lR = luma(texture2D(uTex, sampleUv(uv + vec2( uTexel.x * 1.5, 0.0))).rgb);
    float edge = clamp((abs(lU - lD) + abs(lL - lR)) * 2.6, 0.0, 1.0);     // contorno
    vec2 off = vec2(-0.02, 0.014) * p;
    float le = luma(texture2D(uTex, sampleUv(uv + off)).rgb);
    float ghost = clamp((le - lC) * 1.5 + abs(le - lC) * 0.6, 0.0, 1.0);
    float lq = luma(outc);
    vec3 duo = mix(vec3(0.01, 0.02, 0.06), vec3(0.5, 0.72, 1.0), smoothstep(0.15, 0.85, lq));
    outc = mix(outc, duo, p * 0.5);                                        // azul melancólico
    outc += vec3(0.15, 0.45, 1.0) * edge * p * 1.1;                        // contornos azuis
    outc += vec3(0.10, 0.35, 0.95) * ghost * p * 0.7;                      // fantasma azul
    outc = clamp(outc, 0.0, 1.0);
  }

  // Vigilante Noir (clima "The Batman"): duotone vermelho/âmbar, pretos profundos, vinheta densa.
  if (uDarkKnight > 0.001) {
    float p = uDarkKnight;
    float lq = luma(outc);
    vec3 duo = mix(vec3(0.02, 0.006, 0.0),
                   mix(vec3(0.45, 0.10, 0.05), vec3(1.0, 0.55, 0.30), smoothstep(0.6, 1.0, lq)),
                   smoothstep(0.0, 0.85, lq));
    vec3 look = mix(vec3(lq), duo, 0.92);                                  // dessatura p/ duotone
    look = (look - 0.5) * 1.22 + 0.5;                                      // contraste
    look -= (1.0 - smoothstep(0.0, 0.4, lq)) * 0.18;                       // afunda sombras
    look += vec3(0.22, 0.04, 0.0) * smoothstep(0.72, 1.0, lq);            // brilho vermelho nas luzes
    outc = mix(outc, clamp(look, 0.0, 1.0), p);
    outc *= 1.0 - smoothstep(0.42, 1.0, edist) * p * 0.7;                  // vinheta
  }

  // Cyber Neon (Cyberpunk): aberração cromática, split-tone ciano/magenta e saturação neon.
  if (uCyberNeon > 0.001) {
    float p = uCyberNeon;
    float ab = p * 0.006;
    float rC = texture2D(uTex, sampleUv(uv + vec2(ab, 0.0))).r;
    float bC = texture2D(uTex, sampleUv(uv - vec2(ab, 0.0))).b;
    outc += vec3(rC - srcColor.r, 0.0, bC - srcColor.b) * p;               // aberração cromática
    float lq = luma(outc);
    outc += vec3(-0.05, 0.03, 0.12) * (1.0 - smoothstep(0.0, 0.5, lq)) * p; // sombras ciano
    outc += vec3(0.14, -0.02, 0.10) * smoothstep(0.5, 1.0, lq) * p;        // luzes magenta
    outc = mix(vec3(lq), outc, 1.0 + p * 0.6);                             // satura
    outc = clamp(outc, 0.0, 1.0);
  }

  // Cel-Shade (quadrinho/cartoon): cor posterizada + contornos de tinta preta.
  if (uInkToon > 0.001) {
    float p = uInkToon;
    float lC = luma(srcColor);
    float lU = luma(texture2D(uTex, sampleUv(uv + vec2(0.0, uTexel.y * 1.5))).rgb);
    float lL = luma(texture2D(uTex, sampleUv(uv + vec2(uTexel.x * 1.5, 0.0))).rgb);
    float edge = clamp((abs(lU - lC) + abs(lL - lC)) * 5.0, 0.0, 1.0);     // contorno tinta
    vec3 poster = floor(outc * 4.0 + 0.5) / 4.0;                           // quantiza cor
    outc = mix(outc, poster, p * 0.85);
    outc = mix(outc, vec3(0.02), edge * p);                               // tinta preta nos contornos
    outc = clamp(outc, 0.0, 1.0);
  }

  // Névoa Sombria (survival horror): dessatura, escurece, névoa das bordas e grão pesado.
  if (uDreadFog > 0.001) {
    float p = uDreadFog;
    float lq = luma(outc);
    vec3 fog = mix(outc, vec3(lq), 0.7);                                   // dessatura
    fog *= 0.72;                                                           // escurece
    fog = (fog - 0.5) * 1.1 + 0.5;                                         // contraste
    float fv = smoothstep(0.2, 1.0, edist);                               // névoa cresce das bordas
    fog = mix(fog, vec3(0.32, 0.34, 0.31), fv * 0.5);                      // névoa cinza-esverdeada
    fog += (rand(uv * uReferenceWidth * 0.6 + uSeed) - 0.5) * 0.18;        // grão pesado
    outc = mix(outc, clamp(fog, 0.0, 1.0), p);
  }

  // ===== Sessão Leak (vazamentos de luz, todos em mistura screen) =====

  // Light Leak quente: vazamento de luz vindo dos cantos.
  if (uLightLeak > 0.001) {
    float p = uLightLeak;
    float l1 = smoothstep(0.95, 0.1, distance(uv, vec2(1.06, 1.06)));      // canto sup-direito
    float l2 = smoothstep(0.75, 0.1, distance(uv, vec2(-0.06, -0.06)));    // canto inf-esquerdo
    vec3 leak = vec3(1.0, 0.55, 0.2) * l1 + vec3(1.0, 0.32, 0.42) * l2 * 0.7;
    outc = 1.0 - (1.0 - outc) * (1.0 - clamp(leak * p, 0.0, 1.0));         // screen
    outc = clamp(outc, 0.0, 1.0);
  }

  // Risco Diagonal: faixa dourada quente cruzando o quadro na diagonal.
  if (uLeakStreak > 0.001) {
    float p = uLeakStreak;
    float d = (uv.x + uv.y) * 0.5;                                         // posição ao longo da diagonal
    float band = exp(-pow((d - 0.62) * 5.0, 2.0));                         // banda gaussiana suave
    band += exp(-pow((d - 0.40) * 12.0, 2.0)) * 0.4;                       // risco secundário fino
    vec3 streak = vec3(1.0, 0.72, 0.32) * band;                           // dourado-quente
    outc = 1.0 - (1.0 - outc) * (1.0 - clamp(streak * p, 0.0, 1.0));
    outc = clamp(outc, 0.0, 1.0);
  }

  // Arco-íris Prisma: banda de dispersão com matiz variando ao longo dela.
  if (uLeakRainbow > 0.001) {
    float p = uLeakRainbow;
    float d = uv.x - uv.y;                                                 // coordenada diagonal
    float band = exp(-pow((d - 0.05) * 2.6, 2.0));                         // largura da banda
    vec3 rainbow = hsl2rgb(vec3(fract(d * 0.5 + 0.6), 0.9, 0.6));         // espectro
    outc = 1.0 - (1.0 - outc) * (1.0 - clamp(rainbow * band * p, 0.0, 1.0));
    outc = clamp(outc, 0.0, 1.0);
  }

  // Fim de Rolo: faixa vermelha/laranja intensa numa borda (queima de fim de filme).
  if (uLeakEdge > 0.001) {
    float p = uLeakEdge;
    float edge = smoothstep(0.55, 1.02, uv.x);                            // cresce para a direita
    edge *= 0.82 + 0.18 * sin(uv.y * 13.0 + uSeed);                       // ondulação irregular
    vec3 burn = mix(vec3(1.0, 0.45, 0.1), vec3(1.0, 0.12, 0.04), smoothstep(0.7, 1.0, uv.x));
    outc = 1.0 - (1.0 - outc) * (1.0 - clamp(burn * edge * p, 0.0, 1.0));
    outc = clamp(outc, 0.0, 1.0);
  }

  // Reflexo de Lente: orbe/hotspot dourado suave com halo secundário.
  if (uLeakSpot > 0.001) {
    float p = uLeakSpot;
    float d = distance(uv, vec2(0.72, 0.30));                             // posição do orbe
    float orb = exp(-pow(d * 4.0, 2.0));                                   // brilho central
    orb += exp(-pow((d - 0.18) * 16.0, 2.0)) * 0.4;                        // halo
    vec3 flare = vec3(1.0, 0.85, 0.5) * orb;
    outc = 1.0 - (1.0 - outc) * (1.0 - clamp(flare * p, 0.0, 1.0));
    outc = clamp(outc, 0.0, 1.0);
  }

  // ===== Extras de Filme & Grão =====

  // Brilho Difuso (pro-mist): glow suave e sonhador espalhando as altas luzes + leve haze.
  if (uFilmBloom > 0.001) {
    float p = uFilmBloom;
    vec3 bloom = texture2D(uTex, sampleUv(uv + vec2( 0.010, 0.0))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(-0.010, 0.0))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(0.0,  0.010))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(0.0, -0.010))).rgb
               + texture2D(uTex, sampleUv(uv + vec2( 0.016,  0.016))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(-0.016,  0.016))).rgb
               + texture2D(uTex, sampleUv(uv + vec2( 0.016, -0.016))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(-0.016, -0.016))).rgb;
    bloom *= 0.125;
    float hl = smoothstep(0.4, 1.0, luma(bloom));
    outc = 1.0 - (1.0 - outc) * (1.0 - bloom * hl * p * 0.9);              // screen nos brilhos
    outc = mix(outc, outc * 0.92 + 0.08, p * 0.4);                         // leve haze (lift dos pretos)
    outc = clamp(outc, 0.0, 1.0);
  }

  // Flare Anamórfico: risco horizontal azul saindo das altas luzes (cinematográfico).
  if (uAnamorphic > 0.001) {
    float p = uAnamorphic;
    vec3 streak = vec3(0.0);
    for (int i = 1; i <= 6; i++) {
      float d = float(i) * 0.012;
      streak += texture2D(uTex, sampleUv(uv + vec2(d, 0.0))).rgb * (1.0 - float(i) / 7.0);
      streak += texture2D(uTex, sampleUv(uv - vec2(d, 0.0))).rgb * (1.0 - float(i) / 7.0);
    }
    streak /= 8.0;
    float hl = smoothstep(0.6, 1.0, luma(streak));
    outc += vec3(0.2, 0.4, 1.0) * hl * p * 1.2;                            // flare azul horizontal
    outc = clamp(outc, 0.0, 1.0);
  }

  // ===== Extras de Games =====

  // Pixel Art: pixeliza (grade) + reduz a paleta, estilo console retrô.
  if (uPixelArt > 0.001) {
    float p = uPixelArt;
    float cells = mix(220.0, 60.0, p);                                     // menos células = mais pixelado
    vec2 snapped = (floor(uv * cells) + 0.5) / cells;
    vec3 px = texture2D(uTex, sampleUv(snapped)).rgb;
    px = floor(px * 6.0 + 0.5) / 6.0;                                      // posteriza a paleta
    outc = mix(outc, clamp(px, 0.0, 1.0), p);
  }

  // LCD Verde: pixeliza grosso e mapeia a luminância para 4 tons verdes (portátil clássico).
  if (uGameboy > 0.001) {
    float p = uGameboy;
    float cells = mix(200.0, 84.0, p);
    vec2 snapped = (floor(uv * cells) + 0.5) / cells;
    float lp = luma(texture2D(uTex, sampleUv(snapped)).rgb);
    float q = clamp(floor(lp * 4.0) / 3.0, 0.0, 1.0);                      // 4 níveis
    vec3 gb = mix(vec3(0.06, 0.22, 0.06), vec3(0.61, 0.74, 0.06), q);      // paleta verde DMG
    outc = mix(outc, gb, p);
  }

  // Visão Térmica: mapa de calor infravermelho a partir da luminância (frio → quente).
  if (uThermal > 0.001) {
    float p = uThermal;
    float l = luma(srcColor);
    vec3 heat = vec3(0.0, 0.0, 0.5) * smoothstep(0.0, 0.3, l);             // azul escuro
    heat = mix(heat, vec3(0.6, 0.0, 0.7), smoothstep(0.2, 0.45, l));       // roxo
    heat = mix(heat, vec3(1.0, 0.1, 0.0), smoothstep(0.4, 0.65, l));       // vermelho
    heat = mix(heat, vec3(1.0, 0.8, 0.0), smoothstep(0.6, 0.85, l));       // amarelo
    heat = mix(heat, vec3(1.0, 1.0, 1.0), smoothstep(0.85, 1.0, l));       // branco quente
    outc = mix(outc, clamp(heat, 0.0, 1.0), p);
  }

  // Vaporwave: duotone rosa/ciano synthwave + gradiente de céu + scanlines (estilo Outrun).
  if (uVaporwave > 0.001) {
    float p = uVaporwave;
    float l = luma(outc);
    vec3 grad = mix(vec3(0.25, 0.0, 0.5), vec3(1.0, 0.2, 0.6), smoothstep(0.0, 0.6, l)); // sombras roxas → rosa
    grad = mix(grad, vec3(0.2, 0.9, 1.0), smoothstep(0.6, 1.0, l));        // luzes ciano
    grad += mix(vec3(0.15, 0.0, 0.2), vec3(0.0, 0.1, 0.15), uv.y) * 0.3;   // gradiente de céu
    outc = mix(outc, clamp(grad, 0.0, 1.0), p * 0.85);
    outc *= 1.0 - p * 0.12 * (0.5 + 0.5 * sin(uv.y * 300.0 * 3.14159265)); // scanlines suaves
    outc = clamp(outc, 0.0, 1.0);
  }

  gl_FragColor = vec4(clamp(outc, 0.0, 1.0), 1.0);
}
`
