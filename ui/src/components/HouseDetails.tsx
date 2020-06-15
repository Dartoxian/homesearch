import * as React from 'react';
import {Card, H3, Spinner, H5, Button, H6, HTMLTable} from "@blueprintjs/core";
import {
    getHouse,
    getNearestSupermarkets,
    HouseProperty,
    HousePropertyMeta,
    NearbySupermarket
} from "../services/houses";
import {IconNames} from "@blueprintjs/icons";

export interface HouseDetailsProps {
    houseMeta: HousePropertyMeta;
    onClose: () => void;
}

export interface HouseDetailsState {
    house?: HouseProperty;
    supermarkets?: NearbySupermarket[];
}

export class HouseDetails extends React.Component<HouseDetailsProps, HouseDetailsState> {

    constructor(props: HouseDetailsProps) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.loadHouseDetails();
        this.loadNearbySupermarkets();
    }

    componentDidUpdate(prevProps: Readonly<HouseDetailsProps>, prevState: Readonly<HouseDetailsState>, snapshot?: any) {
        if (prevProps.houseMeta !== this.props.houseMeta) {
            this.loadHouseDetails();
            this.loadNearbySupermarkets();
        }
    }

    render() {
        let {house} = this.state;

        let content = <Spinner />;
        if (house) {
            content = (
                <>
                    <div className={"header"}><H3><a href={house.source_url} referrerPolicy={"no-referrer"} rel="nofollow noopener noreferrer" target={"_blank"}>
                        {house.title}
                    </a></H3>
                        <Button
                            minimal={true}
                            icon={IconNames.CROSS}
                            onClick={this.props.onClose}
                        />
                    </div>
                    <H5>GBP {house.price.toLocaleString()}</H5>
                    <Card className={"content-wrapper"}>
                        <img src={house.primary_image_url} />
                        <div>{house.description.split(/([A-Z].*?\.)(?=[A-Z])/).map((it, index) => <p key={index}>{it}</p>)}</div>
                        {this.renderSupermarkets()}
                    </Card>
                </>
            )
        }

        return (
            <Card className={"selected-house-wrapper"}>
                {content}
            </Card>
        );
    }

    renderSupermarkets() {
        let {supermarkets} = this.state;
        if (!supermarkets) {
            return <Spinner />;
        }
        return (
            <div>
                <H6>Supermarkets</H6>
                <HTMLTable>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Distance</th>
                    </tr>
                    </thead>
                    <tbody>
                    {supermarkets
                        .filter(it => {
                            switch (it.type) {
                                case "convenience": return it.distance < 1000;
                                case "store": return it.distance < 2000;
                                case "supermarket": return it.distance < 2000;
                                case "hypermarket": return it.distance < 10000;
                            }
                        })
                        .sort((a,b) => a.distance - b.distance)
                        .map((supermarket, index) => (
                            <tr key={index}>
                                <td>{supermarket.name}</td>
                                <td>{supermarket.type}</td>
                                <td>{(supermarket.distance / 1000).toFixed(2)}km</td>
                            </tr>
                        ))
                    }
                    </tbody>
                </HTMLTable>
            </div>
        )
    }

    loadHouseDetails = () => {
        const {houseMeta} = this.props;
        this.setState((state) => ({...state, house: undefined}));
        getHouse(houseMeta.house_id)
            .then((house) => this.setState((state) => ({...state, house})))
    }

    loadNearbySupermarkets = () => {
        const {houseMeta} = this.props;
        this.setState((state) => ({...state, supermarkets: undefined}));
        getNearestSupermarkets(houseMeta.location)
            .then((supermarkets) => this.setState((state) => ({...state, supermarkets})))
    }
}