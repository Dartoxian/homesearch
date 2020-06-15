import csv
import os

from global_config import RAW_DATA_DIR
from utils.logging import get_logger
from utils.sql import get_cursor

# Downloaded as CSV from https://geolytix.co.uk/ (Retail points)
SUPERMARKETS_DATA = os.path.join(RAW_DATA_DIR, "supermarkets", "geolytix_retailpoints_v16_202005.csv")
log = get_logger("supermarkets")

store_type_mapping = {
    "< 3,013 ft2 (280m2)": "convenience",
    "3,013 < 15,069 ft2 (280 < 1,400 m2)": "store",
    "15,069 < 30,138 ft2 (1,400 < 2,800 m2)": "supermarket",
    "30,138 ft2 > (2,800 m2)": "hypermarket",
}


def get_store_type(raw: str) -> str:
    if raw not in store_type_mapping:
        log.error(f"Unknown store size {raw}")
        return "unknown"
    return store_type_mapping[raw]


with open(SUPERMARKETS_DATA) as csvfile:
    cur = get_cursor()
    cur.execute("DELETE FROM metadata.supermarkets")

    supermarket_reader = reader = csv.DictReader(csvfile)
    records_processed = 0
    for row in supermarket_reader:
        cur.execute(
            "INSERT INTO metadata.supermarkets (retailer, name, type, location) VALUES "
            "(%s, %s, %s, ST_SetSRID( ST_Point(%s, %s), 4326))",
            (row["retailer"], row["store_name"], get_store_type(row["size_band"]), row["long_wgs"], row["lat_wgs"],),
        )
        records_processed += 1
        if records_processed % 1000 == 0:
            cur.connection.commit()
            log.info(f"Ingested {records_processed} supermarkets")
    cur.connection.commit()
    log.info(f"Done! Read in {records_processed} supermarkets")
