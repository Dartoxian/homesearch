CREATE DATABASE homesearch;

\c homesearch
CREATE EXTENSION postgis;


CREATE USER homesearch;
ALTER USER homesearch WITH PASSWORD 'devpwd';
GRANT ALL PRIVILEGES ON DATABASE homesearch TO homesearch;

GRANT homesearch TO postgres;
SET ROLE homesearch;

CREATE TYPE house_type AS ENUM ('unknown', 'flat', 'detached', 'bungalow', 'semi_detached', 'land', 'terraced');

CREATE TABLE houses (
    house_id serial PRIMARY KEY,
    title text NOT NULL,
    price integer NOT NULL,
    location geometry NOT NULL,
    primary_image_url text NOT NULL,
    external_id text NOT NULL,
    source text NOT NULL,
    source_url text NOT NULL,

    num_floors integer,
    num_bedrooms integer,
    num_bathrooms integer,
    description text,
    house_type house_type,
    house_type_full text
);

CREATE INDEX ON houses USING GIST (location);
CREATE INDEX ON houses (source);
CREATE INDEX ON houses (price, house_type);

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

CREATE TYPE metadata.supermarket_type AS ENUM ('hypermarket', 'supermarket', 'store', 'convenience', 'unknown');

CREATE TABLE metadata.supermarkets (
    supermarket_id serial PRIMARY KEY,
    retailer text,
    name text,
    type metadata.supermarket_type,
    location geometry
);

CREATE INDEX ON metadata.supermarkets USING GIST (location);
CREATE INDEX ON metadata.supermarkets (type);