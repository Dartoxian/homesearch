import * as React from 'react';
import {AppState, withAppContext} from "../models";
import {Button, Callout, Card,} from "@blueprintjs/core";
import {SignIn} from "./SignIn";
import {isUserLoggedIn} from "../services/firebase";
import {HousePropertyMeta} from "../services/houses";
import {IconNames} from "@blueprintjs/icons";
import {KeyPoints} from "./details/KeyPoints";

export interface StarredPropertiesProps {
    appContext: AppState;
}

const HousePreview: React.FC<{house: HousePropertyMeta, getFocus: () =>  void}> = ({house, getFocus}) => {
    return (
        <Card className={"house-preview"}>
            <div className={"header"}>
                <h4>{house.title}</h4>
                <div className={"controls"}>
                    <Button
                        minimal={true}
                        icon={IconNames.LOCATE}
                        onClick={getFocus}
                    />
                </div>
            </div>
            <div className={"summary"}>
                <div><img src={house.primary_image_url} width={100}/></div>
                <KeyPoints house={house} />
            </div>
        </Card>
    )
}

export class StarredPropertiesWithContext extends React.PureComponent<StarredPropertiesProps> {

    constructor(props: StarredPropertiesProps) {
        super(props);
    }

    render() {
        let content = <SignIn />
        if (isUserLoggedIn()) {
            content = (
                <div>
                    {this.props.appContext.favourites.map((house, index) => (
                        <HousePreview
                            key={index}
                            house={house}
                            getFocus={() => {
                                this.props.appContext.onHouseSelected(house);
                                this.props.appContext.onFocusPoint(house.location);
                            }}
                        />
                    ))}
                </div>
            );
            if (this.props.appContext.favourites.length === 0) {
                content = (
                    <div>
                        <Callout title={"Favourite some properties to have them show up here"}/>
                    </div>
                );
            }
        }

        return (
            <div className={"favourites"}>
                {content}
            </div>
        );
    }
}

export const StarredProperties = withAppContext(StarredPropertiesWithContext);