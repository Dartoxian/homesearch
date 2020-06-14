import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'normalize.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});


import './main.scss';
import {HomesearchMap} from "./components/Map";

ReactDOM.render((
    <div>
        <HomesearchMap/>
    </div>
), document.getElementById('root'));