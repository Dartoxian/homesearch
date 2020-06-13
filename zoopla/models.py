import typing as t
from datetime import datetime

from pydantic import BaseModel


class PriceHistoryItem(BaseModel):
    direction = str
    date = datetime
    percent = str
    price = int


class ZooplaProperty(BaseModel):
    country_code = str
    num_floors = int
    image_150_113_url = str
    listing_status = str
    num_bedrooms = int
    location_is_approximate = int
    image_50_38_url = str
    latitude = float
    furnished_state = t.Optional[str]
    agent_address = str
    category = str
    property_type = str
    longitude = float
    thumbnail_url = str
    description = str
    post_town = str
    details_url = str
    short_description = str
    outcode = str
    image_645_430_url = str
    county = str
    price = str
    listing_id = str
    image_caption = str
    image_80_60_url = str
    status = str
    agent_name = str
    num_recepts = int
    country = str
    first_published_date = str
    displayable_address = str
    floor_plan = t.List[str]
    street_name = str
    num_bathrooms = int
    agent_logo = str
    price_change = t.List[PriceHistoryItem]
    agent_phone = str
    image_354_255_url = str
    image_url = str
    last_published_date = str
