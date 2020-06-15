import {Point} from "geojson";
import {LngLatBounds} from "mapbox-gl";

const BASE_URL = "http://localhost:5000";

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

export type SupermarketType = 'hypermarket'| 'supermarket'| 'store'| 'convenience'| 'unknown';

export interface Supermarket {
    supermarket_id: number;
    retailer: string;
    name: string;
    type: SupermarketType;
    location: Point;
}

export interface NearbySupermarket {
    supermarket_id: number;
    retailer: string;
    name: string;
    type: SupermarketType;
    distance: number;
}

export interface HousePropertyFilter {
    price: [number, number];
    property_types?: HouseType[];
    num_bedrooms: [number, number];
    max_distance_to_convenience?: number;
    max_distance_to_store?: number;
}

export function getProperties(bounds: LngLatBounds, after?: number, filters?: HousePropertyFilter): Promise<HousePropertyMeta[]> {
    return fetch(BASE_URL + '/api/houses', {
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
    return fetch(BASE_URL + '/api/house', {
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

export function getSupermarkets(bounds: LngLatBounds, after?: number): Promise<Supermarket[]> {
    return fetch(BASE_URL + '/api/supermarkets', {
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
            after
        })
    })
        .then(r => r.json())
        .then((r) => r.map(it => ({
            ...it,
            location: JSON.parse(it.location),
        })));
}

export function getNearestSupermarkets(point: Point): Promise<NearbySupermarket[]> {
    return fetch(BASE_URL + '/api/nearest_supermarkets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            point
        })
    })
        .then(r => r.json());
}