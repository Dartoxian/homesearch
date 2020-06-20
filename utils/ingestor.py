from metadata.nhs import get_distance_to_nearest_surgery
from metadata.osm import get_distance_to_nearest_national_rail_station, get_distance_to_nearest_city_station
from metadata.supermarkets import get_distance_to_nearest_convenience, get_distance_to_nearest_store
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
        params = {
            "title": house.title,
            "price": house.price,
            "longitude": house.location.longitude,
            "latitude": house.location.latitude,
            "primary_image_url": house.primary_image_url,
            "external_id": house.external_id,
            "source": house.source,
            "source_url": house.source_url,
            "num_floors": house.num_floors,
            "num_bedrooms": house.num_bedrooms,
            "num_bathrooms": house.num_bathrooms,
            "description": house.description,
            "house_type": house.house_type,
            "house_type_full": house.house_type_full,
            "distance_to_nearest_convenience": get_distance_to_nearest_convenience(house.location, self._cur),
            "distance_to_nearest_store": get_distance_to_nearest_store(house.location, self._cur),
            "distance_to_nearest_surgery": get_distance_to_nearest_surgery(house.location, self._cur),
            "distance_to_national_rail_station": get_distance_to_nearest_national_rail_station(
                house.location, self._cur
            ),
            "distance_to_city_rail_station": get_distance_to_nearest_city_station(house.location, self._cur),
        }

        self._cur.execute(
            "INSERT INTO houses (title, price, location, primary_image_url,"
            " external_id, source, source_url, num_floors, num_bedrooms, num_bathrooms, description,"
            " house_type, house_type_full, distance_to_nearest_convenience, distance_to_nearest_store,"
            " distance_to_nearest_surgery, distance_to_national_rail_station, distance_to_city_rail_station)"
            " VALUES (%(title)s, %(price)s, ST_SetSRID( ST_Point(%(longitude)s, %(latitude)s), 4326),"
            " %(primary_image_url)s, %(external_id)s, %(source)s, %(source_url)s, %(num_floors)s,"
            " %(num_bedrooms)s, %(num_bathrooms)s, %(description)s, %(house_type)s, %(house_type_full)s,"
            " %(distance_to_nearest_convenience)s, %(distance_to_nearest_store)s, %(distance_to_nearest_surgery)s,"
            " %(distance_to_national_rail_station)s, %(distance_to_city_rail_station)s)"
            " ON CONFLICT(external_id) DO UPDATE SET"
            " external_id=%(external_id)s, source=%(source)s, source_url=%(source_url)s, num_floors=%(num_floors)s,"
            " num_bedrooms=%(num_bedrooms)s, num_bathrooms=%(num_bathrooms)s, description=%(description)s,"
            " house_type=%(house_type)s, house_type_full=%(house_type_full)s,"
            " distance_to_nearest_convenience=%(distance_to_nearest_convenience)s,"
            " distance_to_nearest_store=%(distance_to_nearest_store)s,"
            " distance_to_nearest_surgery=%(distance_to_nearest_surgery)s,"
            " distance_to_national_rail_station=%(distance_to_national_rail_station)s,"
            " distance_to_city_rail_station=%(distance_to_city_rail_station)s",
            params,
        )
        self._ingested += 1
        if self._ingested % 1000 == 0:
            log.info(f"Ingested {self._ingested} files")
            self._cur.connection.commit()
