from http import HTTPStatus

import firebase_admin
from firebase_admin import auth
from flask import make_response, Blueprint, jsonify, request
from werkzeug.exceptions import BadRequest, Forbidden, Unauthorized

from utils.logging import get_logger
from utils.sql import get_cursor

user_commands = Blueprint("users", __name__)
default_app = firebase_admin.initialize_app()
log = get_logger("users")


def verify_token() -> str:
    id_token = request.headers.get("Auth-token")
    if id_token is None:
        raise Forbidden("No auth token found")
    decoded_token = auth.verify_id_token(id_token)
    uid = decoded_token["uid"]
    if uid is None:
        raise Unauthorized("Bad auth token")
    user = auth.get_user(uid)
    return user.email


@user_commands.route("/api/user/favourites", methods=["GET"])
def get_favourites():
    user_email = verify_token()
    cur = get_cursor()
    cur.execute(
        "WITH features AS (SELECT house_id, ARRAY_AGG(feature) AS features FROM house_feature GROUP BY house_id) "
        "SELECT houses.house_id, title, primary_image_url, price, ST_AsGeoJSON(location) as location, num_floors,"
        " num_bedrooms, num_bathrooms, source, house_type, house_type_full, features.features AS features"
        " FROM user_sentiment JOIN houses USING (house_id) LEFT JOIN features ON houses.house_id = features.house_id"
        " WHERE user_email=%s AND type='favourite'",
        (user_email,),
    )
    return jsonify([dict(row) for row in cur.fetchall()])


@user_commands.route("/api/user/sentiment/<sentiment_type>/<house_id>", methods=["PUT"])
def set_favourite(sentiment_type, house_id):
    user_email = verify_token()
    cur = get_cursor()
    cur.execute("SELECT 1 FROM houses WHERE house_id=%s", (house_id,))
    if cur.fetchone() is None:
        raise BadRequest(f"House id not found {house_id}")

    cur.execute(
        "INSERT INTO user_sentiment (user_email, house_id, type)"
        " VALUES (%(user_email)s, %(house_id)s, %(sentiment)s)"
        " ON CONFLICT (user_email, house_id) DO UPDATE SET"
        " user_email=%(user_email)s, house_id=%(house_id)s, type=%(sentiment)s",
        {"user_email": user_email, "house_id": house_id, "sentiment": sentiment_type},
    )
    cur.connection.commit()

    return make_response("", HTTPStatus.ACCEPTED)


@user_commands.route("/api/user/sentiment/<house_id>", methods=["DELETE"])
def delete_sentiment(house_id):
    user_email = verify_token()
    cur = get_cursor()
    cur.execute(
        "DELETE FROM user_sentiment WHERE" " user_email=%(user_email)s and house_id=%(house_id)s",
        {"user_email": user_email, "house_id": house_id},
    )
    cur.connection.commit()

    return make_response("", HTTPStatus.ACCEPTED)
