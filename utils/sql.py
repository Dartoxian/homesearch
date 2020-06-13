import os
import psycopg2.extras
from psycopg2.extensions import cursor

DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", 5432)
DB_NAME = os.environ.get("DB_NAME", "homesearch")
DB_USER = os.environ.get("DB_USER", "homesearch")
DB_PSWD = os.environ.get("DB_PSWD", "devpwd")


def get_cursor() -> cursor:
    conn_str = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PSWD}"
    conn = psycopg2.connect(conn_str, cursor_factory=psycopg2.extras.DictCursor)
    return conn.cursor()
