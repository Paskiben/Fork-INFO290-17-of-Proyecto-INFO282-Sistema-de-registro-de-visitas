const initDatabaseScript = {
    "dbInit": `
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    
    CREATE TABLE IF NOT EXISTS forms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        last_modification TEXT
    );
    
    CREATE TABLE IF NOT EXISTS field_table_name (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        field_type_name TEXT NOT NULL,
        UNIQUE(table_name, field_type_name)
    );
    
    CREATE TABLE IF NOT EXISTS fields (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fk_id_form INTEGER,
        fk_field_table_name INTEGER,
        name TEXT NOT NULL,
        ordering INTEGER,
        output TEXT,
        FOREIGN KEY (fk_id_form) REFERENCES forms(id) ON DELETE CASCADE,
        FOREIGN KEY (fk_field_table_name) REFERENCES field_table_name(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS text_properties (
        fk_id_field INTEGER PRIMARY KEY,
        placeholder TEXT,
        FOREIGN KEY (fk_id_field) REFERENCES fields(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS selector_properties (
        fk_id_field INTEGER PRIMARY KEY,
        FOREIGN KEY (fk_id_field) REFERENCES fields(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS checkbox_properties (
        fk_id_field INTEGER PRIMARY KEY,
        default_value INTEGER DEFAULT 0,
        FOREIGN KEY (fk_id_field) REFERENCES fields(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS radio_properties (
        fk_id_field INTEGER PRIMARY KEY,
        FOREIGN KEY (fk_id_field) REFERENCES fields(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS date_properties (
        fk_id_field INTEGER PRIMARY KEY,
        FOREIGN KEY (fk_id_field) REFERENCES fields(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS hour_properties (
        fk_id_field INTEGER PRIMARY KEY,
        FOREIGN KEY (fk_id_field) REFERENCES fields(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS camera_properties (
        fk_id_field INTEGER PRIMARY KEY,
        FOREIGN KEY (fk_id_field) REFERENCES fields(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS limitations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        regex TEXT,
        keyboard_type TEXT,
        value_enum_matrix INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS format (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        value_enum_matrix INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS limitations_intermediary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fk_id_field INTEGER,
        fk_id_limitation INTEGER,
        FOREIGN KEY(fk_id_field) REFERENCES fields(id) ON DELETE CASCADE,
        FOREIGN KEY(fk_id_limitation) REFERENCES limitations(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS is_formatted (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fk_id_field INTEGER,
        fk_id_format INTEGER,
        FOREIGN KEY(fk_id_field) REFERENCES fields(id) ON DELETE CASCADE,
        FOREIGN KEY(fk_id_format) REFERENCES format(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS selector_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fk_id_field INTEGER,
        option_value TEXT NOT NULL,
        FOREIGN KEY(fk_id_field) REFERENCES fields(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS radio_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fk_id_field INTEGER,
        option_value TEXT NOT NULL,
        FOREIGN KEY(fk_id_field) REFERENCES fields(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS checkbox_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fk_id_field INTEGER,
        option_value TEXT NOT NULL,
        FOREIGN KEY(fk_id_field) REFERENCES fields(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS compatibility_matrix (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fila INTEGER,
        columna INTEGER,
        fk_field_type_id INTEGER,
        limitation_or_format INTEGER,
        FOREIGN KEY(fk_field_type_id) REFERENCES field_table_name(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS respuestas (
        id_respuesta INTEGER PRIMARY KEY AUTOINCREMENT,
        id_plantilla INTEGER NOT NULL,
        fecha_respuesta TEXT,
        um_plantilla TEXT,
        id_dispositivo TEXT NOT NULL,
        FOREIGN KEY(id_plantilla) REFERENCES forms(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS campo_respuesta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_respuesta INTEGER NOT NULL,
        enum_tipo_campo INTEGER NOT NULL,
        nombre_campo TEXT NOT NULL,
        valor_campo TEXT,
        FOREIGN KEY(id_respuesta) REFERENCES respuestas(id_respuesta) ON DELETE CASCADE,
        FOREIGN KEY(enum_tipo_campo) REFERENCES field_table_name(id) ON DELETE CASCADE
    );`
};

export default initDatabaseScript;
