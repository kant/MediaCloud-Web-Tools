import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router'

import MediaMeterAppComponent from './components/App';
import AboutComponent from './components/About'

var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={MediaMeterAppComponent}/>
    <Route path="/about" component={AboutComponent}/>
  </Router>
), document.getElementById('app'))
