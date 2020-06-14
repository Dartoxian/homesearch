import typing as t
from pydantic import BaseModel


class HousePropertyMeta(BaseModel):
    house_id: int
    title: str
    primary_image_url: str
    price: int
    location: t.Tuple[float, float]
    num_floors: t.Optional[int]
    num_bedrooms: t.Optional[int]
    num_bathrooms: t.Optional[int]


class HouseProperty(HousePropertyMeta):
    source: str
    source_url: str
    description: str
