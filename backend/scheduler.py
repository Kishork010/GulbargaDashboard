from apscheduler.schedulers.background import BackgroundScheduler
from google_sheet import get_sheet_data
from database import upsert_data
import atexit
import traceback

scheduler = BackgroundScheduler(daemon=True)
current_interval = 600  # Default fetch interval in seconds

TABLE_NAME = "Green Form"
SHEET_RANGE = "Green Form!A2:AB"  # Adjusted to match your 28 columns
INTERVAL_CELL_RANGE = "Green Form!A1"

def fetch_and_store():
    print("[INFO] fetch_and_store() called")
    try:
        rows = get_sheet_data(SHEET_RANGE)
        print(f"[DEBUG] Number of rows fetched: {len(rows)}")
        if rows:
            upsert_data(rows, TABLE_NAME)
            print(f"[INFO] Upserted {len(rows)} rows into '{TABLE_NAME}'")
        else:
            print("[WARN] No data fetched from Google Sheets")
    except Exception as e:
        print(f"[ERROR] Failed to fetch and store data: {e}")
        traceback.print_exc()

def check_and_update_interval():
    global current_interval
    try:
        interval_cell = get_sheet_data(INTERVAL_CELL_RANGE)
        if interval_cell and interval_cell[0]:
            try:
                new_interval = int(interval_cell[0][0])
                if new_interval > 0 and new_interval != current_interval:
                    print(f"[INFO] Updating interval from {current_interval}s to {new_interval}s")
                    current_interval = new_interval
                    scheduler.reschedule_job('fetch_and_store_job', trigger='interval', seconds=new_interval)
            except ValueError:
                print(f"[WARN] Invalid interval value in {INTERVAL_CELL_RANGE}: '{interval_cell[0][0]}'")
    except Exception as e:
        print(f"[ERROR] Failed to update interval: {e}")
        traceback.print_exc()

def start_scheduler():
    scheduler.add_job(fetch_and_store, 'interval', seconds=current_interval, id='fetch_and_store_job', replace_existing=True)
    scheduler.add_job(check_and_update_interval, 'interval', seconds=10, id='check_interval_job', replace_existing=True)
    scheduler.start()
    print("[INFO] Scheduler started.")
    atexit.register(lambda: scheduler.shutdown())
