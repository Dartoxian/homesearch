\c homesearch

SET ROLE homesearch;

CREATE TABLE house_feature (
    house_feature_id serial PRIMARY KEY,
    house_id integer REFERENCES houses ON DELETE CASCADE,
    feature text,
    UNIQUE(house_id, feature)
);

CREATE INDEX ON house_feature(feature, house_id);

ALTER TABLE houses ADD COLUMN first_seen timestamp DEFAULT CURRENT_TIMESTAMP;