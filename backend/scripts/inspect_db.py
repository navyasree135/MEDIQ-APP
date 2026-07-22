import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), '..', 'mediq.db')
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT id, user_id, full_name FROM patients")
print("PATIENTS:", cur.fetchall())

cur.execute("SELECT id, patient_id, doctor_name FROM prescriptions")
print("PRESCRIPTIONS:", cur.fetchall())

cur.execute("SELECT id, patient_id, test_name, status FROM lab_tests")
print("LAB_TESTS:", cur.fetchall())

conn.close()
