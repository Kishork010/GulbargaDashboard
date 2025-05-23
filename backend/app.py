from flask import Flask, jsonify, request
from flask_cors import CORS
from database import init_db, fetch_data, upsert_data
from scheduler import start_scheduler
from google_sheet import get_sheet_data
from dotenv import load_dotenv
import logging
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TABLE_NAME = "Green Form"
SHEET_RANGE = f"{TABLE_NAME}!A2:AB"  # Matches 28 column sheet

@app.route('/api/green_form', methods=["GET"])
def get_green_form_data():
    logger.info("API called: /api/green_form")
    try:
        data = fetch_data(TABLE_NAME)
        logger.info(f"Returning {len(data)} rows from {TABLE_NAME}")
        return jsonify(data)
    except Exception as e:
        logger.exception("Error fetching Green Form data")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/sync', methods=["POST"])
def sync_green_form():
    logger.info("Manual sync requested via /api/sync")
    try:
        rows = get_sheet_data(SHEET_RANGE)
        if rows:
            upsert_data(rows, TABLE_NAME)
            logger.info(f"Synced {len(rows)} rows into {TABLE_NAME}")
            return jsonify({"status": "success", "message": f"Synced {len(rows)} rows from Google Sheets"}), 200
        else:
            logger.warning("No data fetched from Google Sheets")
            return jsonify({"status": "warning", "message": "No data found in Google Sheets"}), 204
    except Exception as e:
        logger.exception("Failed to sync Green Form data")
        return jsonify({"status": "error", "message": "Failed to sync"}), 500

@app.route('/health', methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

def start_app():
    logger.info("Initializing database...")
    init_db()

    logger.info("Fetching initial Green Form data...")
    try:
        rows = get_sheet_data(SHEET_RANGE)
        if rows:
            upsert_data(rows, TABLE_NAME)
            logger.info(f"Initial sync: inserted {len(rows)} rows")
        else:
            logger.warning("Initial fetch found no rows")
    except Exception as e:
        logger.exception("Initial fetch failed")

    # Avoid double scheduler in dev mode
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.debug:
        logger.info("Starting background scheduler...")
        start_scheduler()

    logger.info("Starting Flask server on http://localhost:5000")
    app.run(debug=app.debug, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    start_app()
