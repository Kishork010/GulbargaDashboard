import sqlite3
import os

DB_NAME = os.path.join(os.path.dirname(__file__), 'database.db')

COLUMN_NAMES = [
    'stage_1_date', 'opportunity_name', 'first_name', 'last_name', 'mobile_number',
    'city', 'taluka', 'zip_code', 'parent_product_line', 'product_line', 'colour',
    'fuel', 'customer_type', 'td_required', 'source_of_contact', 'close_date',
    'sales_stage', 'status', 'lob', 'lead_classification', 'sales_team',
    'tl_name', 'product_vc_number', 'product_description', 'hsn', 'email',
    'address_1', 'address_2'
]

def create_table_if_not_exists(conn, table_name):
    c = conn.cursor()
    columns = []
    for i, name in enumerate(COLUMN_NAMES):
        col_def = f"{name} TEXT"
        if i == 1:  # opportunity_name is UNIQUE
            col_def += " UNIQUE"
        columns.append(col_def)
    columns_sql = ', '.join(columns)
    c.execute(f'''
        CREATE TABLE IF NOT EXISTS "{table_name}" (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            {columns_sql}
        )
    ''')

def init_db():
    conn = sqlite3.connect(DB_NAME)
    try:
        for table in ['Green Form', 'sheet1_data', 'sheet2_data']:
            create_table_if_not_exists(conn, table)
        conn.commit()
    finally:
        conn.close()

def upsert_data(rows, table_name):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    inserted = 0
    updated = 0
    skipped = 0

    for row in rows:
        if not any(cell.strip() for cell in row if cell):
            skipped += 1
            continue

        padded_row = row + [None] * (len(COLUMN_NAMES) - len(row))

        opportunity_name = padded_row[1].strip().lower() if padded_row[1] else None
        if not opportunity_name:
            print(f"[WARNING] Skipping row with missing Opportunity Name: {row}")
            skipped += 1
            continue

        padded_row[1] = opportunity_name

        cursor.execute(
            f'SELECT id FROM "{table_name}" WHERE LOWER(TRIM(opportunity_name)) = ?',
            (opportunity_name,)
        )
        result = cursor.fetchone()

        try:
            if result:
                record_id = result[0]
                update_fields = ', '.join([f"{col} = ?" for col in COLUMN_NAMES])
                cursor.execute(
                    f'UPDATE "{table_name}" SET {update_fields} WHERE id = ?',
                    padded_row + [record_id]
                )
                updated += 1
            else:
                placeholders = ','.join(['?'] * len(COLUMN_NAMES))
                cursor.execute(
                    f'INSERT INTO "{table_name}" ({",".join(COLUMN_NAMES)}) VALUES ({placeholders})',
                    padded_row
                )
                inserted += 1
        except sqlite3.IntegrityError:
            print(f"[ERROR] UNIQUE constraint failed for Opportunity Name: {padded_row[1]}")
            skipped += 1

    conn.commit()
    conn.close()

    print(f"[INFO] upsert_data completed for '{table_name}': Inserted={inserted}, Updated={updated}, Skipped={skipped}")

def fetch_data(table_name='Green Form'):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    try:
        c.execute(f'SELECT * FROM "{table_name}"')
        rows = c.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()
