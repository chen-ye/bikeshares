/* global window, document */
import Rebase from 're-base';
import * as firebase from 'firebase';
import 'firebase/firestore';

import Lazy from 'lazy.js'

import React, {Component} from 'react';
import {render} from 'react-dom';

import Select from 'react-select';
import 'react-select/dist/react-select.css';

import MapGL, {FlyToInterpolator} from './react-map-gl';
import DeckGL, {PathLayer, ScatterplotLayer} from 'deck.gl';

import styles from './app.css';

const MAPBOX_TOKEN = ''; // Set your mapbox token here

const firebaseConfig = {
  apiKey: "AIzaSyAbu-hEkqh2PyaK1c078EUF-cuQ5VwBPnQ",
  authDomain: "bikeshares-37de2.firebaseapp.com",
  databaseURL: "https://bikeshares-37de2.firebaseio.com",
  projectId: "bikeshares-37de2",
  storageBucket: "bikeshares-37de2.appspot.com",
  messagingSenderId: "538370144257"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const base = Rebase.createClass(db);

const polylineDecode = function(str, precision) {
  var index = 0,
      lat = 0,
      lng = 0,
      coordinates = [],
      shift = 0,
      result = 0,
      byte = null,
      latitude_change,
      longitude_change,
      factor = Math.pow(10, precision || 6);

  // Coordinates have variable length when encoded, so just keep
  // track of whether we've hit the end of the string. In each
  // loop iteration, a single coordinate is decoded.
  while (index < str.length) {

      // Reset shift, result, and byte
      byte = null;
      shift = 0;
      result = 0;

      do {
          byte = str.charCodeAt(index++) - 63;
          result |= (byte & 0x1f) << shift;
          shift += 5;
      } while (byte >= 0x20);

      latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

      shift = result = 0;

      do {
          byte = str.charCodeAt(index++) - 63;
          result |= (byte & 0x1f) << shift;
          shift += 5;
      } while (byte >= 0x20);

      longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

      lat += latitude_change;
      lng += longitude_change;

      coordinates.push([lng / factor, lat / factor]);
  }

  return coordinates;
};

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      networkId: "hubway",
    };
    
    this.handleNetworkChange = this.handleNetworkChange.bind(this);
    
    this.hydrate();
  }
  
  hydrate(networkId) {
    if(this.networkBinding) {
      base.removeBinding(this.networkBinding)
    }
    
    const networksRef = db.collection("networks");
    this.networkBinding = base.bindCollection(networksRef, {
      context: this,
      state: 'networks',
      then: () => {
        console.log(this.state);
        
      }
    });
  }
  
  handleNetworkChange(newOption) {
    console.log(newOption);
    this.setState({
      networkId: newOption.value,
    })
  }

  render() {
    return (
      <div>
        <NetworkMap networkId={this.state.networkId}></NetworkMap>
        <div id="uiOverlay">
          <Select
            id="networkSelect"
            name="networkSelect"
            value={
              // this.state.selectedNetwork.id
              this.state.networkId
            }
            onChange={this.handleNetworkChange}
            options={
              [{label: "Hubway", value: "hubway"}, {label: "Divvy", value: "divvy"}, {label: "Biketown", value: "biketown"}, {label: "Capital Bikeshare", value: "capital-bikeshare"}]
              // this.state.networks
            }
            />
          </div>
      </div>
    );
  }
}

const defaultViewport = {
  latitude: 42.358056,
  longitude: -71.063611,
  zoom: 12.5,
  bearing: 0,
  pitch: 0,
  width: window.innerWidth,
  height: window.innerHeight
}

class NetworkMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: defaultViewport,
    };
    
    this.hydrate(this.props.networkId);
    
    this.resizeViewport = this.resizeViewport.bind(this);
    
    window.addEventListener("resize", this.resizeViewport, false);
  }
  
  componentWillReceiveProps(nextProps) {
    if(nextProps.networkId !== this.props.networkId) {
      this.hydrate(nextProps.networkId);
    }
  }
  
  updateViewport(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }
  
  resizeViewport() {
    this.updateViewport({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }
  
  goToViewport({longitude, latitude}) {
    this.updateViewport({
      longitude,
      latitude,
      zoome: 12.5,
      bearing: 0,
      pitch: 0,
      transitionInterpolator: new FlyToInterpolator(),
      transitionDuration: 3000
    })
  }
  
  hydrate(networkId) {
    if(this.networkBinding) {
      base.removeBinding(this.networkBinding)
    }
    if(this.routesBinding) {
      base.removeBinding(this.routesBinding)
    }
    if(this.stationsBinding) {
      base.removeBinding(this.stationsBinding)
    }
    
    const networkRef = db.collection("networks").doc(networkId);
    const stationsRef = networkRef.collection("stations");
    const routesRef = networkRef.collection("routes");
    
    this.networkBinding = base.bindDoc(networkRef, {
      context: this,
      state: 'network',
      // then: () => {
      //   console.log(this.state);
      //   this.goToViewport({
      //     latitude: this.state.network.location.latitude,
      //     longitude: this.state.network.location.longitude,
      //   });
      // }
    });
    
    this.routesBinding = base.bindCollection(routesRef, {
      context: this,
      state: 'routes',
      query: (ref) => {
        // .where("hasShape", "==", true)
        return ref.orderBy("frequency", "desc").limit(5000);
      },
      then: () => {
        console.log(this.state);
        this.goToViewport({
          latitude: this.state.network.location.latitude,
          longitude: this.state.network.location.longitude,
        });
      }
    });
    
    this.stationsBinding = base.bindCollection(stationsRef, {
      context: this,
      state: 'stations',
    });
  }

  render() {

    const {viewport, routes, stations} = this.state;
    
    const filteredRoutes = Lazy(routes).filter((route) => route.shape).toArray();
    
    const routeLayer = new PathLayer({
      id: 'routes', 
      data: filteredRoutes, 
      getPath: (route) => {
        return route.shape ? polylineDecode(route.shape) : [];
      },
      getColor: (route) => {
        return [255, 255, 255, Math.round(route.frequency / 100)];
      },
      getWidth: (route) => {
        return 6;
      }
    });
    
    const stationLayer = new ScatterplotLayer({
      id: 'stations',
      data: stations,
      getPosition: (station) => [station.longitude, station.latitude],
      getRadius: (station) => 9,
      getColor: (station) => {
        return [255, 255, 255, Math.round(station.free_bikes / 20 * 255)];
      },
    })

    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/blasternt/cjavw66n00nxk2spgrcwozlzk"
        onViewportChange={v => this.setState({viewport: v})}
        preventStyleDiffing={false}
        mapboxApiAccessToken={MAPBOX_TOKEN}>
        <DeckGL {...viewport} layers={[
          routeLayer,
          stationLayer,
        ]} />
      </MapGL>
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);
render(<Root />, root);