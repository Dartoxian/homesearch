import {Point} from "geojson";
import {LngLatBounds} from "mapbox-gl";

export type HouseType = 'unknown' | 'flat' | 'detached' | 'bungalow' | 'semi_detached' | 'land' | 'terraced';
export const houseTypes: HouseType[] = ['unknown' , 'flat' , 'detached' , 'bungalow' , 'semi_detached' , 'land' , 'terraced']

export interface HousePropertyMeta {
    house_id: number
    title: string
    primary_image_url: string
    price: number
    location: Point
    num_floors?: number
    num_bedrooms?: number
    num_bathrooms?: number
    house_type?: HouseType
}


export interface HouseProperty extends HousePropertyMeta {
    source: string
    source_url: string
    description: string
    house_type_full: string
}

export interface HousePropertyFilter {
    price: [number, number];
    property_types?: HouseType[];
    num_bedrooms: [number, number];
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

export function getHouse(house_id: number): Promise<HouseProperty> {
    return fetch('http://localhost:5000/api/house', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            house_id
        })
    })
        .then(r => r.json())
        .then((r) => ({
            ...r,
            location: JSON.parse(r.location),
        }));
}