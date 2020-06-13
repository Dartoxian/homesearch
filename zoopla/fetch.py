import math
import os

import requests
import logging
import sys
import json

from ratelimit import sleep_and_retry, limits, RateLimitException

from zoopla.config import ZOOPLA_RAW_DATA_DIR

formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.INFO)
handler.setFormatter(formatter)
logging.getLogger().addHandler(handler)

log = logging.getLogger("zoopla")
log.setLevel(logging.INFO)

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
def call_api(query_string):
    r = requests.get("https://api.zoopla.co.uk/api/v1/property_listings.js?" + query_string)
    if r.status_code != 200:
        if "X-Mashery-Error-Code" in r.headers and r.headers["X-Mashery-Error-Code"] == "ERR_403_DEVELOPER_OVER_RATE":
            log.info("We have been rate limited... waiting at least 60 seconds")
            raise RateLimitException("Developer over rate", 60)
        log.error(f"Unexpected result, got status {r.status_code}, headers: {r.headers},  body:\n{r.text}")
    return r


result_count = 10000000
page = 1
while (page - 1) * PAGE_SIZE < result_count:
    parameters = {**base_parameters, "page_number": page}
    query_string = "&".join([f"{k}={v}" for (k, v) in parameters.items()])
    r = call_api(query_string)

    log.info(f"Made request, status {r.status_code}")
    parsed = r.json()
    result_count = parsed["result_count"]

    for listing in parsed["listing"]:
        f = open(os.path.join(ZOOPLA_RAW_DATA_DIR, f"{listing['listing_id']}.json"), "w")
        f.write(json.dumps(listing))
        f.close()
    log.info(f"Processed page {page} / {math.ceil(result_count/100)} - {100 * 100 * page / result_count}% complete")
    page += 1
