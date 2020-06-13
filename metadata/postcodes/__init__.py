import typing as t

from utils.sql import get_cursor


def get_counties() -> t.List[str]:
    cur = get_cursor()
    cur.execute("SELECT DISTINCT county FROM metadata.postcodes WHERE country='England' AND county != ''")
    return [row["county"] for row in cur.fetchall()]
