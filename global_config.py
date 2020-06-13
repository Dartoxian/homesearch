import os

RAW_DATA_DIR = os.environ.get("RAW_DATA_DIR", "data")
ZOOPLA_RAW_DATA_DIR = os.path.join(RAW_DATA_DIR, "zoopla")
RIGHTMOVE_RAW_DATA_DIR = os.path.join(RAW_DATA_DIR, "rightmove")
