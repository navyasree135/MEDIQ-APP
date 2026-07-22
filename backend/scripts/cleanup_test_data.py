"""
Find and clean prescriptions and lab tests from the database.
"""
import sqlite3
import os
import glob

# Try to find the database file
backend_dir = os.path.join(os.path.dirname(__file__), '..')
backend_dir = os.path.abspath(backend_dir)

# Find all .db files
db_files = glob.glob(os.path.join(backend_dir, '**', '*.db'), recursive=True)
print(f"Found database files: {db_files}")

for db_path in db_files:
    print(f"\n--- Database: {db_path} ---")
    conn = sqlite3.connect(db_path, timeout=30)
    cur = conn.cursor()
    
    # List all tables
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cur.fetchall()]
    print(f"Tables: {tables}")
    
    # Check for prescription-like and lab-test-like tables
    for table in tables:
        cur.execute(f"SELECT COUNT(*) FROM [{table}]")
        count = cur.fetchone()[0]
        print(f"  {table}: {count} rows")
    
    conn.close()
