import os
from concurrent import futures

from utils.ingestor import Ingestor
from utils.logging import get_logger
from utils.models import HouseType, HouseProperty, Location
from utils.sql import get_cursor
from os import listdir
from os.path import isfile, join

from global_config import ZOOPLA_RAW_DATA_DIR
from zoopla.models import ZooplaProperty

log = get_logger("zoopla")

houseMapping = {
    "": HouseType.unknown,
    "Barn conversion": HouseType.detached,
    "Block of flats": HouseType.flat,
    "Bungalow": HouseType.bungalow,
    "Chalet": HouseType.detached,
    "Cottage": HouseType.detached,
    "Country house": HouseType.detached,
    "Detached bungalow": HouseType.bungalow,
    "Detached house": HouseType.detached,
    "End terrace house": HouseType.terraced,
    "Equestrian property": HouseType.detached,
    "Farm": HouseType.detached,
    "Farmhouse": HouseType.detached,
    "Flat": HouseType.flat,
    "Houseboat": HouseType.detached,
    "Land": HouseType.land,
    "Leisure/hospitality": HouseType.land,
    "Link-detached house": HouseType.detached,
    "Lodge": HouseType.detached,
    "Maisonette": HouseType.flat,
    "Mews house": HouseType.detached,
    "Mobile/park home": HouseType.land,
    "Office": HouseType.land,
    "Parking/garage": HouseType.land,
    "Pub/bar": HouseType.land,
    "Retail premises": HouseType.land,
    "Semi-detached bungalow": HouseType.bungalow,
    "Semi-detached house": HouseType.semi_detatched,
    "Studio": HouseType.flat,
    "Terraced bungalow": HouseType.bungalow,
    "Terraced house": HouseType.terraced,
    "Town house": HouseType.terraced,
    "Villa": HouseType.detached,
}


def get_house_type(zooplaProperty: ZooplaProperty) -> HouseType:
    if zooplaProperty.property_type not in houseMapping:
        log.error(f"unable to map {zooplaProperty.property_type} to a house type")
        return HouseType.unknown
    return houseMapping[zooplaProperty.property_type]


def load_county(county: str):
    log.info(f"Loading data for {county}")
    root_path = os.path.join(ZOOPLA_RAW_DATA_DIR, county)
    files = [os.path.join(root_path, f) for f in listdir(root_path) if isfile(join(root_path, f))]

    ingestor = Ingestor()
    i = 0
    for file in files:
        zooplaProperty = ZooplaProperty.parse_file(file)
        global_id = f"Zoopla|{zooplaProperty.listing_id}"
        ingestor.ingest(
            HouseProperty(
                title=zooplaProperty.displayable_address,
                price=zooplaProperty.price,
                location=Location(longitude=zooplaProperty.longitude, latitude=zooplaProperty.latitude,),
                primary_image_url=zooplaProperty.image_url,
                external_id=global_id,
                source="Zoopla",
                source_url=zooplaProperty.details_url,
                num_floors=zooplaProperty.num_floors,
                num_bedrooms=zooplaProperty.num_bedrooms,
                num_bathrooms=zooplaProperty.num_bathrooms,
                description=zooplaProperty.description,
                house_type=get_house_type(zooplaProperty),
                house_type_full=zooplaProperty.property_type,
            )
        )
        i += 1
        if i % 1000 == 0:
            log.info(f"Processed {round(100*i/len(files), ndigits=1)}% of {county}")
    log.info(f"Finished ingesting {county}")


if __name__ == "__main__":
    counties = listdir(ZOOPLA_RAW_DATA_DIR)
    log.info(f"Found {len(counties)} counties to load")

    executor = futures.ProcessPoolExecutor(10)
    tasks = [executor.submit(load_county, county) for county in counties]
    futures.wait(tasks)
