import typing as t
from enum import Enum

from pydantic import BaseModel


class HouseType(str, Enum):
    unknown = "unknown"
    flat = "flat"
    detached = "detached"
    bungalow = "bungalow"
    semi_detatched = "semi_detached"
    terraced = "terraced"
    land = "land"


class Location(BaseModel):
    latitude: float
    longitude: float


class HousePropertyMeta(BaseModel):
    house_id: t.Optional[int]
    title: str
    primary_image_url: str
    price: int
    location: Location
    num_floors: t.Optional[int]
    num_bedrooms: t.Optional[int]
    num_bathrooms: t.Optional[int]
    house_type: HouseType
    house_type_full: str


class HouseProperty(HousePropertyMeta):
    external_id: str
    source: str
    source_url: str
    description: str


houseMapping = {
    "": HouseType.unknown,
    "Apartment": HouseType.detached,
    "Barn conversion": HouseType.detached,
    "Barn Conversion": HouseType.detached,
    "Block of flats": HouseType.flat,
    "Bungalow": HouseType.bungalow,
    "Chalet": HouseType.detached,
    "Character Property": HouseType.detached,
    "Cottage": HouseType.detached,
    "Country house": HouseType.detached,
    "Country House": HouseType.detached,
    "Detached bungalow": HouseType.bungalow,
    "Detached Bungalow": HouseType.bungalow,
    "Detached house": HouseType.detached,
    "Detached": HouseType.detached,
    "Duplex": HouseType.flat,
    "End of Terrace": HouseType.terraced,
    "End terrace house": HouseType.terraced,
    "Equestrian Facility": HouseType.detached,
    "Equestrian property": HouseType.detached,
    "Farm House": HouseType.detached,
    "Farm": HouseType.detached,
    "Farmhouse": HouseType.detached,
    "Flat Share": HouseType.flat,
    "Flat": HouseType.flat,
    "Ground Flat": HouseType.flat,
    "House": HouseType.detached,
    "Houseboat": HouseType.detached,
    "Land": HouseType.land,
    "Leisure/hospitality": HouseType.land,
    "Link Detached House": HouseType.detached,
    "Link-detached house": HouseType.detached,
    "Lodge": HouseType.detached,
    "Maisonette": HouseType.flat,
    "Mews house": HouseType.detached,
    "Mews": HouseType.detached,
    "Mobile/park home": HouseType.land,
    "Not Specified": HouseType.unknown,
    "Office": HouseType.land,
    "Parking/garage": HouseType.land,
    "Penthouse": HouseType.flat,
    "Plot": HouseType.land,
    "Pub/bar": HouseType.land,
    "Retail premises": HouseType.land,
    "Retirement Property": HouseType.detached,
    "Semi-detached bungalow": HouseType.bungalow,
    "Semi-Detached Bungalow": HouseType.bungalow,
    "Semi-detached house": HouseType.semi_detatched,
    "Semi-Detached": HouseType.semi_detatched,
    "Sheltered Housing": HouseType.detached,
    "Smallholding": HouseType.land,
    "Ground Maisonette": HouseType.flat,
    "Block of Apartments": HouseType.detached,
    "Park Home": HouseType.land,
    "Manor House": HouseType.detached,
    "Detached Villa": HouseType.detached,
    "House of Multiple Occupation": HouseType.flat,
    "Studio": HouseType.flat,
    "Terraced bungalow": HouseType.bungalow,
    "Terraced Bungalow": HouseType.bungalow,
    "Terraced house": HouseType.terraced,
    "Terraced": HouseType.terraced,
    "Town house": HouseType.terraced,
    "Town House": HouseType.terraced,
    "Villa": HouseType.detached,
}
