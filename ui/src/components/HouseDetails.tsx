import * as React from 'react';
import {Card, H3, Spinner, H5, Button, Tabs, Tab} from "@blueprintjs/core";
import {
    getHouse,
    getNearestSupermarkets,
    HouseProperty,
    HousePropertyMeta,
    NearbySupermarket
} from "../services/houses";
import {IconNames} from "@blueprintjs/icons";
import {Supermarkets} from "./details/Supermarkets";
import {Description} from "./details/Description";

export interface HouseDetailsProps {
    houseMeta: HousePropertyMeta;
    onClose: () => void;
    onFocus: () => void;
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
        let {house, supermarkets} = this.state;

        let content = <Spinner />;
        if (house) {
            content = (
                <>
                    <div className={"header"}><H3><a href={house.source_url} referrerPolicy={"no-referrer"} rel="nofollow noopener noreferrer" target={"_blank"}>
                        {house.title}
                    </a></H3>
                        <div className={"controls"}>
                            <Button
                                minimal={true}
                                icon={IconNames.LOCATE}
                                onClick={this.props.onFocus}
                            />
                            <Button
                                minimal={true}
                                icon={IconNames.CROSS}
                                onClick={this.props.onClose}
                            />
                        </div>
                    </div>
                    <H5>GBP {house.price.toLocaleString()}</H5>
                    <Card className={"content-wrapper"}>
                        <img src={house.primary_image_url} />
                        <Tabs>
                            <Tab id="description" title="Description" panel={<Description text={!house?undefined:house.description}/>} />
                            <Tab id="supermarkets" title="Supermarkets" panel={<Supermarkets supermarkets={supermarkets} />} />
                        </Tabs>
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