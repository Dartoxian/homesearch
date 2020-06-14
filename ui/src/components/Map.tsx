import React from 'react'
import {LatLngBounds} from "leaflet";
import {Alert, Intent, IToaster, Toaster} from "@blueprintjs/core";
import L from 'leaflet';
import {getPostcodes} from "../services/postcodes";
import {getProperties} from "../services/houses";


const initialPosition: [number, number] = [51.2, -2.09]


export interface HomesearchMapState {
    bounds?: LatLngBounds,
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
        const bounds = this.homesearchMapLeaflet.map.getBounds();
        this.loadDataForBounds(bounds);
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

    loadDataForBounds = (bounds: LatLngBounds, from?: number) => {
        getProperties(bounds, from).then((houses) => {
            this.homesearchMapLeaflet.addPoints(
                houses.map((it) =>
                    ({location: [it.location.coordinates[1], it.location.coordinates[0]], id: it.house_id})
                )
            );
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
    public map: L.Map;
    private markers: { [postcode: number]: L.CircleMarker } = {};

    constructor(el: HTMLElement, onViewportChanged: () => void) {
        this.map = L.map(el, {
            preferCanvas: true
        }).setView(initialPosition, 10);
        this.map.on("dragend", onViewportChanged)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

    public addPoints(locations: { location: [number, number], id: number }[]) {
        locations.forEach((location) => {
            if (!this.markers.hasOwnProperty(location.id)) {
                this.markers[location.id] = L.circle(location.location).addTo(this.map)
            }
        });
    }

    public clearPoints() {
        if (this.markers) {
            Object.values(this.markers).map((marker) => this.map.removeLayer(marker));
        }
    }
}