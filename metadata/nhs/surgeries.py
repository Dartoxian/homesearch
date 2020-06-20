import csv
import os
from pathlib import Path
from urllib.request import urlretrieve

from global_config import RAW_DATA_DIR
from utils.logging import get_logger
from utils.sql import get_cursor

# Downloaded as CSV from https://www.doogal.co.uk/PostcodeDownloads.php
SURGERIES_DATA = os.path.join(RAW_DATA_DIR, "nhs", "surgeries.csv")
if not os.path.exists(SURGERIES_DATA):
    Path(os.path.join(RAW_DATA_DIR, "nhs")).mkdir(parents=True, exist_ok=True)
    os.system(f"wget http://media.nhschoices.nhs.uk/data/foi/GP.csv -O {SURGERIES_DATA}")
log = get_logger("surgeries")

with open(SURGERIES_DATA, encoding="latin1") as csvfile:
    cur = get_cursor()
    surgeries_reader = reader = csv.DictReader(csvfile, delimiter="¬",)
    records_processed = 0
    for row in surgeries_reader:
        if not row["Longitude"] or not row["Latitude"]:
            log.info(f"Surgery {row['OrganisationName']} has no lat long")
            continue
        cur.execute("DELETE FROM metadata.surgeries WHERE external_id=%s", (row["OrganisationID"],))
        cur.execute(
            "INSERT INTO metadata.surgeries (external_id, name, location) VALUES "
            "(%s, %s, ST_SetSRID( ST_Point(%s, %s), 4326))",
            (row["OrganisationID"], row["OrganisationName"], row["Longitude"], row["Latitude"],),
        )
        records_processed += 1
        if records_processed % 10000 == 0:
            cur.connection.commit()
            log.info(f"Ingested {records_processed} surgeries")
    cur.connection.commit()
    log.info(f"Done! Read in {records_processed} surgeries")
