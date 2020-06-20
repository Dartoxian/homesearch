import React from 'react'
import {Alert, Classes, Colors, Icon, Intent, Spinner, Toast, Toaster} from "@blueprintjs/core";
import {
    getProperties, getStations,
    getSupermarkets,
    getSurgeries,
    HousePropertyFilter,
    HousePropertyMeta, NhsSurgery, RailStation,
    Supermarket
} from "../services/houses";
import mapboxgl, {GeoJSONSource, LngLat, LngLatBounds, LngLatLike} from 'mapbox-gl';
import {Feature, FeatureCollection, Point} from "geojson";
import {HouseDetails} from "./HouseDetails";
import {Filters} from "./Filters";
import Cookies from "js-cookie";


export interface HomesearchMapState {
    center: LngLat,
    zoom: number,
    bounds?: LngLatBounds,
    errors?: string,
    loading?: boolean,

    filters: HousePropertyFilter,
    selectedHouse?: HousePropertyMeta;
}

export class HomesearchMap extends React.Component<{}, HomesearchMapState> {

    private mapRef = React.createRef<HTMLDivElement>();
    private homesearchMapLeaflet: HomesearchMapLeaflet;

    constructor(props) {
        super(props);
        this.state = {
            center: Cookies.get("center") ? JSON.parse(Cookies.get("center")) : [-2.15, 51.2],
            zoom: parseFloat(Cookies.get("zoom")) || 9,
            filters: {
                price:  [100000, 300000],
                num_bedrooms: [1, 3],
                ...(Cookies.get("filters") ? JSON.parse(Cookies.get("filters")) : {})
            }
        };
    }

    componentDidMount() {
        this.homesearchMapLeaflet = new HomesearchMapLeaflet(this.mapRef.current, this.state.center, this.state.zoom, this.handleViewportChanged, this.handleHouseSelected);
        new Promise(resolve => {
            const checkLoaded = () => {
                if (this.homesearchMapLeaflet.map.loaded()) {
                    return resolve();
                }
                setTimeout(checkLoaded, 20);
            }
            checkLoaded();
        }).then(() => {
            this.setState(
                (state) => ({...state, bounds: this.homesearchMapLeaflet.map.getBounds()}),
                () => this.loadDataForBounds());
        });
    }

    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<HomesearchMapState>, snapshot?: any) {
        const {bounds, zoom, filters} = this.state;
        if (bounds !== prevState.bounds || zoom != prevState.zoom) {
            Cookies.set("center", JSON.stringify(bounds.getCenter()))
            Cookies.set("zoom", JSON.stringify(zoom))
            this.loadDataForBounds();
            return
        }
        if (filters !== prevState.filters) {
            Cookies.set("filters", JSON.stringify(filters))
            this.homesearchMapLeaflet.clearPoints();
            this.loadDataForBounds();
            return
        }
    }

    render() {
        const {errors, loading, filters, selectedHouse} = this.state;

        if (errors) return <Alert>Error :( {errors}</Alert>;

        return (
            <div className={"map-wrapper"}>
                <Toaster>
                    {loading && <Toast
                        intent={Intent.NONE} message={"Loading results"}
                        icon={<div className={Classes.ICON}><Spinner intent={Intent.PRIMARY} size={Icon.SIZE_STANDARD}/></div>}
                    />}
                </Toaster>
                <div ref={this.mapRef}/>
                <div className={"overlay-wrappers"}>
                <Filters initialFilter={filters} onFiltersUpdate={(filters) => this.setState((state) => ({...state, filters}))}/>
                {selectedHouse && (
                    <HouseDetails
                        houseMeta={selectedHouse}
                        onClose={() => this.setState((state) => ({...state, selectedHouse: undefined}))}
                        onFocus={this.handleSelectedFocus}
                    />
                )}
                </div>
            </div>
        );
    }

    handleViewportChanged = () => {
        if (this.homesearchMapLeaflet) {
            const bounds = this.homesearchMapLeaflet.map.getBounds();
            const zoom = this.homesearchMapLeaflet.map.getZoom();
            this.setState((state) => ({...state, bounds, zoom}));
        }
    }

    handleHouseSelected = (selectedHouse: HousePropertyMeta) => {
        this.setState((state) => ({...state, selectedHouse: {...selectedHouse, location: JSON.parse(selectedHouse.location as unknown as string)}}));
    }

    handleSelectedFocus = () => {
        const {selectedHouse} = this.state;
        if (selectedHouse) {
            this.homesearchMapLeaflet.focusOnPoint(selectedHouse.location.coordinates as [number,number]);
        }
    }

    loadDataForBounds = () => {
        this.loadPropertyDataForBounds();
        this.loadSupermarketDataForBounds();
        this.loadSurgeriesForBounds();
        this.loadStationsForBounds();
        this.setState((state) => ({...state, loading: true}));
    }

    loadPropertyDataForBounds = (from?: number) => {
        const {bounds, filters} = this.state;
        getProperties(bounds, from, filters).then((houses) => {
            this.homesearchMapLeaflet.addPoints(houses);
            if (houses.length < 5000) {
                this.setState((state) => ({...state, loading: false}));
            } else {
                this.loadPropertyDataForBounds(houses[houses.length - 1].house_id)
            }
        });
    }

    loadSupermarketDataForBounds = (from?: number) => {
        const {bounds} = this.state;
        getSupermarkets(bounds).then((supermarkets) => {
            this.homesearchMapLeaflet.addSupermarkets(supermarkets);
            if (supermarkets.length == 5000) {
                this.loadSupermarketDataForBounds(supermarkets[supermarkets.length - 1].supermarket_id)
            }
        });
    }

    loadSurgeriesForBounds = (from?: number) => {
        const {bounds} = this.state;
        getSurgeries(bounds).then((surgeries) => {
            this.homesearchMapLeaflet.addSurgeries(surgeries);
            if (surgeries.length == 5000) {
                this.loadSupermarketDataForBounds(surgeries[surgeries.length - 1].surgery_id)
            }
        });
    }

    loadStationsForBounds = (from?: number) => {
        const {bounds} = this.state;
        getStations(bounds).then((stations) => {
            this.homesearchMapLeaflet.addStations(stations);
            if (stations.length == 5000) {
                this.loadStationsForBounds(stations[stations.length - 1].station_id)
            }
        });
    }
}

class HomesearchMapLeaflet {
    public map: mapboxgl.Map;
    private existingData: Feature[] = [];
    private existingSupermarkets: Feature[] = [];
    private existingSurgeries: Feature[] = [];
    private existingStations: Feature[] = [];

    constructor(el: HTMLElement, initialPosition: LngLat, initialZoom: number, onViewportChanged: () => void, onHouseSelected: (house: HousePropertyMeta) => void) {
        this.map = new mapboxgl.Map({
            container: el,
            style: 'https://api.maptiler.com/maps/basic/style.json?key=98DzToNTtzoxe8HMYXmL',
            center: initialPosition,
            zoom: initialZoom
        });

        this.map.on("load", () => {
            const self = this;
            this.loadImages();

            this.map.addSource("points", {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: this.existingData,
                },
                generateId: true
            });
            this.map.addSource("supermarkets", {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: this.existingSupermarkets
                },
                generateId: true
            });
            this.map.addSource("nhs-surgery", {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: this.existingSurgeries
                },
                generateId: true
            });
            this.map.addSource("station", {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: this.existingStations
                },
                generateId: true
            });
            this.map.addLayer({
                id: "supermarkets",
                type: "symbol",
                source: "supermarkets",
                'layout': {
                    'icon-image': ["case",
                        ["==", ["get", "retailer"], "Aldi"], "aldi",
                        ["==", ["get", "retailer"], "Asda"], "asda",
                        ["==", ["get", "retailer"], "Booths"], "booths",
                        ["==", ["get", "retailer"], "Budgens"], "budgens",
                        ["==", ["get", "retailer"], "Costco"], "costco",
                        ["==", ["get", "retailer"], "Iceland"], "iceland",
                        ["==", ["get", "retailer"], "Lidl"], "lidl",
                        ["==", ["get", "retailer"], "Makro"], "makro",
                        ["==", ["get", "retailer"], "Marks and Spencer"], "mands",
                        ["==", ["get", "retailer"], "Morrisons"], "morrisons",
                        ["==", ["get", "retailer"], "Sainsburys"], "sainsburys",
                        ["==", ["get", "retailer"], "Spar"], "spar",
                        ["==", ["get", "retailer"], "Tesco"], "tesco",
                        ["==", ["get", "retailer"], "The Co-operative Group"], "the-coop",
                        ["==", ["get", "retailer"], "Waitrose"], "waitrose",
                        'store'
                    ],
                    'icon-size': 0.5,
                    "icon-allow-overlap": true,
                },
                minzoom: 13
            });
            this.map.addLayer({
                id: "nhs-surgery",
                type: "symbol",
                source: "nhs-surgery",
                'layout': {
                    'icon-image': "nhs",
                    'icon-size': 0.5,
                    "icon-allow-overlap": true,
                },
                minzoom: 13
            });
            this.map.addLayer({
                id: "station",
                type: "symbol",
                source: "station",
                'layout': {
                    'icon-image': ["case",
                        ['in', 'National Rail', ['get', 'network']], "national-rail",
                        ['in', 'London Underground', ['get', 'network']], "underground",
                        ['in', 'London Overground', ['get', 'network']], "overground",
                        "station"
                    ],
                    'icon-size': 1,
                    "icon-allow-overlap": true,
                },
                minzoom: 11
            });
            this.map.addLayer({
                id: "points",
                type: "circle",
                source: "points",
                paint: {
                    'circle-radius': ["case",
                        ["boolean", ["feature-state", "hover"], false], 8,
                        4
                    ],
                    'circle-color': ["case",
                        ["<=", ["get", "price"], 100000], Colors.GREEN1,
                        ["<=", ["get", "price"], 200000], Colors.BLUE1,
                        ["<=", ["get", "price"], 300000], Colors.BLUE2,
                        ["<=", ["get", "price"], 400000], Colors.BLUE3,
                        ["<=", ["get", "price"], 500000], Colors.RED1,
                        ["<=", ["get", "price"], 600000], Colors.RED3,
                        Colors.RED5
                    ],
                    'circle-stroke-color': 'white',
                    'circle-stroke-width': 1,
                    'circle-opacity': 0.7,
                }
            });

            this.map.setPaintProperty("points", "circle-color", [
                "case",
                ["==", ["get", "source"], "Zoopla"], Colors.VIOLET1,
                ["==", ["get", "source"], "RightMove"], Colors.GREEN1,
                Colors.RED5
            ])

            this.map.on("click", "points", function (e) {
                const house = e.features[0].properties as HousePropertyMeta;
                onHouseSelected(house);
            });

            let hoveredFeatureId: string;
            this.map.on('mousemove', "points", (e) => {
                self.map.getCanvas().style.cursor = 'pointer';
                if (e.features.length === 0) {
                    return;
                }

                if (hoveredFeatureId) {
                    self.map.removeFeatureState({source: "points", id: hoveredFeatureId});
                }
                hoveredFeatureId = e.features[0].id as string;

                self.map.setFeatureState({
                    source: "points",
                    id: hoveredFeatureId,
                }, {
                    hover: true
                })
            });
            this.map.on('mouseleave', "points", (e) => {
                self.map.getCanvas().style.cursor = '';
                if (hoveredFeatureId) {
                    self.map.removeFeatureState({source: "points", id: hoveredFeatureId});
                    hoveredFeatureId = null;
                }
            });
        });

        this.map.on("dragend", onViewportChanged);
        this.map.on("zoomend", onViewportChanged)
    }

    private loadImages = () => {
        const self = this;
        ['aldi', 'asda', 'booths', 'budgens', 'costco', 'iceland', 'lidl', 'makro', 'mands',
            'morrisons', 'sainsburys', 'tesco', 'the-coop', 'waitrose', 'store',
            'nhs', 'national-rail', 'underground', 'overground', 'station'
        ].forEach((retailer) => {
            this.map.loadImage(
                `/${retailer}.png`,
                function(error, image) {
                    if (error) throw error;
                    self.map.addImage(retailer, image);
                });
        })
    }

    public addPoints(houses: HousePropertyMeta[]) {
        const source = this.map.getSource("points") as GeoJSONSource;
        const existingPoints = new Set(this.existingData.map(it => it.properties.house_id))
        this.existingData = [
            ...this.existingData,
            ...houses.filter(house => !existingPoints.has(house.house_id)).map((house): Feature => ({
                type: 'Feature', geometry: house.location, properties: house
            }))
        ]

        const data: FeatureCollection = {
            type: "FeatureCollection",
            features: this.existingData
        }
        source.setData(data);
    }

    public addSupermarkets(supermarkets: Supermarket[]) {
        const source = this.map.getSource("supermarkets") as GeoJSONSource;
        const existingPoints = new Set(this.existingSupermarkets.map(it => it.properties.supermarket_id))
        this.existingSupermarkets = [
            ...this.existingSupermarkets,
            ...supermarkets.filter(supermarket => !existingPoints.has(supermarket.supermarket_id)).map((supermarket): Feature => ({
                type: 'Feature', geometry: supermarket.location, properties: supermarket
            }))
        ]

        const data: FeatureCollection = {
            type: "FeatureCollection",
            features: this.existingSupermarkets
        }
        source.setData(data);
    }

    public addSurgeries(surgeries: NhsSurgery[]) {
        const source = this.map.getSource("nhs-surgery") as GeoJSONSource;
        const existingPoints = new Set(this.existingSurgeries.map(it => it.properties.surgery_id))
        this.existingSurgeries = [
            ...this.existingSurgeries,
            ...surgeries.filter(surgery => !existingPoints.has(surgery.surgery_id)).map((surgery): Feature => ({
                type: 'Feature', geometry: surgery.location, properties: surgery
            }))
        ]

        const data: FeatureCollection = {
            type: "FeatureCollection",
            features: this.existingSurgeries
        }
        source.setData(data);
    }

    public addStations(stations: RailStation[]) {
        const source = this.map.getSource("station") as GeoJSONSource;
        const existingPoints = new Set(this.existingStations.map(it => it.properties.station_id))
        this.existingStations = [
            ...this.existingStations,
            ...stations.filter(surgery => !existingPoints.has(surgery.station_id)).map((station): Feature => ({
                type: 'Feature', geometry: station.location, properties: station
            }))
        ]

        const data: FeatureCollection = {
            type: "FeatureCollection",
            features: this.existingStations
        }
        source.setData(data);
    }

    public clearPoints() {
        const source = this.map.getSource("points") as GeoJSONSource;
        this.existingData = [];
        const data: FeatureCollection = {
            type: "FeatureCollection",
            features: this.existingData
        }
        source.setData(data);
    }

    public focusOnPoint(point: LngLatLike) {
        console.log(point);
        this.map.flyTo({
            center: point,
            around: point,
            zoom: 14,
        });
    }
}