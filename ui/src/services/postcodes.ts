import {LatLngBounds} from "leaflet";
import {Point} from "geojson"

export interface Postcodes {
    postcode: string;
    location: Point
}


export function getPostcodes(bounds: LatLngBounds, after?: string): Promise<Postcodes[]> {
    return fetch('http://localhost:5000/api/postcodes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            box: JSON.stringify({
                "type": "Polygon",
                "coordinates": [[
                    [bounds.getWest(), bounds.getSouth()],
                    [bounds.getWest(), bounds.getNorth()],
                    [bounds.getEast(), bounds.getNorth()],
                    [bounds.getEast(), bounds.getSouth()],
                    [bounds.getWest(), bounds.getSouth()],
                ]],
            }),
            after,
        })
    })
        .then(r => r.json())
        .then((r) => r.map(it => ({
            ...it,
            location: JSON.parse(it.location),
        })));
}