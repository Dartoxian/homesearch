CREATE DATABASE homesearch;

\c homesearch
CREATE EXTENSION postgis;


CREATE USER homesearch;
ALTER USER homesearch WITH PASSWORD 'devpwd';
GRANT ALL PRIVILEGES ON DATABASE homesearch TO homesearch;

GRANT homesearch TO postgres;
SET ROLE homesearch;

CREATE TABLE IF NOT EXISTS datasources (
    datasource_id serial PRIMARY KEY,
    name text,
    description text,
    creation_time TIMESTAMP NOT NULL default CURRENT_TIMESTAMP
);

CREATE TYPE property_type_enum AS ENUM ('title', 'description', 'price');

CREATE TABLE IF NOT EXISTS objects (
    object_id serial PRIMARY KEY,
    location geometry
);
CREATE INDEX ON objects USING GIST (location);

CREATE TABLE IF NOT EXISTS properties (
    property_id serial PRIMARY KEY,
    property_type property_type_enum,
    property_value jsonb,
    datasource_id integer REFERENCES datasources ON DELETE CASCADE,
    object_id integer REFERENCES objects ON DELETE CASCADE
);

CREATE INDEX ON properties (property_type);
CREATE INDEX ON properties (property_value);
CREATE INDEX ON properties (property_type, property_value);

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