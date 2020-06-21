import React from "react";
import firebase from "firebase";
import {HousePropertyMeta} from "./services/houses";
import {Point} from "geojson";


export interface AppState {
    user: firebase.User | null;
    favourites: HousePropertyMeta[];
    selectedHouse?: HousePropertyMeta;
    focusPoint?: Point;

    onUpdateFavourites: (newFavourites: HousePropertyMeta[]) => void;
    onHouseSelected: (selectedHouse?: HousePropertyMeta) => void;
    onFocusPoint: (focusPoint?: Point) => void;
}

export const AppContext = React.createContext<AppState>({
    user: null, favourites: [], onUpdateFavourites: () => {}, onHouseSelected: () => {},
    onFocusPoint: () => {},
});

export const withAppContext = (component: React.ComponentClass) => {
    return (props) => (
        <AppContext.Consumer>
            {(context) => React.createElement(component, {...props, appContext: context})}
        </AppContext.Consumer>
    );
}