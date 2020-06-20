import typing as t

from utils.sql import get_cursor


def get_last_successful_fetch(source: str) -> t.Optional[str]:
    cur = get_cursor()
    cur.execute("SELECT last_success FROM fetch_state WHERE source=%s", (source,))
    row = cur.fetchone()
    if row:
        return row["last_success"]
    return None


def set_successful_fetch_state(source: str, state: str):
    cur = get_cursor()
    cur.execute(
        "INSERT INTO fetch_state (source, last_success) VALUES (%(source)s, %(last_success)s)"
        " ON CONFLICT (source) DO UPDATE SET last_success=%(last_success)s",
        {"source": source, "last_success": state},
    )
    cur.connection.commit()
