import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'normalize.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import 'mapbox-gl/dist/mapbox-gl.css'


import './main.scss';
import {HomesearchMap} from "./components/Map";

ReactDOM.render((
    <div>
        <HomesearchMap/>
    </div>
), document.getElementById('root'));