#!/bin/sh

set -e

cd `dirname $0`

# https://data.gov.uk/dataset/cf494c44-05cd-4060-a029-35937970c9c6/flood-map-for-planning-rivers-and-sea-flood-zone-2
ogr2ogr -f "PostgreSQL" PG:"host=db dbname=homesearch user=homesearch" \
  -lco SCHEMA=defra -lco precision=NO -nlt PROMOTE_TO_MULTI \
  -t_srs EPSG:4326 \
  /homesearch/data/flood/zone2/data
# https://data.gov.uk/dataset/bed63fc1-dd26-4685-b143-2941088923b3/flood-map-for-planning-rivers-and-sea-flood-zone-3
ogr2ogr -f "PostgreSQL" PG:"host=db dbname=homesearch user=homesearch" \
  -lco SCHEMA=defra -lco precision=NO -nlt PROMOTE_TO_MULTI \
  -t_srs EPSG:4326 \
  /homesearch/data/flood/zone3/data
