import createREGL from 'regl'
import type { Regl, Texture2D, DrawCommand } from 'regl'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shaders'
import { UNIFORM_NAMES, type PipelineUniforms } from './params'

/**
 * Contexto WebGL compartilhado (regl) para o pipeline de imagem.
 * Único contexto para todas as camadas; o resultado é copiado para um canvas 2D por camada.
 */
class GLContext {
  private regl: Regl
  private draw: DrawCommand
  private glCanvas: HTMLCanvasElement
  private textures = new Map<string, { tex: Texture2D; w: number; h: number }>()
  /** LUT 256×1 RGBA das curvas de tom (atualizada por camada em process()). */
  private lutTex: Texture2D

  constructor() {
    this.glCanvas = document.createElement('canvas')
    this.glCanvas.width = 16
    this.glCanvas.height = 16
    this.regl = createREGL({
      canvas: this.glCanvas,
      attributes: { preserveDrawingBuffer: true, premultipliedAlpha: false }
    })

    // Uniforms de array GLSL (`uniform float x[N]`): o regl exige os elementos
    // indexados (`x[0]`..`x[N-1]`), não o nome-base. params.ts entrega o array
    // plano sob o nome-base; aqui expandimos lendo cada índice dele.
    const ARRAY_UNIFORMS: Record<string, number> = { uHslHue: 8, uHslSat: 8, uHslLum: 8 }

    const uniforms: Record<string, unknown> = {
      uTex: this.regl.prop('uTex' as never),
      uTexel: this.regl.prop('uTexel' as never),
      uCurveLUT: this.regl.prop('uCurveLUT' as never)
    }
    for (const name of UNIFORM_NAMES) {
      const len = ARRAY_UNIFORMS[name]
      if (len) {
        for (let i = 0; i < len; i++) {
          uniforms[`${name}[${i}]`] = (_ctx: unknown, props: PipelineUniforms) => (props[name] as number[])[i]
        }
      } else {
        uniforms[name] = this.regl.prop(name as never)
      }
    }

    // LUT de curvas começa como identidade (r=g=b=a=i); atualizada por camada em process().
    const identity = new Uint8Array(256 * 4)
    for (let i = 0; i < 256; i++) {
      const o = i * 4
      identity[o] = identity[o + 1] = identity[o + 2] = identity[o + 3] = i
    }
    this.lutTex = this.regl.texture({
      width: 256,
      height: 1,
      format: 'rgba',
      data: identity,
      min: 'linear',
      mag: 'linear',
      wrap: 'clamp'
    })

    this.draw = this.regl({
      frag: FRAGMENT_SHADER,
      vert: VERTEX_SHADER,
      attributes: { position: [-1, -1, 3, -1, -1, 3] },
      uniforms: uniforms as never,
      count: 3
    })
  }

  private getTexture(assetId: string, image: HTMLImageElement): Texture2D {
    const cached = this.textures.get(assetId)
    if (cached) return cached.tex
    const tex = this.regl.texture({ data: image, flipY: true, min: 'linear', mag: 'linear' })
    this.textures.set(assetId, { tex, w: image.naturalWidth, h: image.naturalHeight })
    return tex
  }

  releaseTexture(assetId: string): void {
    const cached = this.textures.get(assetId)
    if (cached) {
      cached.tex.destroy()
      this.textures.delete(assetId)
    }
  }

  /** Processa uma imagem e escreve o resultado em `out` (canvas 2D), no tamanho w×h. */
  process(
    assetId: string,
    image: HTMLImageElement,
    uniforms: PipelineUniforms,
    out: HTMLCanvasElement,
    w: number,
    h: number
  ): void {
    const width = Math.max(1, Math.round(w))
    const height = Math.max(1, Math.round(h))
    if (this.glCanvas.width !== width || this.glCanvas.height !== height) {
      this.glCanvas.width = width
      this.glCanvas.height = height
    }
    this.regl.poll()
    const tex = this.getTexture(assetId, image)
    // Atualiza a textura de LUT das curvas (bytes vêm de buildUniforms); curveLUT não é uniform escalar.
    const { curveLUT, ...rest } = uniforms
    if (curveLUT instanceof Uint8Array) {
      this.lutTex({ width: 256, height: 1, format: 'rgba', data: curveLUT })
    }
    this.regl.clear({ color: [0, 0, 0, 1], depth: 1 })
    this.draw({ uTex: tex, uTexel: [1 / width, 1 / height], uCurveLUT: this.lutTex, ...rest } as never)

    if (out.width !== width) out.width = width
    if (out.height !== height) out.height = height
    const ctx = out.getContext('2d')!
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(this.glCanvas, 0, 0)
  }
}

let instance: GLContext | null = null

export function getGLContext(): GLContext {
  if (!instance) instance = new GLContext()
  return instance
}
