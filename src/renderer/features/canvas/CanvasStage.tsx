import { useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Group, Rect, Text, Transformer } from 'react-konva'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { DumpItem, Layer as LayerModel, ImageLayerData } from '@shared/types'
import { useEditorStore } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { resolveBackground } from './background'
import { LayerNode } from './nodes'
import { CanvasOverlay } from './CanvasOverlay'
import { computeView } from './viewTransform'
import { slotRectToTransform, coverCropForSlot } from './layoutSlots'

interface Props {
  item: DumpItem
  width: number
  height: number
}

export function CanvasStage({ item, width, height }: Props): JSX.Element {
  const stageRef = useRef<Konva.Stage>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const zoom = useEditorStore((s) => s.ui?.canvasZoom ?? 1)
  const panX = useEditorStore((s) => s.ui?.canvasPanX ?? 0)
  const panY = useEditorStore((s) => s.ui?.canvasPanY ?? 0)
  const selectedIds = useEditorStore((s) => s.ui?.selectedLayerIds ?? [])
  const quickMenu = useEditorStore((s) => s.ui?.quickMenu)
  const lineThickness = usePreferencesStore((s) => s.prefs?.appearance.overlayLineThickness ?? 2)
  const darkTheme = usePreferencesStore((s) => s.prefs?.appearance.theme === 'noir_dark')
  const selectionColor = darkTheme ? '#efa0cc' : '#b71e70'
  const tool = useUiStore((s) => s.tool)
  const setTool = useUiStore((s) => s.setTool)
  const setRotationHint = useUiStore((s) => s.setRotationHint)
  const [guides, setGuides] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] })

  const selectLayer = useEditorStore((s) => s.selectLayer)
  const toggleSelection = useEditorStore((s) => s.toggleSelection)
  const setSelection = useEditorStore((s) => s.setSelection)
  const clearSelection = useEditorStore((s) => s.clearSelection)
  const captureHistory = useEditorStore((s) => s.captureHistory)
  const updateLayerTransform = useEditorStore((s) => s.updateLayerTransform)
  const setZoom = useEditorStore((s) => s.setZoom)
  const setPan = useEditorStore((s) => s.setPan)
  const resetView = useEditorStore((s) => s.resetView)
  const updateCrop = useEditorStore((s) => s.updateCrop)

  const groupRef = useRef<Konva.Group>(null)
  const midPan = useRef<{ startX: number; startY: number; startOX: number; startOY: number } | null>(null)
  const lastMiddleDown = useRef(0)

  const doc = item.canvas
  const { scale, offsetX, offsetY } = useMemo(
    () => computeView({ width, height }, doc, zoom, panX, panY),
    [width, height, doc.width, doc.height, zoom, panX, panY]
  )
  const fitScale = scale / Math.max(zoom, 0.0001)

  const sorted = [...item.layers].sort((a, b) => a.orderIndex - b.orderIndex)
  const background = String(doc.backgroundColor)

  // Layout de encaixe (placeholders). Geometria dos slots derivada (fonte única de verdade).
  const layout = doc.layout ?? null
  const slotRects = useMemo(
    () => (layout ? layout.slots.map((sl) => slotRectToTransform(sl, doc, layout.gutter)) : null),
    [layout, doc.width, doc.height]
  )
  const isSlotImage = (l: LayerModel): boolean =>
    !!layout && l.type === 'image' && (l.data as ImageLayerData).slotIndex != null
  // Índice do slot para imagens E overlays atrelados a um slot (modo layout); null = camada livre.
  const layerSlotIndex = (l: LayerModel): number | null => {
    if (!layout || (l.type !== 'image' && l.type !== 'overlay')) return null
    const idx = (l.data as { slotIndex?: number }).slotIndex
    return idx != null ? idx : null
  }
  const lastSlotZoom = useRef(0)
  const occupied = new Set<number>()
  for (const l of item.layers) if (isSlotImage(l)) occupied.add((l.data as ImageLayerData).slotIndex as number)
  const emptySlots = slotRects ? slotRects.map((rect, i) => ({ rect, i })).filter(({ i }) => !occupied.has(i)) : []
  // Imagens de slot selecionadas → contorno sutil (slots não usam o Transformer).
  const selectedSlotRects = slotRects
    ? item.layers
        .filter((l) => isSlotImage(l) && selectedIds.includes(l.id))
        .map((l) => slotRects[(l.data as ImageLayerData).slotIndex as number])
        .filter(Boolean)
    : []

  // Attach transformer aos nós selecionados (ignora bloqueados e fundo).
  useEffect(() => {
    const stage = stageRef.current
    const tr = trRef.current
    if (!stage || !tr) return
    const nodes = selectedIds
      .map((id) => stage.findOne<Konva.Node>(`#${id}`))
      .filter((n): n is Konva.Node => {
        if (!n) return false
        const layer = item.layers.find((l) => l.id === n.id())
        // Slot images usam pan dedicado (sem Transformer); overlays de slot são livres (transformáveis).
        return !!layer && !layer.locked && layer.type !== 'background' && !isSlotImage(layer)
      })
    tr.nodes(nodes)
    tr.getLayer()?.batchDraw()
  }, [selectedIds, item.layers, scale, layout])

  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const marqueeStart = useRef<{ x: number; y: number } | null>(null)

  const baseCenter = (): { x: number; y: number } => ({
    x: (width - doc.width * scale) / 2,
    y: (height - doc.height * scale) / 2
  })

  // Pan (mão/botão do meio): usa listeners de janela para funcionar mesmo soltando fora do canvas.
  const startPan = (stage: Konva.Stage, startPx: number, startPy: number): void => {
    if (midPan.current) return
    midPan.current = { startX: startPx, startY: startPy, startOX: offsetX, startOY: offsetY }
    const base = baseCenter()
    const rect = stage.container().getBoundingClientRect()
    stage.container().style.cursor = 'grabbing'

    const move = (ev: MouseEvent): void => {
      const px = ev.clientX - rect.left
      const py = ev.clientY - rect.top
      const clamped = clampPan(midPan.current!.startOX + (px - startPx) - base.x, midPan.current!.startOY + (py - startPy) - base.y, scale)
      groupRef.current?.position({ x: base.x + clamped.x, y: base.y + clamped.y })
      groupRef.current?.getLayer()?.batchDraw()
    }
    const up = (): void => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      const node = groupRef.current
      if (node) setPan(node.x() - base.x, node.y() - base.y)
      stage.container().style.cursor = tool === 'pan' ? 'grab' : 'default'
      midPan.current = null
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  const onStageMouseDown = (e: KonvaEventObject<MouseEvent>): void => {
    const stage = stageRef.current
    const pos = stage?.getPointerPosition()

    // Botão do meio: duplo-clique = ajustar à tela; clique/segurar = modo Pan + arrasta.
    if (e.evt.button === 1) {
      e.evt.preventDefault()
      const now = Date.now()
      if (now - lastMiddleDown.current < 350) {
        lastMiddleDown.current = 0
        resetView()
        return
      }
      lastMiddleDown.current = now
      setTool('pan')
      if (stage && pos) startPan(stage, pos.x, pos.y)
      return
    }
    if (e.evt.button !== 0) return

    const isEmpty = e.target === e.target.getStage()

    // Ferramenta mão: arrasta o viewport (botão esquerdo em área vazia).
    if (tool === 'pan') {
      if (isEmpty && stage && pos) startPan(stage, pos.x, pos.y)
      return
    }

    // Ferramenta selecionar: marquee em área vazia.
    if (!isEmpty || !pos) return
    clearSelection()
    marqueeStart.current = pos
    setMarquee({ x: pos.x, y: pos.y, w: 0, h: 0 })
  }

  const onStageMouseMove = (): void => {
    const stage = stageRef.current
    if (!stage || !marqueeStart.current) return
    const pos = stage.getPointerPosition()
    if (!pos) return
    const s = marqueeStart.current
    setMarquee({
      x: Math.min(s.x, pos.x),
      y: Math.min(s.y, pos.y),
      w: Math.abs(pos.x - s.x),
      h: Math.abs(pos.y - s.y)
    })
  }

  const onStageMouseUp = (): void => {
    if (marquee && marqueeStart.current && (marquee.w > 4 || marquee.h > 4)) {
      // Converte o retângulo de tela para coords do documento.
      const docRect = {
        x: (marquee.x - offsetX) / scale,
        y: (marquee.y - offsetY) / scale,
        w: marquee.w / scale,
        h: marquee.h / scale
      }
      const hits = sorted
        .filter((l) => l.type !== 'background' && l.visible && !l.locked)
        .filter((l) => {
          const t = l.transform
          return (
            t.x < docRect.x + docRect.w &&
            t.x + t.width > docRect.x &&
            t.y < docRect.y + docRect.h &&
            t.y + t.height > docRect.y
          )
        })
        .map((l) => l.id)
      if (hits.length) setSelection(hits)
    }
    marqueeStart.current = null
    setMarquee(null)
  }

  // Impede que o canvas suma de vez: mantém ao menos uma margem visível na viewport.
  const clampPan = (px: number, py: number, sc: number): { x: number; y: number } => {
    const MARGIN = 80
    const halfW = (doc.width * sc) / 2
    const halfH = (doc.height * sc) / 2
    return {
      x: Math.max(MARGIN - width / 2 - halfW, Math.min(width / 2 - MARGIN + halfW, px)),
      y: Math.max(MARGIN - height / 2 - halfH, Math.min(height / 2 - MARGIN + halfH, py))
    }
  }

  const onWheel = (e: KonvaEventObject<WheelEvent>): void => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    // Sobre uma imagem de slot → zoom na foto dentro do slot (não no viewport).
    if (layout) {
      const hit = stage.getIntersection(pointer)
      const lid = hit?.getParent()?.id()
      const layer = lid ? item.layers.find((l) => l.id === lid) : undefined
      if (layer && isSlotImage(layer) && !layer.locked) {
        zoomSlot(layer, e.evt.deltaY)
        return
      }
    }
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const next = Math.min(8, Math.max(0.1, zoom * (1 + direction * 0.12)))
    // Mantém o ponto sob o cursor estável.
    const nextScale = fitScale * next
    const worldX = (pointer.x - offsetX) / scale
    const worldY = (pointer.y - offsetY) / scale
    const newOffsetX = pointer.x - worldX * nextScale
    const newOffsetY = pointer.y - worldY * nextScale
    const panned = clampPan(
      newOffsetX - (width - doc.width * nextScale) / 2,
      newOffsetY - (height - doc.height * nextScale) / 2,
      nextScale
    )
    setPan(panned.x, panned.y)
    setZoom(next)
  }

  const onLayerDragMove = (layerId: string, node: Konva.Node): void => {
    if (!quickMenu?.smartGuidesEnabled && !quickMenu?.snapEnabled) return
    const layer = item.layers.find((l) => l.id === layerId)
    if (!layer) return
    const w = layer.transform.width
    const h = layer.transform.height
    const x = node.x()
    const y = node.y()
    const threshold = 7 / scale

    const vTargets = [0, doc.width / 2, doc.width]
    const hTargets = [0, doc.height / 2, doc.height]
    for (const l of item.layers) {
      if (l.id === layerId || l.type === 'background' || isSlotImage(l)) continue
      vTargets.push(l.transform.x, l.transform.x + l.transform.width / 2, l.transform.x + l.transform.width)
      hTargets.push(l.transform.y, l.transform.y + l.transform.height / 2, l.transform.y + l.transform.height)
    }
    const vAnchors = [x, x + w / 2, x + w]
    const hAnchors = [y, y + h / 2, y + h]
    const vLines: number[] = []
    const hLines: number[] = []

    for (let i = 0; i < 3; i++) {
      for (const t of vTargets) {
        if (Math.abs(vAnchors[i] - t) < threshold) {
          if (quickMenu?.snapEnabled) node.x(x + (t - vAnchors[i]))
          vLines.push(t)
          break
        }
      }
      if (vLines.length) break
    }
    for (let i = 0; i < 3; i++) {
      for (const t of hTargets) {
        if (Math.abs(hAnchors[i] - t) < threshold) {
          if (quickMenu?.snapEnabled) node.y(y + (t - hAnchors[i]))
          hLines.push(t)
          break
        }
      }
      if (hLines.length) break
    }
    setGuides({ v: vLines, h: hLines })
  }

  // Pan dentro do slot: arrasta a parte visível (move crop.rect), eixo central, sem mover o nó.
  const startSlotPan = (layer: LayerModel, e: KonvaEventObject<MouseEvent>): void => {
    const data = layer.data as ImageLayerData
    if (!slotRects || data.slotIndex == null || layer.locked || !layer.crop) return
    const slot = slotRects[data.slotIndex]
    const startRect = { ...layer.crop.rect }
    const startX = e.evt.clientX
    const startY = e.evt.clientY
    let captured = false
    let raf = 0
    let pending: { x: number; y: number; width: number; height: number } | null = null
    const flush = (): void => {
      raf = 0
      if (pending) updateCrop(layer.id, { rect: pending })
    }
    const move = (ev: MouseEvent): void => {
      if (!captured) {
        captureHistory()
        captured = true
      }
      const dxDoc = (ev.clientX - startX) / scale
      const dyDoc = (ev.clientY - startY) / scale
      const nx = Math.max(0, Math.min(1 - startRect.width, startRect.x - (dxDoc / slot.width) * startRect.width))
      const ny = Math.max(0, Math.min(1 - startRect.height, startRect.y - (dyDoc / slot.height) * startRect.height))
      pending = { ...startRect, x: nx, y: ny }
      if (!raf) raf = requestAnimationFrame(flush)
    }
    const up = (): void => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      if (raf) cancelAnimationFrame(raf)
      flush()
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  // Zoom dentro do slot: escala crop.rect em torno do centro, mantendo o aspect do slot.
  const zoomSlot = (layer: LayerModel, deltaY: number): void => {
    const data = layer.data as ImageLayerData
    if (!slotRects || data.slotIndex == null || !layer.crop) return
    const slot = slotRects[data.slotIndex]
    const cover = coverCropForSlot(data.originalWidth, data.originalHeight, slot.width, slot.height)
    const ratio = cover.width / cover.height
    const rect = layer.crop.rect
    const k = deltaY < 0 ? 0.9 : 1 / 0.9
    let nw = Math.max(cover.width * 0.25, Math.min(cover.width, rect.width * k))
    let nh = nw / ratio
    if (nh > cover.height) {
      nh = cover.height
      nw = nh * ratio
    }
    const cx = rect.x + rect.width / 2
    const cy = rect.y + rect.height / 2
    const nx = Math.max(0, Math.min(1 - nw, cx - nw / 2))
    const ny = Math.max(0, Math.min(1 - nh, cy - nh / 2))
    const now = Date.now()
    if (now - lastSlotZoom.current > 400) captureHistory()
    lastSlotZoom.current = now
    updateCrop(layer.id, { rect: { x: nx, y: ny, width: nw, height: nh } })
  }

  if (width <= 0 || height <= 0) return <div />

  // Transformer already uses screen coordinates; scaling again enlarges handles when zoomed out.
  const anchorSize = 9

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onMouseDown={onStageMouseDown}
      onMouseMove={onStageMouseMove}
      onMouseUp={onStageMouseUp}
      onWheel={onWheel}
      style={{ cursor: tool === 'pan' ? 'grab' : 'default' }}
    >
      <Layer>
        <Group ref={groupRef} x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
          {/* Sombra/borda da página */}
          <Rect
            x={-1}
            y={-1}
            width={doc.width + 2}
            height={doc.height + 2}
            stroke="#000000"
            strokeWidth={1 / scale}
            shadowColor="#000000"
            shadowBlur={40 / scale}
            shadowOpacity={darkTheme ? 0.6 : 0.16}
            listening={false}
            fill={resolveBackground(background) ? undefined : '#0b0b0b'}
          />
          {/* Conteúdo da página recortado às bordas (overflow hidden, como um artboard). */}
          <Group clip={{ x: 0, y: 0, width: doc.width, height: doc.height }}>
            {sorted.map((layer) => (
              <LayerNode
                key={layer.id}
                layer={layer}
                docWidth={doc.width}
                docHeight={doc.height}
                background={background}
                slotRect={
                  slotRects && layerSlotIndex(layer) != null
                    ? slotRects[layerSlotIndex(layer) as number]
                    : undefined
                }
                slotLocked={isSlotImage(layer)}
                onSelect={(e) => {
                  if (e.evt.button === 1) return // botão do meio → deixa o pan acontecer
                  e.cancelBubble = true
                  setTool('select') // selecionar uma foto volta para a ferramenta Selecionar/Mover
                  if (e.evt.ctrlKey || e.evt.metaKey) toggleSelection(layer.id)
                  else selectLayer(layer.id)
                  if (e.evt.button === 0 && isSlotImage(layer)) startSlotPan(layer, e)
                }}
                onDragStart={captureHistory}
                onDragMove={(node) => onLayerDragMove(layer.id, node)}
                onChange={(t) => {
                  updateLayerTransform(layer.id, t)
                  setGuides({ v: [], h: [] })
                }}
              />
            ))}
            {/* Placeholders dos slots vazios — acima do fundo, nunca exportados. */}
            {emptySlots.map(({ rect, i }) => (
              <Group key={`slot-${i}`} listening={false} x={rect.x} y={rect.y} rotation={rect.rotation}>
                <Rect
                  x={0}
                  y={0}
                  width={rect.width}
                  height={rect.height}
                  cornerRadius={10}
                  fill="rgba(255,255,255,0.04)"
                  stroke="#6a6a6a"
                  strokeWidth={1.5 / scale}
                  dash={[10 / scale, 8 / scale]}
                />
                <Text
                  x={0}
                  y={0}
                  width={rect.width}
                  height={rect.height}
                  text="+"
                  align="center"
                  verticalAlign="middle"
                  fontSize={Math.min(rect.width, rect.height) * 0.28}
                  fill="#8a8a8a"
                />
              </Group>
            ))}
            {/* Contorno sutil da imagem de slot selecionada (slots não têm Transformer). */}
            {selectedSlotRects.map((rect, i) => (
              <Rect
                key={`sel-${i}`}
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                rotation={rect.rotation}
                stroke={selectionColor}
                strokeWidth={2 / scale}
                opacity={0.55}
                listening={false}
              />
            ))}
          </Group>
          <CanvasOverlay
            docWidth={doc.width}
            docHeight={doc.height}
            scale={scale}
            gridEnabled={!!quickMenu?.gridEnabled}
            gridType={quickMenu?.gridType ?? 'off'}
            safeMargins={!!quickMenu?.safeMarginsEnabled}
            guides={guides}
            lineThickness={lineThickness}
          />
          <Transformer
            ref={trRef}
            rotateEnabled
            anchorSize={anchorSize}
            anchorStrokeWidth={1}
            anchorStroke={selectionColor}
            anchorFill={darkTheme ? '#0b0b0b' : '#ffffff'}
            borderStroke={selectionColor}
            borderStrokeWidth={1}
            anchorCornerRadius={2}
            rotateAnchorOffset={24}
            ignoreStroke
            boundBoxFunc={(oldBox, newBox) => (newBox.width < 8 || newBox.height < 8 ? oldBox : newBox)}
            onTransform={() => {
              const tr = trRef.current
              const node = tr?.nodes()[0]
              if (!tr || !node || tr.getActiveAnchor() !== 'rotater') return
              const pointer = stageRef.current?.getPointerPosition()
              const deg = Math.round((((node.rotation() % 360) + 360) % 360))
              if (pointer) setRotationHint({ degrees: deg, x: pointer.x, y: pointer.y })
            }}
            onTransformEnd={() => setRotationHint(null)}
          />
        </Group>
      </Layer>

      {/* Overlay do marquee (coords de tela) */}
      {marquee && (
        <Layer listening={false}>
          <Rect
            x={marquee.x}
            y={marquee.y}
            width={marquee.w}
            height={marquee.h}
            fill="rgba(183,30,112,0.10)"
            stroke={selectionColor}
            strokeWidth={1}
            dash={[4, 3]}
          />
        </Layer>
      )}
    </Stage>
  )
}
