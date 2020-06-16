import math
import os
from pathlib import Path

import requests
import json

from ratelimit import sleep_and_retry, limits, RateLimitException

from metadata.postcodes import get_postcode_districts
from utils.logging import get_logger
from global_config import ZOOPLA_RAW_DATA_DIR

log = get_logger("zoopla")

PAGE_SIZE = 100

base_parameters = {
    "api_key": "sx38rgtep6437xsfbccpg8du",
    "page_size": PAGE_SIZE,
    "listing_status": "sale",
    "order_by": "age",
    "include_sold": 0,
}


@sleep_and_retry
@limits(calls=5, period=180)
def call_api(qs: str):
    r = requests.get("https://api.zoopla.co.uk/api/v1/property_listings.js?" + qs)
    if r.status_code != 200:
        if "X-Mashery-Error-Code" in r.headers and r.headers["X-Mashery-Error-Code"] == "ERR_403_DEVELOPER_OVER_RATE":
            log.info("We have been rate limited... waiting at least 60 seconds")
            raise RateLimitException("Developer over rate", 60)
        log.error(f"Unexpected result, got status {r.status_code}, headers: {r.headers},  body:\n{r.text}")
    return r


def save_listing(location, listing):
    directory = os.path.join(ZOOPLA_RAW_DATA_DIR, location)
    Path(directory).mkdir(parents=True, exist_ok=True)

    path = os.path.join(directory, f"{listing['listing_id']}.json")
    f = open(path, "w")
    f.write(json.dumps(listing))
    f.close()


def fetch_and_save_data(postcode_district: str, page: int) -> int:
    parameters = {**base_parameters, "page_number": page, "postcode": postcode_district}
    query_string = "&".join([f"{k}={v}" for (k, v) in parameters.items()])
    r = call_api(query_string)

    try:
        parsed = r.json()
        result_count = parsed["result_count"]

        for listing in parsed["listing"]:
            save_listing(postcode_district, listing)
    except Exception as e:
        log.exception(f"Unable to process {postcode_district}, page {page}", e)
        return 0
    return result_count


postcode_districts = get_postcode_districts()
log.info(f"Fetching data for {len(postcode_districts)} postcode areas")

for postcode_district in postcode_districts:
    log.info(f"Fetching properties for area {postcode_district}")
    if os.path.exists(os.path.join(ZOOPLA_RAW_DATA_DIR, postcode_district)):
        log.info(f"It looks like we've already fetched {postcode_district}, skipping for now.")
        continue

    page = 1
    while True:
        result_count = fetch_and_save_data(postcode_district, page)
        if result_count > 100 * PAGE_SIZE:
            log.error(
                f"District {postcode_district} has {result_count} results, this is too many to process. Skipping."
            )
            break
        log.info(f"Processed page {page} / {math.ceil(result_count/100)}")
        if page * PAGE_SIZE > result_count:
            break
        page += 1
