import math
import os

import requests
import json

from ratelimit import sleep_and_retry, limits, RateLimitException

from metadata.postcodes import get_counties
from utils.logging import get_logger
from utils.sql import get_cursor
from global_config import ZOOPLA_RAW_DATA_DIR

log = get_logger("zoopla")

PAGE_SIZE = 100

base_parameters = {
    "api_key": "sx38rgtep6437xsfbccpg8du",
    "country": "England",
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


def save_listing(listing):
    f = open(os.path.join(ZOOPLA_RAW_DATA_DIR, f"{listing['listing_id']}.json"), "w")
    f.write(json.dumps(listing))
    f.close()


def fetch_and_save_data(parameters: dict) -> int:
    query_string = "&".join([f"{k}={v}" for (k, v) in parameters.items()])
    r = call_api(query_string)

    parsed = r.json()
    result_count = parsed["result_count"]

    for listing in parsed["listing"]:
        save_listing(listing)
    return result_count


counties = get_counties()
log.info(f"Fetching data for {len(counties)} postcode areas")

for county in counties:
    log.info(f"Fetching properties for area {county}")
    page = 1
    while True:
        parameters = {**base_parameters, "page_number": page, "county": county}
        result_count = fetch_and_save_data(parameters)
        if result_count > 100 * PAGE_SIZE:
            log.error(f"County {county} has {result_count} results, this is too many to process. Skipping.")
            break
        log.info(f"Processed page {page} / {math.ceil(result_count/100)} - {100 * 100 * page / result_count}% complete")
        if page * PAGE_SIZE > result_count:
            break
        page += 1
