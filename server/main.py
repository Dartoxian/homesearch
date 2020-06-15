import json

from flask import Flask, jsonify, request, make_response, Request, Response
from flask_cors import CORS
from werkzeug.exceptions import BadRequest

from utils.sql import get_cursor

app = Flask(__name__)
CORS(app)


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

    query = (
        "SELECT house_id, title, primary_image_url, price, ST_AsGeoJSON(location) as location, num_floors,"
        " num_bedrooms, num_bathrooms, source FROM houses WHERE ST_Within(location, ST_GeomFromGeoJSON(%s))"
    )
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
            query += (
                " AND EXISTS (SELECT 1 FROM metadata.supermarkets"
                " WHERE ST_DistanceSphere(metadata.supermarkets.location, houses.location) <= %s)"
            )
            params += (filters["max_distance_to_convenience"],)
        if "max_distance_to_store" in filters:
            query += (
                " AND EXISTS (SELECT 1 FROM metadata.supermarkets"
                " WHERE ST_DistanceSphere(metadata.supermarkets.location, houses.location) <= %s"
                " AND metadata.supermarkets.location != 'convenience')"
            )
            params += (filters["max_distance_to_store"],)
    query += " ORDER BY house_id LIMIT 5000"

    cur = get_cursor()
    cur.execute(query, params)
    return jsonify([dict(row) for row in cur.fetchall()])


@app.route("/api/house", methods=["POST"])
def get_house():
    request_params = request.json
    if not request_params or "house_id" not in request_params:
        raise BadRequest("A house id must be specified to load a particular house")

    cur = get_cursor()
    cur.execute(
        "SELECT house_id, title, primary_image_url, price, ST_AsGeoJSON(location) as location, num_floors,"
        " num_bedrooms, num_bathrooms, source, source_url, description FROM houses WHERE house_id=%s",
        (request_params["house_id"],),
    )
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


if __name__ == "__main__":
    app.run(host="0.0.0.0")
