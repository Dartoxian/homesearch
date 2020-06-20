\c homesearch

SET ROLE homesearch;

CREATE TABLE metadata.stations (
    station_id serial PRIMARY KEY,
    name text,
    network text[],
    location geometry
);

CREATE INDEX ON metadata.stations USING GIST(location);

ALTER TABLE houses ADD distance_to_national_rail_station float;
ALTER TABLE houses ADD distance_to_city_rail_station float;