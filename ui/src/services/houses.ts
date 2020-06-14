import {Point} from "geojson";
import {LatLngBounds} from "leaflet";

export interface HousePropertyMeta {
    house_id: number
    price: number
    location: Point
    num_floors?: number
    num_bedrooms?: number
    num_bathrooms?: number
}


export interface HouseProperty extends HousePropertyMeta {
    title: string
    primary_image_url: string
    source: string
    source_url: string
    description: string
}


export function getProperties(bounds: LatLngBounds, after?: number): Promise<HousePropertyMeta[]> {
    return fetch('http://localhost:5000/api/houses', {
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