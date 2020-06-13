import csv
import os

from global_config import RAW_DATA_DIR
from utils.logging import get_logger
from utils.sql import get_cursor

# Downloaded as CSV from https://www.doogal.co.uk/PostcodeDownloads.php
POSTCODES_DATA = os.path.join(RAW_DATA_DIR, "postcodes", "postcodes.csv")
log = get_logger("postcodes")

with open(POSTCODES_DATA) as csvfile:
    cur = get_cursor()
    postcode_reader = reader = csv.DictReader(csvfile)
    records_processed = 0
    for row in postcode_reader:
        if row["In Use?"] == "No":
            continue

        cur.execute("DELETE FROM metadata.postcodes WHERE postcode=%s", (row["Postcode"],))
        cur.execute(
            "INSERT INTO metadata.postcodes (postcode, postcode_area,"
            " postcode_district, location, county, district, ward, country,"
            " constituency, parish, national_park,"
            " population, households, urban_type, altitude, water_company, average_income,"
            " census_code, constituency_code) VALUES "
            "(%s, %s, %s, ST_SetSRID( ST_Point(%s, %s), 4326), %s, %s, %s, %s, %s, %s,"
            " %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                row["Postcode"],
                row["Postcode area"],
                row["Postcode district"],
                row["Longitude"],
                row["Latitude"],
                row["County"],
                row["District"],
                row["Ward"],
                row["Country"],
                row["Constituency"],
                row["Parish"],
                row["National Park"],
                row["Population"] or None,
                row["Households"] or None,
                row["Rural/urban"],
                row["Altitude"] or None,
                row["Water company"],
                row["Average Income"] or None,
                row["Census output area"],
                row["Constituency Code"],
            ),
        )
        records_processed += 1
        if records_processed % 10000 == 0:
            cur.connection.commit()
            log.info(f"Ingested {records_processed} active postcodes")
    cur.connection.commit()
    log.info(f"Done! Read in {records_processed} active postcodes")