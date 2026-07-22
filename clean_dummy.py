import sqlite3
import os

db_path = r"c:\Users\dasar\OneDrive\Desktop\Medical-Agent-mahi\Medical-Agent-mahi\mediq.db"
print(f"Connecting to: {db_path}")

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM prescriptions;")
    cursor.execute("DELETE FROM lab_tests;")
    conn.commit()
    conn.close()
    print("SUCCESS: Deleted all dummy prescriptions and lab tests from mediq.db!")
else:
    print("ERROR: mediq.db not found at expected path")
