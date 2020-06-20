import mercantile

from utils.logging import get_logger
from utils.sql import get_cursor

log = get_logger("vector-tiles")


def get_pbf_for(x, y, z, table, col):
    bounds = mercantile.bounds(x, y, z)
    cur = get_cursor()
    sql_tmpl = """
        SELECT ST_AsMVT(q.*) as pbf
        FROM (
            SELECT ST_AsMVTGeom({col}, ST_MakeEnvelope(%(xmin)s, %(ymin)s, %(xmax)s, %(ymax)s, 4326), 4096, 256, true) geom
            FROM {table}
            WHERE ST_Intersects({col}, ST_MakeEnvelope(%(xmin)s, %(ymin)s, %(xmax)s, %(ymax)s, 4326))
        ) q
            """.format(
        **{"table": table, "col": col}
    )
    cur.execute(
        sql_tmpl, {"xmin": bounds.west, "ymin": bounds.south, "xmax": bounds.east, "ymax": bounds.north,},
    )
    row = cur.fetchone()
    return row["pbf"]
