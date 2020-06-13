import os

from utils.sql import get_cursor
from os import listdir
from os.path import isfile, join

from global_config import ZOOPLA_RAW_DATA_DIR
from zoopla.models import ZooplaProperty

if __name__ == "__main__":
    files = [
        os.path.join(ZOOPLA_RAW_DATA_DIR, f)
        for f in listdir(ZOOPLA_RAW_DATA_DIR)
        if isfile(join(ZOOPLA_RAW_DATA_DIR, f))
    ]

    for file in files:
        zooplaProperty = ZooplaProperty.parse_file(file)
        print(zooplaProperty.displayable_address)
