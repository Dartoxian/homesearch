import os

from rightmove.models import RightMoveProperty
from utils.ingestor import Ingestor
from utils.logging import get_logger
from utils.models import HouseType, HouseProperty, Location, houseMapping
from os import listdir
from os.path import isfile, join

from global_config import RIGHTMOVE_RAW_DATA_DIR

log = get_logger("rightmove")


def get_house_type(rightMoveProperty: RightMoveProperty) -> HouseType:
    if rightMoveProperty.propertySubType not in houseMapping:
        log.error(f"unable to map {rightMoveProperty.propertySubType} to a house type")
        return HouseType.unknown
    return houseMapping[rightMoveProperty.propertySubType]


def load_outcode(outcode: str):
    log.info(f"Loading data for {outcode}")
    root_path = os.path.join(RIGHTMOVE_RAW_DATA_DIR, outcode)
    files = [os.path.join(root_path, f) for f in listdir(root_path) if isfile(join(root_path, f))]

    ingestor = Ingestor()
    i = 0
    for file in files:
        rightmoveProperty: RightMoveProperty = RightMoveProperty.parse_file(file)
        global_id = f"RightMove|{rightmoveProperty.id}"
        ingestor.ingest(
            HouseProperty(
                title=rightmoveProperty.displayAddress,
                price=rightmoveProperty.price.amount,
                location=Location(
                    longitude=rightmoveProperty.location.longitude, latitude=rightmoveProperty.location.latitude,
                ),
                primary_image_url=rightmoveProperty.propertyImages.mainImageSrc,
                external_id=global_id,
                source="RightMove",
                source_url=f"https://rightmove.co.uk{rightmoveProperty.propertyUrl}",
                num_floors=None,
                num_bedrooms=rightmoveProperty.bedrooms,
                num_bathrooms=None,
                description=rightmoveProperty.summary,
                house_type=get_house_type(rightmoveProperty),
                house_type_full=rightmoveProperty.propertySubType,
            )
        )
        i += 1
        if i % 1000 == 0:
            log.info(f"Processed {round(100 * i / len(files), ndigits=1)}% of {outcode}")
    log.info(f"Finished ingesting {outcode}")


if __name__ == "__main__":
    outcodes = listdir(RIGHTMOVE_RAW_DATA_DIR)
    log.info(f"Found {len(outcodes)} outcodes to load")
    for outcode in outcodes:
        load_outcode(outcode)
