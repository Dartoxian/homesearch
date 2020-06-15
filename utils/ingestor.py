from utils.logging import get_logger
from utils.models import HouseProperty
from utils.sql import get_cursor

log = get_logger("ingestor")


class Ingestor:
    def __init__(self):
        self._cur = get_cursor()
        self._ingested = 0

    def __del__(self):
        self._cur.connection.commit()
        log.info(f"Ingested {self._ingested} files in total")

    def ingest(self, house: HouseProperty):
        self._cur.execute("DELETE FROM houses WHERE external_id=%s", (house.external_id,))
        self._cur.execute(
            "INSERT INTO houses (title, price, location, primary_image_url,"
            " external_id, source, source_url, num_floors, num_bedrooms, num_bathrooms, description,"
            " house_type, house_type_full)"
            " VALUES (%s, %s, ST_SetSRID( ST_Point(%s, %s), 4326), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                house.title,
                house.price,
                house.location.longitude,
                house.location.latitude,
                house.primary_image_url,
                house.external_id,
                house.source,
                house.source_url,
                house.num_floors,
                house.num_bedrooms,
                house.num_bathrooms,
                house.description,
                house.house_type,
                house.house_type_full,
            ),
        )
        self._ingested += 1
        if self._ingested % 1000 == 0:
            log.info(f"Ingested {self._ingested} files")
            self._cur.connection.commit()
