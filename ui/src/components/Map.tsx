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
import {Feature, FeatureCollection} from "geojson";
import {HouseDetails} from "./details/HouseDetails";
import {Filters} from "./Filters";
import Cookies from "js-cookie";
import {BASE_URL} from "../services/config";
import {Tabs} from "./Tabs";
import {About} from "./About";
import {Account} from "./Account";
import {StarredProperties} from "./StarredProperties";
import {AppState, withAppContext} from "../models";


export interface HomesearchMapState {
    center: LngLat,
    zoom: number,
    bounds?: LngLatBounds,
    errors?: string,
    loading?: boolean,

    filters: HousePropertyFilter,
}

export class HomesearchMapWithContext extends React.Component<{appContext: AppState}, HomesearchMapState> {

    private mapRef = React.createRef<HTMLDivElement>();
    private homesearchMapLeaflet: HomesearchMapLeaflet;
    private loadId = 0;

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            center: Cookies.get("center") ? JSON.parse(Cookies.get("center")) : [-2.15, 51.2],
            zoom: parseFloat(Cookies.get("zoom")) || 9,
            filters: {
                price: [100000, 300000],
                num_bedrooms: [1, 3],
                ...(Cookies.get("filters") ? JSON.parse(Cookies.get("filters")) : {})
            }
        };
    }

    componentDidMount() {
        this.homesearchMapLeaflet = new HomesearchMapLeaflet(this.mapRef.current, this.state.center, this.state.zoom, this.handleViewportChanged, this.props.appContext.onHouseSelected);
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

    componentDidUpdate(prevProps: Readonly<{appContext: AppState}>, prevState: Readonly<HomesearchMapState>, snapshot?: any) {
        const {appContext: {user, focusPoint}} = this.props;
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
        if (user !== prevProps.appContext.user) {
            this.loadDataForBounds();
        }
        if (focusPoint !== undefined && focusPoint !== prevProps.appContext.focusPoint) {
            this.homesearchMapLeaflet.focusOnPoint(focusPoint.coordinates as [number, number]);
        }
    }

    render() {
        const {appContext: {onHouseSelected, selectedHouse}} = this.props;
        const {errors, loading, filters} = this.state;

        if (errors) return <Alert>Error :( {errors}</Alert>;

        return (
            <div className={"map-wrapper"}>
                <Toaster>
                    {loading && <Toast
                        intent={Intent.NONE} message={"Loading results"}
                        icon={<div className={Classes.ICON}><Spinner intent={Intent.PRIMARY} size={Icon.SIZE_STANDARD}/>
                        </div>}
                    />}
                </Toaster>
                <div ref={this.mapRef}/>
                <div className={"overlay-wrappers"}>
                    <Tabs tabs={[
                        {
                            name: "Filters",
                            panel: (
                                <Filters
                                    initialFilter={filters}
                                    onFiltersUpdate={(filters) => this.setState((state) => ({...state, filters}))}
                                />
                            )
                        },
                        {
                            name: "Starred Properties",
                            panel: (
                                <StarredProperties />
                            )
                        },
                        {
                            name: "Account",
                            panel: (
                                <Account />
                            )
                        },
                        {
                            name: "About",
                            panel: (
                                <About />
                            )
                        }
                    ]}/>
                    {selectedHouse && (
                        <HouseDetails
                            houseMeta={selectedHouse}
                            onHouseMetaUpdate={(house) => this.homesearchMapLeaflet.updatePoint(house)}
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

    loadDataForBounds = () => {
        if (this.state.bounds === undefined) {
            return;
        }
        this.loadId += 1;
        this.loadPropertyDataForBounds(this.loadId);
        this.loadSupermarketDataForBounds(this.loadId);
        this.loadSurgeriesForBounds(this.loadId);
        this.loadStationsForBounds(this.loadId);
        this.setState((state) => ({...state, loading: true}));
    }

    loadPropertyDataForBounds = (loadId: number, from?: number) => {
        if (loadId !== this.loadId) {
            return;
        }
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

    loadSupermarketDataForBounds = (loadId: number, from?: number) => {
        if (loadId !== this.loadId) {
            return;
        }
        const {bounds} = this.state;
        getSupermarkets(bounds, from).then((supermarkets) => {
            this.homesearchMapLeaflet.addSupermarkets(supermarkets);
            if (supermarkets.length == 5000) {
                this.loadSupermarketDataForBounds(supermarkets[supermarkets.length - 1].supermarket_id)
            }
        });
    }

    loadSurgeriesForBounds = (loadId: number, from?: number) => {
        if (loadId !== this.loadId) {
            return;
        }
        const {bounds} = this.state;
        getSurgeries(bounds, from).then((surgeries) => {
            this.homesearchMapLeaflet.addSurgeries(surgeries);
            if (surgeries.length == 5000) {
                this.loadSurgeriesForBounds(surgeries[surgeries.length - 1].surgery_id)
            }
        });
    }

    loadStationsForBounds = (loadId: number, from?: number) => {
        if (loadId !== this.loadId) {
            return;
        }
        const {bounds} = this.state;
        getStations(bounds, from).then((stations) => {
            this.homesearchMapLeaflet.addStations(stations);
            if (stations.length == 5000) {
                this.loadStationsForBounds(stations[stations.length - 1].station_id)
            }
        });
    }
}

export const HomesearchMap = withAppContext(HomesearchMapWithContext)

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
            this.map.addSource('zone3-floods', {
                'type': 'vector',
                'tiles': [
                    `${BASE_URL}/api/flood/zone3/{z}/{x}/{y}.mvt`
                ]
            });
            this.map.addSource('zone2-floods', {
                'type': 'vector',
                'tiles': [
                    `${BASE_URL}/api/flood/zone2/{z}/{x}/{y}.mvt`
                ]
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
                    "circle-color": [
                        "case",
                        ["==", ["get", "sentiment_type"], "favourite"], Colors.GOLD3,
                        ["==", ["get", "sentiment_type"], "ignore"], Colors.GRAY3,
                        Colors.VIOLET1
                    ],
                    'circle-stroke-color': 'white',
                    'circle-stroke-width': 1,
                    'circle-opacity': 0.7,
                }
            });
            this.map.addLayer({
                'id': 'zone2-floods',
                'type': 'fill',
                'source': 'zone2-floods',
                'source-layer': 'default',
                'minzoom': 9,
                'maxzoom': 22,
                'paint': {
                    'fill-opacity': 0.1,
                    'fill-color': Colors.BLUE1,
                }
            })
            this.map.addLayer({
                'id': 'zone3-floods',
                'type': 'fill',
                'source': 'zone3-floods',
                'source-layer': 'default',
                'minzoom': 9,
                'maxzoom': 22,
                'paint': {
                    'fill-opacity': 0.2,
                    'fill-color': Colors.BLUE1,
                }
            })

            this.map.on("click", "points", function (e) {
                const house = Object.entries(e.features[0].properties).reduce((acc, [key, value]) => {
                    try {
                        acc[key] = JSON.parse(value);
                    } catch (e) {
                        acc[key] = value;
                    }
                    return acc;
                }, {}) as HousePropertyMeta;
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
                function (error, image) {
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

    public updatePoint(house: HousePropertyMeta) {
        const source = this.map.getSource("points") as GeoJSONSource;
        this.existingData = this.existingData.map(it => it.properties.house_id !== house.house_id ? it : ({
            type: 'Feature', geometry: house.location, properties: house
        }));

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