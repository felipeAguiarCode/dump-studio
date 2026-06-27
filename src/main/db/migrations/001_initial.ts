import type { Database } from 'better-sqlite3'

export const migration001 = {
  version: 1,
  name: 'initial_schema',
  up(db: Database): void {
    db.exec(`
      CREATE TABLE app_preferences (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        format TEXT NOT NULL,
        default_export_format TEXT NOT NULL DEFAULT 'jpg',
        default_export_quality INTEGER NOT NULL DEFAULT 90,
        last_opened_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        archived_at TEXT
      );
      CREATE INDEX idx_projects_recent ON projects(archived_at, last_opened_at DESC);

      CREATE TABLE project_ui_state (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
        active_dump_item_id TEXT,
        selected_layer_id TEXT,
        selected_layer_ids_json TEXT NOT NULL DEFAULT '[]',
        filmstrip_collapsed INTEGER NOT NULL DEFAULT 0,
        filmstrip_thumbnail_size INTEGER NOT NULL DEFAULT 2,
        filmstrip_view TEXT NOT NULL DEFAULT 'large',
        active_right_tab TEXT NOT NULL DEFAULT 'adjustments',
        canvas_zoom REAL NOT NULL DEFAULT 1,
        canvas_pan_x REAL NOT NULL DEFAULT 0,
        canvas_pan_y REAL NOT NULL DEFAULT 0,
        quick_menu_grid_enabled INTEGER NOT NULL DEFAULT 0,
        quick_menu_grid_type TEXT NOT NULL DEFAULT 'off',
        quick_menu_rulers_enabled INTEGER NOT NULL DEFAULT 0,
        quick_menu_smart_guides_enabled INTEGER NOT NULL DEFAULT 1,
        quick_menu_snap_enabled INTEGER NOT NULL DEFAULT 1,
        quick_menu_safe_margins_enabled INTEGER NOT NULL DEFAULT 0,
        left_sidebar_collapsed INTEGER NOT NULL DEFAULT 0,
        right_sidebar_collapsed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE project_dump_items (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        order_index INTEGER NOT NULL,
        title TEXT,
        preview_path TEXT,
        canvas_width INTEGER NOT NULL,
        canvas_height INTEGER NOT NULL,
        canvas_background TEXT NOT NULL DEFAULT 'black',
        canvas_settings_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX idx_dump_items_order ON project_dump_items(project_id, order_index);

      CREATE TABLE layers (
        id TEXT PRIMARY KEY,
        dump_item_id TEXT NOT NULL REFERENCES project_dump_items(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        visible INTEGER NOT NULL DEFAULT 1,
        locked INTEGER NOT NULL DEFAULT 0,
        opacity REAL NOT NULL DEFAULT 1,
        group_id TEXT,
        transform_json TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX idx_layers_order ON layers(dump_item_id, order_index);

      CREATE TABLE image_layer_adjustments (
        id TEXT PRIMARY KEY,
        layer_id TEXT NOT NULL UNIQUE REFERENCES layers(id) ON DELETE CASCADE,
        exposure REAL NOT NULL DEFAULT 0,
        brilliance REAL NOT NULL DEFAULT 0,
        highlights REAL NOT NULL DEFAULT 0,
        shadows REAL NOT NULL DEFAULT 0,
        contrast REAL NOT NULL DEFAULT 0,
        brightness REAL NOT NULL DEFAULT 0,
        black_point REAL NOT NULL DEFAULT 0,
        saturation REAL NOT NULL DEFAULT 0,
        vibrance REAL NOT NULL DEFAULT 0,
        temperature REAL NOT NULL DEFAULT 0,
        tint REAL NOT NULL DEFAULT 0,
        bw_intensity REAL NOT NULL DEFAULT 100,
        tonal_separation REAL NOT NULL DEFAULT 0,
        black_depth REAL NOT NULL DEFAULT 0,
        white_boost REAL NOT NULL DEFAULT 0,
        fade REAL NOT NULL DEFAULT 0,
        noir_curve TEXT NOT NULL DEFAULT 'classic',
        clarity REAL NOT NULL DEFAULT 0,
        texture REAL NOT NULL DEFAULT 0,
        sharpness REAL NOT NULL DEFAULT 0,
        definition REAL NOT NULL DEFAULT 0,
        noise_reduction REAL NOT NULL DEFAULT 0,
        grain REAL NOT NULL DEFAULT 0,
        grain_size REAL NOT NULL DEFAULT 3,
        grain_roughness REAL NOT NULL DEFAULT 30,
        iso_simulation TEXT NOT NULL DEFAULT '100',
        grain_type TEXT NOT NULL DEFAULT 'film35mm',
        vignette REAL NOT NULL DEFAULT 0,
        vignette_softness REAL NOT NULL DEFAULT 50,
        vignette_intensity REAL NOT NULL DEFAULT 50,
        vignette_center_x REAL NOT NULL DEFAULT 0.5,
        vignette_center_y REAL NOT NULL DEFAULT 0.5,
        distortion REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE image_layer_filters (
        id TEXT PRIMARY KEY,
        layer_id TEXT NOT NULL UNIQUE REFERENCES layers(id) ON DELETE CASCADE,
        filter_name TEXT,
        intensity REAL NOT NULL DEFAULT 100,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE image_layer_crops (
        id TEXT PRIMARY KEY,
        layer_id TEXT NOT NULL UNIQUE REFERENCES layers(id) ON DELETE CASCADE,
        aspect_ratio TEXT NOT NULL DEFAULT 'original',
        rotation REAL NOT NULL DEFAULT 0,
        straighten REAL NOT NULL DEFAULT 0,
        perspective_vertical REAL NOT NULL DEFAULT 0,
        perspective_horizontal REAL NOT NULL DEFAULT 0,
        flip_horizontal INTEGER NOT NULL DEFAULT 0,
        flip_vertical INTEGER NOT NULL DEFAULT 0,
        crop_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE project_export_settings (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
        export_format TEXT NOT NULL DEFAULT 'jpg',
        jpg_quality INTEGER NOT NULL DEFAULT 90,
        destination_path TEXT,
        file_naming_pattern TEXT NOT NULL DEFAULT 'noir-dump-{index}',
        export_scope TEXT NOT NULL DEFAULT 'all',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE project_snapshots (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        thumbnail_path TEXT,
        snapshot_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX idx_snapshots_project ON project_snapshots(project_id, created_at DESC);

      CREATE TABLE original_assets (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        source_path TEXT,
        internal_copy_path TEXT NOT NULL,
        file_name TEXT NOT NULL,
        mime_type TEXT,
        width INTEGER,
        height INTEGER,
        size_bytes INTEGER,
        checksum TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX idx_assets_checksum ON original_assets(project_id, checksum);
    `)
  }
}
