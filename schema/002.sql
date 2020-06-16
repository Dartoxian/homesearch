\c homesearch

SET ROLE homesearch;

ALTER TABLE houses ADD distance_to_nearest_convenience float;
ALTER TABLE houses ADD distance_to_nearest_store float;

DROP INDEX houses_price_house_type_idx;
CREATE INDEX ON houses (price, house_type, num_bedrooms);
CREATE UNIQUE INDEX ON houses (external_id);
