import {Point, Polygon} from "geojson";
import {LngLatBounds} from "mapbox-gl";

export const BASE_URL = `http://${window.location.hostname}:5000`;

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
    max_distance_to_surgery?: number;
    max_distance_to_national_rail?: number;
    max_distance_to_city_rail?: number;
}

export interface NhsSurgery {
    surgery_id: number;
    external_id: string;
    name: string;
    location: Point;
}

export interface RailStation {
    station_id: number;
    name: string;
    network: string[];
    location: Point;
}

const convertBoundsToGeoJson = (bounds: LngLatBounds): Polygon => {
    return {
        "type": "Polygon",
        "coordinates": [[
            [bounds.getWest(), bounds.getSouth()],
            [bounds.getWest(), bounds.getNorth()],
            [bounds.getEast(), bounds.getNorth()],
            [bounds.getEast(), bounds.getSouth()],
            [bounds.getWest(), bounds.getSouth()],
        ]],
    }
}

export function getProperties(bounds: LngLatBounds, after?: number, filters?: HousePropertyFilter): Promise<HousePropertyMeta[]> {
    return fetch(BASE_URL + '/api/houses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            box: JSON.stringify(convertBoundsToGeoJson(bounds)),
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
            box: JSON.stringify(convertBoundsToGeoJson(bounds)),
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

export function getSurgeries(bounds: LngLatBounds, after?: number): Promise<NhsSurgery[]> {
    return fetch(BASE_URL + '/api/nhs-surgeries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            box: JSON.stringify(convertBoundsToGeoJson(bounds)),
            after
        })
    })
        .then(r => r.json())
        .then((r) => r.map(it => ({
            ...it,
            location: JSON.parse(it.location),
        })));
}

export function getStations(bounds: LngLatBounds, after?: number): Promise<RailStation[]> {
    return fetch(BASE_URL + '/api/stations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            box: JSON.stringify(convertBoundsToGeoJson(bounds)),
            after
        })
    })
        .then(r => r.json())
        .then((r) => r.map(it => ({
            ...it,
            location: JSON.parse(it.location),
        })));
}