# test_fetch.py
from scheduler import fetch_and_store
from database import fetch_data

fetch_and_store()

print("Sheet1 Data:")
print(fetch_data("sheet1_data"))

print("\nSheet2 Data:")
print(fetch_data("sheet2_data"))
