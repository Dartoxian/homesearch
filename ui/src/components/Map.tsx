import React from 'react'
import {Alert, Card, Colors, FormGroup, HTMLSelect, NumberRange, RangeSlider} from "@blueprintjs/core";
import {getProperties, HousePropertyFilter, HousePropertyMeta} from "../services/houses";
import mapboxgl, {GeoJSONSource, LngLatBounds} from 'mapbox-gl';
import {Feature, FeatureCollection, Point} from "geojson";


const initialPosition: [number, number] = [-2.15, 51.2]


export interface HomesearchMapState {
    bounds?: LngLatBounds,
    errors?: string,
    loading?: boolean,

    filters: HousePropertyFilter,
}

export class HomesearchMap extends React.Component<{}, HomesearchMapState> {

    private mapRef = React.createRef<HTMLDivElement>();
    private homesearchMapLeaflet: HomesearchMapLeaflet;

    constructor(props) {
        super(props);
        this.state = {
            filters: {
                min_price: 100000,
                max_price: 300000
            }
        };
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
            this.setState(
                (state) => ({...state, bounds: this.homesearchMapLeaflet.map.getBounds()}),
                () => this.loadDataForBounds());
        });
    }

    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<HomesearchMapState>, snapshot?: any) {
        const {bounds, filters} = this.state;
        if (bounds !== prevState.bounds) {
            this.loadDataForBounds();
            return
        }
        if (filters !== prevState.filters) {
            this.homesearchMapLeaflet.clearPoints();
            this.loadDataForBounds();
            return
        }
    }

    render() {
        const {errors, filters: {min_price, max_price}} = this.state;
        const price_values = [0, 50000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000,
            300000, 325000, 350000, 375000, 400000, 450000, 500000, 600000, 700000, 800000];

        if (errors) return <Alert>Error :( {errors}</Alert>;

        return (
            <div className={"map-wrapper"}>
                <div ref={this.mapRef}/>
                <Card className={"filters"}>
                    Here are some filters
                    <div className={"price-range"}>
                        <FormGroup
                            label={"Price Range"}
                        >
                            <RangeSlider
                                min={0}
                                max={500000}
                                value={[min_price, max_price]}
                                labelStepSize={100000}
                                stepSize={10000}
                                labelRenderer={price => `${(price/1000).toFixed(0)}k`}
                                onChange={this.handlePriceRangeChanged}
                            />
                        </FormGroup>
                    </div>
                </Card>
            </div>
        );
    }

    handleViewportChanged = () => {
        if (this.homesearchMapLeaflet) {
            const bounds = this.homesearchMapLeaflet.map.getBounds();
            this.setState((state) => ({...state, bounds}));
        }
    }

    handlePriceRangeChanged = (range: NumberRange) => {
        this.setState((state) => ({
            ...state, filters: {...state.filters, min_price: range[0], max_price: range[1]}
        }));
    }

    loadDataForBounds = (from?: number) => {
        const {bounds, filters} = this.state;
        getProperties(bounds, from, filters).then((houses) => {
            this.homesearchMapLeaflet.addPoints(houses);
            if (houses.length < 5000) {
                this.setState((state) => ({...state, loading: false}));
            } else {
                this.loadDataForBounds(houses[houses.length - 1].house_id)
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
            const self = this;
            this.map.on("click", "points", function (e) {
                const coordinates = (e.features[0].geometry as Point).coordinates as [number, number];
                const house = e.features[0].properties as HousePropertyMeta;
                const description = `<div class="property-popup"><div>${house.title}</div><div><b>${house.price}</b></div></div><img src='${house.primary_image_url}'/></div>`;

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(description)
                    .setMaxWidth("360px")
                    .addTo(self.map);
            })
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