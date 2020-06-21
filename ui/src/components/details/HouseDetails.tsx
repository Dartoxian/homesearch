import * as React from 'react';
import {Card, H3, Spinner, H5, Button, Tabs, Tab, Icon, UL} from "@blueprintjs/core";
import {
    getHouse,
    getNearestSupermarkets,
    HouseProperty,
    HousePropertyMeta,
    NearbySupermarket, SentimentType
} from "../../services/houses";
import {IconNames} from "@blueprintjs/icons";
import {Supermarkets} from "./Supermarkets";
import {Description} from "./Description";
import {getFavourites, removeSentiment, setSentiment} from "../../services/users";
import {AppState, withAppContext} from "../../models";

export interface HouseDetailsProps {
    appContext: AppState
    onHouseMetaUpdate: (house: HousePropertyMeta) => void;
}

export interface HouseDetailsState {
    house?: HouseProperty;
    supermarkets?: NearbySupermarket[];
    processingSentiment?: boolean;
}

export class HouseDetailsWithContext extends React.Component<HouseDetailsProps, HouseDetailsState> {

    constructor(props: HouseDetailsProps) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.loadHouseDetails();
        this.loadNearbySupermarkets();

    }

    componentDidUpdate(prevProps: Readonly<HouseDetailsProps>, prevState: Readonly<HouseDetailsState>, snapshot?: any) {
        if (prevProps.appContext.selectedHouse !== this.props.appContext.selectedHouse) {
            this.loadHouseDetails();
            this.loadNearbySupermarkets();
        }
    }

    render() {
        let {house, supermarkets, processingSentiment} = this.state;

        let content = <Spinner />;
        if (house) {
            content = (
                <>
                    <div className={"header"}>
                        <H3>
                            <a href={house.source_url} referrerPolicy={"no-referrer"} rel="nofollow noopener noreferrer" target={"_blank"}>
                                {house.title} <Icon icon={IconNames.SHARE} iconSize={Icon.SIZE_LARGE}/>
                            </a>
                        </H3>
                        <div className={"controls"}>
                            <Button
                                minimal={true}
                                icon={house.sentiment_type === "favourite" ? IconNames.STAR : IconNames.STAR_EMPTY}
                                loading={processingSentiment}
                                onClick={this.handleSentimentClick("favourite")}
                            />
                            <Button
                                minimal={true}
                                icon={IconNames.TRASH}
                                active={house.sentiment_type === "ignore"}
                                loading={processingSentiment}
                                onClick={this.handleSentimentClick("ignore")}
                            />
                            <Button
                                minimal={true}
                                icon={IconNames.LOCATE}
                                onClick={() => this.props.appContext.onFocusPoint(this.props.appContext.selectedHouse.location)}
                            />
                            <Button
                                minimal={true}
                                icon={IconNames.CROSS}
                                onClick={() => this.props.appContext.onHouseSelected(undefined)}
                            />
                        </div>
                    </div>
                    <H5>GBP {house.price.toLocaleString()}</H5>
                    <Card className={"content-wrapper"}>
                        <div className={'top-section'}>
                            <img src={house.primary_image_url} width={250} />
                            <UL>
                                <li><b>{house.num_bedrooms}</b> Bedrooms</li>
                                <li><b>{house.house_type_full}</b></li>
                                {house.num_floors !== undefined && house.num_floors > 0 && <li><b>{house.num_floors}</b> Floors</li>}
                            </UL>
                        </div>
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
        const {appContext: {selectedHouse}} = this.props;
        this.setState((state) => ({...state, house: undefined}));
        getHouse(selectedHouse.house_id)
            .then((house) => this.setState((state) => ({...state, house})))
    }

    loadNearbySupermarkets = () => {
        const {appContext: {selectedHouse}} = this.props;
        this.setState((state) => ({...state, supermarkets: undefined}));
        getNearestSupermarkets(selectedHouse.location)
            .then((supermarkets) => this.setState((state) => ({...state, supermarkets})))
    }

    handleSentimentClick = (setSentimentType: SentimentType) => () => {
        const {appContext: {selectedHouse, onUpdateFavourites}} = this.props;
        const {house: {sentiment_type}} = this.state;
        this.setState(state => ({...state, processingSentiment: true}));
        let p = sentiment_type === setSentimentType
            ? removeSentiment(selectedHouse.house_id)
            : setSentiment(selectedHouse.house_id, setSentimentType);
        p.then(() => this.setState(state => ({
            ...state,
            processingSentiment: false,
            house: {
                ...state.house,
                sentiment_type: sentiment_type === setSentimentType ? undefined : setSentimentType
            }
        }))).then(() => this.props.onHouseMetaUpdate(this.state.house)
        ).then(() => getFavourites()
        ).then(onUpdateFavourites);
    }
}

export const HouseDetails = withAppContext(HouseDetailsWithContext);