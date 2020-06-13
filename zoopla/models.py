import typing as t
from datetime import datetime

from pydantic import BaseModel


class PriceHistoryItem(BaseModel):
    direction: str
    date: datetime
    percent: str
    price: int


class ZooplaProperty(BaseModel):
    image_645_430_url: t.Optional[str]
    image_354_255_url: t.Optional[str]
    image_150_113_url: t.Optional[str]
    image_50_38_url: t.Optional[str]
    image_80_60_url: t.Optional[str]
    agent_logo: t.Optional[str]

    listing_id: str
    country_code: str
    num_floors: int
    listing_status: str
    num_bedrooms: int
    location_is_approximate: int
    latitude: float
    furnished_state: t.Optional[str]
    agent_address: str
    category: str
    property_type: str
    longitude: float
    thumbnail_url: str
    description: str
    post_town: t.Optional[str]
    details_url: str
    short_description: str
    outcode: str
    county: t.Optional[str]
    price: str
    image_caption: str
    status: str
    agent_name: str
    num_recepts: int
    country: t.Optional[str]
    first_published_date: str
    displayable_address: str
    street_name: str
    num_bathrooms: int
    price_change: t.Optional[t.List[PriceHistoryItem]]
    agent_phone: str
    image_url: str
    last_published_date: str
    floor_plan: t.Optional[t.List[str]] = None
