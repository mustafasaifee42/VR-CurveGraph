import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Graph from './Graph';
import 'aframe';
import 'aframe-animation-component';
import 'aframe-particle-system-component';
import 'babel-polyfill';
import {Entity, Scene} from 'aframe-react';
import data from './data.json';

class App extends Component {
  render() {
        return <Graph 
          width = {10}
          height = {10}
          depth = {10}
          xDomain = {[0,2*Math.PI]}
          zDomain = {[0,2*Math.PI]}
          xSteps = {50}
          zSteps = {50}
          colorScale = {true}
          opacity = {0.6}
          colorScaleValue = {['#ff0000','#00ff00']}
        />
  }
}

export default App;
