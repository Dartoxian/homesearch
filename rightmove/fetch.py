from concurrent import futures
import json
import os
import re
from pathlib import Path
from urllib.parse import urlencode

import requests
from ratelimit import sleep_and_retry, limits

from global_config import RIGHTMOVE_RAW_DATA_DIR

import urllib.robotparser as urobot

from utils.logging import get_logger

log = get_logger("rightmove")
BASE = "https://www.rightmove.co.uk"
# this currently the highest valid outcode
# https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=OUTCODE%5E2926&insId=1&numberOfPropertiesPerPage=24&areaSizeUnit=sqft&googleAnalyticsChannel=buying
MAX_OUTCODE = 2926
USER_AGENT = "searcher"
session = requests.Session()
session.headers.update({"User-Agent": USER_AGENT})

rp = urobot.RobotFileParser()
rp.set_url("https://www.rightmove.co.uk" + "/robots.txt")
rp.read()


def save_listing(location, listing):
    directory = os.path.join(RIGHTMOVE_RAW_DATA_DIR, location)
    Path(directory).mkdir(parents=True, exist_ok=True)

    path = os.path.join(directory, f"{listing['id']}.json")
    f = open(path, "w")
    f.write(json.dumps(listing))
    f.close()


@sleep_and_retry
@limits(calls=1, period=3)
def get_search(location: str, page: int) -> bool:
    parameters = {
        "searchType": "SALE",
        "locationIdentifier": location,
        "includeSSTC": "false",
        "propertyTypes": "",
        "mustHave": "",
        "dontShow": "",
        "furnishTypes": "",
    }
    if page > 1:
        parameters["index"] = (page - 1) * 24
    query_string = urlencode(parameters)
    url = "https://www.rightmove.co.uk/property-for-sale/find.html?" + query_string
    if not rp.can_fetch(USER_AGENT, url):
        raise Exception("No longer allowed to fetch search results from rightmove")
    r = session.get(url)
    if r.status_code != 200:
        r.raise_for_status()
    body = r.text
    m = re.search(r"</div><script>window.jsonModel\s*=\s*(\{\"properties\".*})</script>", body)
    if m:
        parsed_data = json.loads(m.group(1))
        for property in parsed_data["properties"]:
            save_listing(location, property)
        total_pages = parsed_data["pagination"]["total"]
        log.info(f"Processed page {page} of {total_pages}")
        return page < total_pages
    else:
        log.error(f"Could not parse the search results for {url}")
        return False


def get_results_for_region_code(region_code: str):
    log.info(f"Getting results for region {region_code}")
    page = 1
    while get_search(region_code, page):
        page += 1
    log.info(f"Finished getting results for region {region_code}")


executor = futures.ProcessPoolExecutor(30)
tasks = [executor.submit(get_results_for_region_code, f"OUTCODE^{i + 1}") for i in range(MAX_OUTCODE)]
futures.wait(tasks)
