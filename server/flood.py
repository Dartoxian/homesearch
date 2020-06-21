from http import HTTPStatus

from flask import make_response, Blueprint

from server.vectorTileUtils import get_pbf_for


flood_commands = Blueprint("floods", __name__)


@flood_commands.route("/api/flood/zone3/<z>/<x>/<y>.<fmt>", methods=["GET"])
def get_zone3_flood_vector(z, x, y, fmt):
    pbf = get_pbf_for(
        float(x), float(y), float(z), "defra.flood_map_for_planning_rivers_and_sea_flood_zone_3", "wkb_geometry"
    )
    response = make_response(bytes(pbf), HTTPStatus.OK)
    response.headers["Content-type"] = "application/vnd.mapbox-vector-tile"
    return response


@flood_commands.route("/api/flood/zone2/<z>/<x>/<y>.<fmt>", methods=["GET"])
def get_zone2_flood_vector(z, x, y, fmt):
    pbf = get_pbf_for(
        float(x), float(y), float(z), "defra.flood_map_for_planning_rivers_and_sea_flood_zone_2", "wkb_geometry"
    )
    response = make_response(bytes(pbf), HTTPStatus.OK)
    response.headers["Content-type"] = "application/vnd.mapbox-vector-tile"
    return response
