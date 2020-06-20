\c homesearch

SET ROLE homesearch;

ALTER TABLE houses ADD last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE fetch_state (
    fetch_state_id serial PRIMARY KEY,
    source text,
    last_success text,
    UNIQUE(source)
);