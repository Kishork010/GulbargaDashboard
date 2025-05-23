import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

load_dotenv()

# Required Google Sheets read-only scope
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

# Environment variables
SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")
CREDENTIALS_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
TOTAL_COLUMNS = 28  # Now we know there are 28 useful columns

if not SPREADSHEET_ID:
    print("[ERROR] SPREADSHEET_ID is not set or empty in environment variables")

def get_sheet_data(range_name='Green Form!A2:AB'):
    """
    Fetch data from Google Sheets for the given range.
    Pads rows to TOTAL_COLUMNS with None.
    
    Args:
        range_name (str): Range in A1 notation (e.g., 'Sheet1!A2:Z')

    Returns:
        list[list]: List of padded row lists from the sheet
    """
    try:
        # Validate credentials
        if not CREDENTIALS_PATH or not os.path.exists(CREDENTIALS_PATH):
            print("[ERROR] GOOGLE_APPLICATION_CREDENTIALS path not set or file does not exist")
            print(f"[DEBUG] GOOGLE_APPLICATION_CREDENTIALS: {CREDENTIALS_PATH}")
            return []

        # Authenticate and initialize Sheets API client
        creds = service_account.Credentials.from_service_account_file(
            CREDENTIALS_PATH, scopes=SCOPES
        )
        service = build('sheets', 'v4', credentials=creds)
        sheet = service.spreadsheets()

        # Fetch data
        print(f"[INFO] Fetching data from range: {range_name}")
        result = sheet.values().get(spreadsheetId=SPREADSHEET_ID, range=range_name).execute()
        values = result.get('values', [])

        print(f"[INFO] Raw rows fetched from sheet: {len(values)}")

        # Pad rows
        for i in range(len(values)):
            values[i] += [None] * (TOTAL_COLUMNS - len(values[i]))

        print(f"[INFO] Rows after padding to {TOTAL_COLUMNS} columns: {len(values)}")
        return values

    except HttpError as err:
        print(f"[ERROR] Google API error: {err}")
        return []

    except Exception as e:
        print(f"[ERROR] Unexpected error while fetching Google Sheet data: {e}")
        return []
