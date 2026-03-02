import psycopg2
import sys
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

print("Connecting to Postgres with psycopg2...")
try:
    conn = psycopg2.connect(
        user='postgres',
        password='Khushita',
        host='localhost',
        port=5432,
        connect_timeout=5
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    print("Successfully connected to Postgres instance!")
    
    cur = conn.cursor()
    cur.execute("SELECT datname FROM pg_database;")
    dbs = [r[0] for r in cur.fetchall()]
    print(f"Databases found: {dbs}")
    
    if 'salon_db' not in dbs:
        print("'salon_db' NOT found. Creating it...")
        cur.execute("CREATE DATABASE salon_db;")
        print("'salon_db' created successfully.")
    else:
        print("'salon_db' already exists.")
        
    cur.close()
    conn.close()
    print("Done.")
except Exception as e:
    print(f"FAILED to connect: {e}")
    sys.exit(1)
