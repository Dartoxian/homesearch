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
        raise BadRequest("A bounding box must be specified to get re")

    query = (
        "SELECT house_id, title, primary_image_url, price, ST_AsGeoJSON(location) as location, num_floors,"
        " num_bedrooms, num_bathrooms FROM houses WHERE ST_Within(location, ST_GeomFromGeoJSON(%s))"
    )
    params = (request_params["box"],)
    if "after" in request_params:
        query += " AND house_id>%s"
        params += (request_params["after"],)
    if "filters" in request_params:
        filters = request_params["filters"]
        if "min_price" in filters:
            query += " AND price>=%s"
            params += (filters["min_price"],)
        if "max_price" in filters:
            query += " AND price<=%s"
            params += (filters["max_price"],)
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


if __name__ == "__main__":
    app.run(host="0.0.0.0")
