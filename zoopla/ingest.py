import os

from utils.logging import get_logger
from utils.sql import get_cursor
from os import listdir
from os.path import isfile, join

from global_config import ZOOPLA_RAW_DATA_DIR
from zoopla.models import ZooplaProperty

log = get_logger("zoopla")


def load_county(county: str):
    log.info(f"Loading data for {county}")
    root_path = os.path.join(ZOOPLA_RAW_DATA_DIR, county)
    files = [os.path.join(root_path, f) for f in listdir(root_path) if isfile(join(root_path, f))]

    cur = get_cursor()
    i = 0
    for file in files:
        zooplaProperty = ZooplaProperty.parse_file(file)
        global_id = (f"Zoopla|{zooplaProperty.listing_id}",)
        cur.execute("DELETE FROM houses WHERE source=%s", (global_id,))
        cur.execute(
            "INSERT INTO houses (title, price, location, primary_image_url,"
            " source, source_url, num_floors, num_bedrooms, num_bathrooms, description)"
            " VALUES (%s, %s, ST_SetSRID( ST_Point(%s, %s), 4326), %s, %s, %s, %s, %s, %s, %s)",
            (
                zooplaProperty.displayable_address,
                zooplaProperty.price,
                zooplaProperty.longitude,
                zooplaProperty.latitude,
                zooplaProperty.image_url,
                global_id,
                zooplaProperty.details_url,
                zooplaProperty.num_floors,
                zooplaProperty.num_bedrooms,
                zooplaProperty.num_bathrooms,
                zooplaProperty.description,
            ),
        )
        i += 1
        if i % 1000 == 0:
            log.info(f"Processed {round(100*i/len(files), ndigits=1)}% of {county}")
            cur.connection.commit()
    cur.connection.commit()
    log.info(f"Finished ingesting {county}")


if __name__ == "__main__":
    counties = listdir(ZOOPLA_RAW_DATA_DIR)
    log.info(f"Found {len(counties)} counties to load")
    for county in counties:
        load_county(county)
