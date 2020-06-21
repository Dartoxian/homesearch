\c homesearch

SET ROLE homesearch;

CREATE TYPE sentiment_type AS ENUM ('favourite', 'ignore');

CREATE TABLE user_sentiment (
    user_sentiment_id serial PRIMARY KEY,
    user_email text,
    house_id integer REFERENCES houses ON DELETE CASCADE,
    type sentiment_type,
    UNIQUE (user_email, house_id)
);

CREATE INDEX ON user_sentiment (user_email, house_id);