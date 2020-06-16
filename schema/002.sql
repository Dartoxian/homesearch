\c homesearch

SET ROLE homesearch;

ALTER TABLE houses ADD distance_to_nearest_convenience float;
ALTER TABLE houses ADD distance_to_nearest_store float;

DROP INDEX houses_price_house_type_idx;
CREATE INDEX ON houses (price, house_type, num_bedrooms);
CREATE UNIQUE INDEX ON houses (external_id);


CREATE TABLE metadata.surgeries (
    surgery_id serial PRIMARY KEY,
    external_id text,
    name text,
    location geometry
);

CREATE INDEX ON metadata.surgeries USING GIST(location);

ALTER TABLE houses ADD distance_to_nearest_surgery float;