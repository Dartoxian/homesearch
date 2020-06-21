import json

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import BadRequest, HTTPException

from server.flood import flood_commands
from server.users import user_commands, verify_token
from utils.logging import get_logger
from utils.sql import get_cursor

app = Flask(__name__)
CORS(app)
app.register_blueprint(flood_commands)
app.register_blueprint(user_commands)
log = get_logger("main")


@app.route("/api/postcodes", methods=["POST"])
def get_postcodes():
    request_params = request.json
    if not request_params or "box" not in request_params:
        raise BadRequest("A bounding box must be specified to get postcodes")
    query = (
        "SELECT postcode, ST_AsGeoJSON(location) as location FROM metadata.postcodes"
        " WHERE ST_Within(location, ST_GeomFromGeoJSON(%s))"
    )
    params = (request_params["box"],)
    if request_params and "after" in request_params:
        query += " AND postcode>%s"
        params += (request_params["after"],)
    query += " ORDER BY postcode LIMIT 5000"

    cur = get_cursor()
    cur.execute(query, params)
    return jsonify([dict(row) for row in cur.fetchall()])


@app.route("/api/houses", methods=["POST"])
def get_houses():
    request_params = request.json
    if not request_params or "box" not in request_params:
        raise BadRequest("A bounding box must be specified to get houses")

    user_email = None
    try:
        user_email = verify_token()
    except HTTPException:
        # do nothing, the user isn't authenticated
        pass

    query = (
        "SELECT houses.house_id, title, primary_image_url, price, ST_AsGeoJSON(location) as location, num_floors,"
        " num_bedrooms, num_bathrooms, source, house_type, house_type_full"
    )
    params = ()
    if user_email is not None:
        query += (
            ", user_sentiment.type as sentiment_type"
            " FROM HOUSES LEFT JOIN user_sentiment"
            " ON houses.house_id = user_sentiment.house_id AND user_sentiment.user_email=%s"
            " WHERE ST_Within(location, ST_GeomFromGeoJSON(%s))"
        )
        params = (
            user_email,
            request_params["box"],
        )
    else:
        query += " FROM houses WHERE ST_Within(location, ST_GeomFromGeoJSON(%s))"
        params = (request_params["box"],)

    if "after" in request_params:
        query += " AND house_id>%s"
        params += (request_params["after"],)
    if "filters" in request_params:
        filters = request_params["filters"]
        if "price" in filters:
            query += " AND price<=%s AND price>=%s"
            params += (filters["price"][1], filters["price"][0])
        if "num_bedrooms" in filters:
            query += " AND num_bedrooms<=%s AND num_bedrooms>=%s"
            params += (filters["num_bedrooms"][1], filters["num_bedrooms"][0])
        if "property_types" in filters:
            query += " AND house_type IN %s"
            params += (tuple(filters["property_types"]),)
        if "max_distance_to_convenience" in filters:
            query += " AND distance_to_nearest_convenience <= %s"
            params += (filters["max_distance_to_convenience"],)
        if "max_distance_to_store" in filters:
            query += " AND distance_to_nearest_store<=%s"
            params += (filters["max_distance_to_store"],)
        if "max_distance_to_surgery" in filters:
            query += " AND distance_to_nearest_surgery<=%s"
            params += (filters["max_distance_to_surgery"],)
        if "max_distance_to_national_rail" in filters:
            query += " AND distance_to_national_rail_station<=%s"
            params += (filters["max_distance_to_national_rail"],)
        if "max_distance_to_city_rail" in filters:
            query += " AND distance_to_city_rail_station<=%s"
            params += (filters["max_distance_to_city_rail"],)
    query += " ORDER BY house_id LIMIT 5000"

    cur = get_cursor()
    cur.execute(query, params)
    return jsonify([dict(row) for row in cur.fetchall()])


@app.route("/api/house", methods=["POST"])
def get_house():
    request_params = request.json
    if not request_params or "house_id" not in request_params:
        raise BadRequest("A house id must be specified to load a particular house")

    query = (
        "SELECT houses.house_id, title, primary_image_url, price, ST_AsGeoJSON(location) as location, num_floors,"
        " num_bedrooms, num_bathrooms, source, source_url, description, house_type, house_type_full"
    )

    try:
        user_email = verify_token()
        query += (
            ", user_sentiment.type as sentiment_type"
            " FROM houses LEFT JOIN user_sentiment"
            " ON houses.house_id = user_sentiment.house_id AND user_sentiment.user_email=%s"
            " WHERE houses.house_id=%s"
        )
        params = (user_email, request_params["house_id"])
    except HTTPException:
        query += " FROM houses WHERE houses.house_id=%s"
        params = (request_params["house_id"],)

    cur = get_cursor()
    cur.execute(query, params)
    return jsonify(dict(cur.fetchone()))


@app.route("/api/supermarkets", methods=["POST"])
def get_supermarkets():
    request_params = request.json
    if not request_params or "box" not in request_params:
        raise BadRequest("A bounding box must be specified to get supermarkets")

    query = (
        "SELECT supermarket_id, retailer, name, type, ST_AsGeoJSON(location) as location"
        " FROM metadata.supermarkets WHERE ST_Within(location, ST_GeomFromGeoJSON(%s))"
    )
    params = (request_params["box"],)
    if "after" in request_params:
        query += " AND supermarket_id>%s"
        params += (request_params["after"],)
    query += " ORDER BY supermarket_id LIMIT 5000"
    cur = get_cursor()
    cur.execute(query, params)
    return jsonify([dict(row) for row in cur.fetchall()])


@app.route("/api/nearest_supermarkets", methods=["POST"])
def get_nearest_supermarkets():
    request_params = request.json
    if not request_params or "point" not in request_params:
        raise BadRequest("A point must be specified to get nearby supermarkets")

    query = (
        "SELECT supermarket_id, retailer, name, type, ST_DistanceSphere(location, ST_GeomFromGeoJSON(%s)) as distance"
        " FROM metadata.supermarkets WHERE ST_DistanceSphere(location, ST_GeomFromGeoJSON(%s)) <= 10000"
    )
    params = (json.dumps(request_params["point"]), json.dumps(request_params["point"]))
    cur = get_cursor()
    cur.execute(query, params)
    return jsonify([dict(row) for row in cur.fetchall()])


@app.route("/api/nhs-surgeries", methods=["POST"])
def get_nhs_surgeries():
    request_params = request.json
    if not request_params or "box" not in request_params:
        raise BadRequest("A bounding box must be specified to get nhs-surgeries")

    query = (
        "SELECT surgery_id, external_id, name, ST_AsGeoJSON(location) as location"
        " FROM metadata.surgeries WHERE ST_Within(location, ST_GeomFromGeoJSON(%s))"
    )
    params = (request_params["box"],)
    if "after" in request_params:
        query += " AND surgery_id>%s"
        params += (request_params["after"],)
    query += " ORDER BY surgery_id LIMIT 5000"
    cur = get_cursor()
    cur.execute(query, params)
    return jsonify([dict(row) for row in cur.fetchall()])


@app.route("/api/stations", methods=["POST"])
def get_stations():
    request_params = request.json
    if not request_params or "box" not in request_params:
        raise BadRequest("A bounding box must be specified to get stations")

    query = (
        "SELECT station_id, name, network, ST_AsGeoJSON(location) as location"
        " FROM metadata.stations WHERE ST_Within(location, ST_GeomFromGeoJSON(%s))"
    )
    params = (request_params["box"],)
    if "after" in request_params:
        query += " AND station_id>%s"
        params += (request_params["after"],)
    query += " ORDER BY station_id LIMIT 5000"
    cur = get_cursor()
    cur.execute(query, params)
    return jsonify([dict(row) for row in cur.fetchall()])


if __name__ == "__main__":
    app.run(host="0.0.0.0")
