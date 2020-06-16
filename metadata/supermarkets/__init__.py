import typing as t

from psycopg2._psycopg import cursor

from utils.models import Location
from utils.sql import get_cursor


def get_distance_to_nearest_convenience(location: Location, cur: t.Optional[cursor] = None) -> float:
    if not cur:
        cur = get_cursor()
    cur.execute(
        "SELECT MIN(ST_DistanceSphere(location, ST_SetSRID( ST_Point(%s, %s), 4326))) AS distance"
        " FROM metadata.supermarkets",
        (location.longitude, location.latitude),
    )
    return cur.fetchone()["distance"]


def get_distance_to_nearest_store(location: Location, cur: t.Optional[cursor] = None) -> float:
    if not cur:
        cur = get_cursor()
    cur.execute(
        "SELECT MIN(ST_DistanceSphere(location, ST_SetSRID( ST_Point(%s, %s), 4326))) AS distance"
        " FROM metadata.supermarkets WHERE metadata.supermarkets.location != 'convenience'",
        (location.longitude, location.latitude),
    )
    return cur.fetchone()["distance"]
