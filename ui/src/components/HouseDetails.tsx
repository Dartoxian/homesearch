import * as React from 'react';
import {Card, H3, Spinner, H5} from "@blueprintjs/core";
import {getHouse, HouseProperty} from "../services/houses";

export interface HouseDetailsProps {
    houseId: number;
}

export interface HouseDetailsState {
    house?: HouseProperty;
}

export class HouseDetails extends React.Component<HouseDetailsProps, HouseDetailsState> {

    constructor(props: HouseDetailsProps) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.loadHouseDetails()
    }

    componentDidUpdate(prevProps: Readonly<HouseDetailsProps>, prevState: Readonly<HouseDetailsState>, snapshot?: any) {
        if (prevProps.houseId !== this.props.houseId) {
            this.loadHouseDetails();
        }
    }

    render() {
        let {house} = this.state;

        let content = <Spinner />;
        if (house) {
            content = (
                <div>
                    <H3><a href={house.source_url} referrerPolicy={"no-referrer"} rel="nofollow noopener noreferrer" target={"_blank"}>
                        {house.title}
                    </a></H3>
                    <H5>GBP {house.price.toLocaleString()}</H5>
                    <img src={house.primary_image_url} />
                    <div>{house.description.split(/([A-Z].*?\.)(?=[A-Z])/).map((it, index) => <p key={index}>{it}</p>)}</div>
                </div>
            )
        }

        return (
            <Card className={"selected-house-wrapper"}>
                {content}
            </Card>
        );
    }

    loadHouseDetails = () => {
        const {houseId} = this.props;
        this.setState((state) => ({...state, house: undefined}));
        getHouse(houseId)
            .then((house) => this.setState((state) => ({...state, house})))
    }
}