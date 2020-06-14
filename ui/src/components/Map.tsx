import React from 'react'
import {Alert, Colors, Intent, IToaster, Toaster} from "@blueprintjs/core";
import {getPostcodes} from "../services/postcodes";
import {getProperties, HousePropertyMeta} from "../services/houses";
import mapboxgl, {GeoJSONSource, GeoJSONSourceRaw, LngLatBounds} from 'mapbox-gl';
import {Feature, FeatureCollection, Point} from "geojson";


const initialPosition: [number, number] = [-2.15, 51.2]


export interface HomesearchMapState {
    bounds?: LngLatBounds,
    errors?: string,
    loading?: boolean,
    metadata_postcodes?: any
}

const toaster = Toaster.create();


export class HomesearchMap extends React.Component<{}, HomesearchMapState> {

    private mapRef = React.createRef<HTMLDivElement>();
    private homesearchMapLeaflet: HomesearchMapLeaflet;

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.homesearchMapLeaflet = new HomesearchMapLeaflet(this.mapRef.current, this.handleViewportChanged);
        new Promise(resolve => {
            const checkLoaded = () => {
                if (this.homesearchMapLeaflet.map.loaded()) {
                    return resolve();
                }
                setTimeout(checkLoaded, 20);
            }
            checkLoaded();
        }).then(() => {
            const bounds = this.homesearchMapLeaflet.map.getBounds();
            this.loadDataForBounds(bounds);
        });
    }

    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<HomesearchMapState>, snapshot?: any) {
        const {bounds} = this.state;
        if (bounds !== prevState.bounds) {
            this.loadDataForBounds(bounds)
        }
    }

    render() {
        const {errors} = this.state;

        if (errors) return <Alert>Error :( {errors}</Alert>;

        return (
            <div className={"map-wrapper"}>
                <div ref={this.mapRef}/>
            </div>
        );
    }

    handleViewportChanged = () => {
        if (this.homesearchMapLeaflet) {
            const bounds = this.homesearchMapLeaflet.map.getBounds();
            this.setState((state) => ({...state, bounds}));
        }
    }

    loadDataForBounds = (bounds: LngLatBounds, from?: number) => {
        getProperties(bounds, from).then((houses) => {
            this.homesearchMapLeaflet.addPoints(houses);
            if (houses.length < 5000) {
                this.setState((state) => ({...state, loading: false}));
            } else {
                this.loadDataForBounds(bounds, houses[houses.length - 1].house_id)
            }
        });
        this.setState((state) => ({...state, loading: true}));
    }
}

class HomesearchMapLeaflet {
    public map: mapboxgl.Map;
    private existingData: Feature[] = [];

    constructor(el: HTMLElement, onViewportChanged: () => void) {
        this.map = new mapboxgl.Map({
            container: el,
            style: 'https://api.maptiler.com/maps/basic/style.json?key=98DzToNTtzoxe8HMYXmL',
            center: initialPosition,
            zoom: 9
        });

        this.map.on("load", () => {
            this.map.addSource("points", {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: this.existingData
                }
            });
            this.map.addLayer({
                id: "points",
                type: "circle",
                source: "points",
                paint: {
                    'circle-radius': 4,
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
        });

        this.map.on("dragend", onViewportChanged);
    }

    public addPoints(houses: HousePropertyMeta[]) {
        const source = this.map.getSource("points") as GeoJSONSource;
        const existingPoints = new Set(this.existingData.map(it => it.properties['id']))
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

    public clearPoints() {
        const source = this.map.getSource("points") as GeoJSONSource;
        this.existingData = [];
        const data: FeatureCollection = {
            type: "FeatureCollection",
            features: this.existingData
        }
        source.setData(data);
    }
}