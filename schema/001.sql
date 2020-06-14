CREATE DATABASE homesearch;

\c homesearch
CREATE EXTENSION postgis;


CREATE USER homesearch;
ALTER USER homesearch WITH PASSWORD 'devpwd';
GRANT ALL PRIVILEGES ON DATABASE homesearch TO homesearch;

GRANT homesearch TO postgres;
SET ROLE homesearch;

CREATE TABLE houses (
    house_id serial PRIMARY KEY,
    title text NOT NULL,
    price integer NOT NULL,
    location geometry NOT NULL,
    primary_image_url text NOT NULL,
    source text NOT NULL,
    source_url text NOT NULL,

    num_floors integer,
    num_bedrooms integer,
    num_bathrooms integer,
    description text
);

CREATE INDEX ON houses USING GIST (location);
CREATE INDEX ON houses (source);

CREATE SCHEMA metadata;

CREATE TABLE metadata.postcodes (
    postcode_id serial PRIMARY KEY,
    postcode text,
    postcode_area text,
    postcode_district text,
    location geometry,
    county text,
    district text,
    ward text,
    country text,
    constituency text,
    parish text,
    national_park text,
    population integer,
    households integer,
    urban_type text,
    altitude integer,
    water_company text,
    average_income integer,
    census_code text,
    constituency_code text,
    UNIQUE(postcode)
);

CREATE INDEX ON metadata.postcodes USING GIST (location);
CREATE INDEX ON metadata.postcodes (constituency);