import {Point} from "geojson";
import {LngLatBounds} from "mapbox-gl";

export interface HousePropertyMeta {
    house_id: number
    title: string
    primary_image_url: string
    price: number
    location: Point
    num_floors?: number
    num_bedrooms?: number
    num_bathrooms?: number
}


export interface HouseProperty extends HousePropertyMeta {
    source: string
    source_url: string
    description: string
}

export interface HousePropertyFilter {
    min_price?: number;
    max_price?: number;
}

export function getProperties(bounds: LngLatBounds, after?: number, filters?: HousePropertyFilter): Promise<HousePropertyMeta[]> {
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
            filters
        })
    })
        .then(r => r.json())
        .then((r) => r.map(it => ({
            ...it,
            location: JSON.parse(it.location),
        })));
}