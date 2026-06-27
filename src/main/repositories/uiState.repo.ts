import { v4 as uuid } from 'uuid'
import { getDb } from '../db/connection'
import { fromBool, nowIso, parseJson, toBool } from './mappers'
import type { ProjectUiState, RightTab, GridType, ThumbnailView } from '@shared/types'

interface UiStateRow {
  id: string
  project_id: string
  active_dump_item_id: string | null
  selected_layer_id: string | null
  selected_layer_ids_json: string
  filmstrip_collapsed: number
  filmstrip_thumbnail_size: number
  filmstrip_view: string
  active_right_tab: string
  canvas_zoom: number
  canvas_pan_x: number
  canvas_pan_y: number
  quick_menu_grid_enabled: number
  quick_menu_grid_type: string
  quick_menu_rulers_enabled: number
  quick_menu_smart_guides_enabled: number
  quick_menu_snap_enabled: number
  quick_menu_safe_margins_enabled: number
  left_sidebar_collapsed: number
  right_sidebar_collapsed: number
  created_at: string
  updated_at: string
}

function rowToUiState(r: UiStateRow): ProjectUiState {
  return {
    projectId: r.project_id,
    activeDumpItemId: r.active_dump_item_id ?? undefined,
    selectedLayerId: r.selected_layer_id,
    selectedLayerIds: parseJson<string[]>(r.selected_layer_ids_json, []),
    filmstripCollapsed: toBool(r.filmstrip_collapsed),
    filmstripThumbnailSize: r.filmstrip_thumbnail_size,
    filmstripView: r.filmstrip_view as ThumbnailView,
    activeRightTab: r.active_right_tab as RightTab,
    canvasZoom: r.canvas_zoom,
    canvasPanX: r.canvas_pan_x,
    canvasPanY: r.canvas_pan_y,
    quickMenu: {
      gridEnabled: toBool(r.quick_menu_grid_enabled),
      gridType: r.quick_menu_grid_type as GridType,
      rulersEnabled: toBool(r.quick_menu_rulers_enabled),
      smartGuidesEnabled: toBool(r.quick_menu_smart_guides_enabled),
      snapEnabled: toBool(r.quick_menu_snap_enabled),
      safeMarginsEnabled: toBool(r.quick_menu_safe_margins_enabled)
    },
    leftSidebarCollapsed: toBool(r.left_sidebar_collapsed),
    rightSidebarCollapsed: toBool(r.right_sidebar_collapsed),
    updatedAt: r.updated_at
  }
}

export const uiStateRepo = {
  get(projectId: string): ProjectUiState | undefined {
    const row = getDb()
      .prepare('SELECT * FROM project_ui_state WHERE project_id = ?')
      .get(projectId) as UiStateRow | undefined
    return row ? rowToUiState(row) : undefined
  },

  upsert(state: ProjectUiState): void {
    const now = nowIso()
    const params = {
      project_id: state.projectId,
      active_dump_item_id: state.activeDumpItemId ?? null,
      selected_layer_id: state.selectedLayerId ?? null,
      selected_layer_ids_json: JSON.stringify(state.selectedLayerIds ?? []),
      filmstrip_collapsed: fromBool(state.filmstripCollapsed),
      filmstrip_thumbnail_size: state.filmstripThumbnailSize,
      filmstrip_view: state.filmstripView,
      active_right_tab: state.activeRightTab,
      canvas_zoom: state.canvasZoom,
      canvas_pan_x: state.canvasPanX,
      canvas_pan_y: state.canvasPanY,
      quick_menu_grid_enabled: fromBool(state.quickMenu.gridEnabled),
      quick_menu_grid_type: state.quickMenu.gridType,
      quick_menu_rulers_enabled: fromBool(state.quickMenu.rulersEnabled),
      quick_menu_smart_guides_enabled: fromBool(state.quickMenu.smartGuidesEnabled),
      quick_menu_snap_enabled: fromBool(state.quickMenu.snapEnabled),
      quick_menu_safe_margins_enabled: fromBool(state.quickMenu.safeMarginsEnabled),
      left_sidebar_collapsed: fromBool(state.leftSidebarCollapsed),
      right_sidebar_collapsed: fromBool(state.rightSidebarCollapsed),
      updated_at: now
    }

    const existing = getDb()
      .prepare('SELECT id FROM project_ui_state WHERE project_id = ?')
      .get(state.projectId) as { id: string } | undefined

    if (existing) {
      getDb()
        .prepare(
          `UPDATE project_ui_state SET
             active_dump_item_id = @active_dump_item_id,
             selected_layer_id = @selected_layer_id,
             selected_layer_ids_json = @selected_layer_ids_json,
             filmstrip_collapsed = @filmstrip_collapsed,
             filmstrip_thumbnail_size = @filmstrip_thumbnail_size,
             filmstrip_view = @filmstrip_view,
             active_right_tab = @active_right_tab,
             canvas_zoom = @canvas_zoom,
             canvas_pan_x = @canvas_pan_x,
             canvas_pan_y = @canvas_pan_y,
             quick_menu_grid_enabled = @quick_menu_grid_enabled,
             quick_menu_grid_type = @quick_menu_grid_type,
             quick_menu_rulers_enabled = @quick_menu_rulers_enabled,
             quick_menu_smart_guides_enabled = @quick_menu_smart_guides_enabled,
             quick_menu_snap_enabled = @quick_menu_snap_enabled,
             quick_menu_safe_margins_enabled = @quick_menu_safe_margins_enabled,
             left_sidebar_collapsed = @left_sidebar_collapsed,
             right_sidebar_collapsed = @right_sidebar_collapsed,
             updated_at = @updated_at
           WHERE project_id = @project_id`
        )
        .run(params)
    } else {
      getDb()
        .prepare(
          `INSERT INTO project_ui_state
             (id, project_id, active_dump_item_id, selected_layer_id, selected_layer_ids_json,
              filmstrip_collapsed, filmstrip_thumbnail_size, filmstrip_view, active_right_tab,
              canvas_zoom, canvas_pan_x, canvas_pan_y,
              quick_menu_grid_enabled, quick_menu_grid_type, quick_menu_rulers_enabled,
              quick_menu_smart_guides_enabled, quick_menu_snap_enabled, quick_menu_safe_margins_enabled,
              left_sidebar_collapsed, right_sidebar_collapsed, created_at, updated_at)
           VALUES
             (@id, @project_id, @active_dump_item_id, @selected_layer_id, @selected_layer_ids_json,
              @filmstrip_collapsed, @filmstrip_thumbnail_size, @filmstrip_view, @active_right_tab,
              @canvas_zoom, @canvas_pan_x, @canvas_pan_y,
              @quick_menu_grid_enabled, @quick_menu_grid_type, @quick_menu_rulers_enabled,
              @quick_menu_smart_guides_enabled, @quick_menu_snap_enabled, @quick_menu_safe_margins_enabled,
              @left_sidebar_collapsed, @right_sidebar_collapsed, @created_at, @updated_at)`
        )
        .run({ ...params, id: uuid(), created_at: now })
    }
  }
}
