import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'normalize.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import 'mapbox-gl/dist/mapbox-gl.css'


import './main.scss';
import {HomesearchMap} from "./components/Map";
import {initializeFirebase} from "./services/firebase";
import ReactGA from 'react-ga';
import {AppContext, AppState} from "./models";
import {useEffect, useState} from "react";
import * as firebase from 'firebase/app';
import 'firebase/auth';
import {getFavourites} from "./services/users";

ReactGA.initialize('UA-170171680-1');
ReactGA.pageview(window.location.pathname + window.location.search);

const App = () => {
    const [appState, dispatch] = useState<AppState>({
        user: null,
        favourites: [],
        onUpdateFavourites: favourites => dispatch(state => ({...state, favourites})),
        onHouseSelected: selectedHouse => dispatch(state => ({...state, selectedHouse})),
        onFocusPoint: focusPoint => dispatch(state => ({...state, focusPoint}))
    });
    useEffect(() => {
        firebase.auth().onAuthStateChanged((user) => {
            dispatch((state) => ({...state, user}))
        });
        getFavourites().then((favourites) => dispatch(state => ({...state, favourites})));
    }, []);

    return (
        <AppContext.Provider value={appState}>
            <HomesearchMap/>
        </AppContext.Provider>
    )
}

initializeFirebase().then(() => {
    ReactDOM.render((
        <div>
            <App/>
        </div>
    ), document.getElementById('root'));
});

