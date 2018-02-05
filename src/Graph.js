import React, { Component } from 'react';
import './App.css';
import { select } from 'd3-selection';
import { csv } from 'd3-request';
import * as d3 from 'd3';
import 'aframe';
import 'aframe-faceset-component';
import 'aframe-animation-component';
import 'aframe-particle-system-component';
import 'babel-polyfill';
import {Entity, Scene} from 'aframe-react';
import getGraphCoordinates from './utils/getGraphCoordinates';
import getGraphColor from './utils/getGraphColor';

let aframeExtrasTube = require("aframe-extras")
 
// Register everything.
aframeExtrasTube.registerAll();

class Graph extends Component {
   constructor(props){
      super(props)
      this.state = {
          width: (this.props.width == null ? 10 : this.props.width),
          height: (this.props.height == null ? 10 : this.props.height),
          depth: (this.props.depth == null ? 10 : this.props.depth),
          xDomain: (this.props.xDomain == null ? [0,10] : this.props.xDomain),
          zDomain: (this.props.zDomain == null ? [0,10] : this.props.zDomain),
          xSteps: (this.props.xSteps == null ? 1000 : this.props.xSteps),
          zSteps: (this.props.zSteps == null ? 1000 : this.props.zSteps),
          opacity: (this.props.opacity == null ? 1 : this.props.opacity),
          color: (this.props.color == null ? '#333' : this.props.color),
          colorScale: (this.props.colorScale == null ? false : this.props.colorScale),
          colorScaleValue: (this.props.colorScaleValue == null ? ['#ff0000','#00ff00'] : this.props.colorScaleValue),
      }
      this.createGraph = this.createGraph.bind(this)
    }
  componentDidUpdate() {
      this.createGraph()
    }
  componentDidMount() {
      this.createGraph()
    }
  createGraph(){
    let dataCoordinate = [], dataSphere = [];
    let xStep = (this.state.xDomain[1] - this.state.xDomain[0]) / this.state.xSteps;
    let zStep = (this.state.zDomain[1] - this.state.zDomain[0]) / this.state.zSteps;
    for (let i = 0; i < this.state.xSteps - 1; i++){
      for(let j = 0; j < this.state.zSteps - 1; j++){
        let tempData = [];
        tempData.push(this.state.xDomain[0] + xStep*i)
        tempData.push(getGraphCoordinates(this.state.xDomain[0] + xStep*i,this.state.zDomain[0] + zStep*j))
        tempData.push(this.state.zDomain[0] + zStep*j)
        tempData.push(this.state.xDomain[0] + xStep*(i+1))
        tempData.push(getGraphCoordinates(this.state.xDomain[0] + xStep*(i+1),this.state.zDomain[0] + zStep*j))
        tempData.push(this.state.zDomain[0] + zStep*j)
        tempData.push(this.state.xDomain[0] + xStep*(i+1))
        tempData.push(getGraphCoordinates(this.state.xDomain[0] + xStep*(i+1),this.state.zDomain[0] + zStep*(j+1)))
        tempData.push(this.state.zDomain[0] + zStep*(j+1))
        tempData.push(this.state.xDomain[0] + xStep*i)
        tempData.push(getGraphCoordinates(this.state.xDomain[0] + xStep*i,this.state.zDomain[0] + zStep*(j+1)))
        tempData.push(this.state.zDomain[0] + zStep*(j+1))
        tempData.push(getGraphColor(this.state.xDomain[0] + xStep*i,this.state.zDomain[0] + zStep*j))
        dataCoordinate.push(tempData);
      }
    }
    for (let i = 0; i < this.state.xSteps; i++){
      for(let j = 0; j < this.state.zSteps; j++){
        let tempData = [];
        tempData.push(this.state.xDomain[0] + xStep*i)
        tempData.push(getGraphCoordinates(this.state.xDomain[0] + xStep*i,this.state.zDomain[0] + zStep*j))
        tempData.push(this.state.zDomain[0] + zStep*j);
        dataSphere.push(tempData);
      }
    }
    let colorValue = d3.scaleLinear()
      .domain([d3.min(dataCoordinate, (d) =>  d[12]), d3.max(dataCoordinate, (d) =>  d[12])])
      .range(this.state.colorScaleValue);
    let xScale = d3.scaleLinear()
      .domain(this.state.xDomain)
      .range([0,this.state.width]);
    let zScale = d3.scaleLinear()
      .domain(this.state.zDomain)
      .range([0,this.state.depth]);
    let yScale = d3.scaleLinear()
      .domain([d3.min(dataSphere, (d) =>  d[1]),d3.max(dataSphere, (d) =>  d[1])])
      .range([0,this.state.height]);


    let xTick = [], yTick = [], zTick = [],n = 5;

    for (var i = 0; i <= n; i++) {
      let xDomain = (this.state.xDomain[1] - this.state.xDomain[0])/n
      let yDomain = (d3.max(dataSphere, (d) =>  d[1]) - d3.min(dataSphere, (d) =>  d[1]))/n
      let zDomain = (this.state.zDomain[1] - this.state.zDomain[0])/n
      xTick.push(this.state.xDomain[0] + i*xDomain);
      yTick.push(d3.min(dataSphere, (d) =>  d[1]) + i*yDomain);
      zTick.push(this.state.zDomain[0] + i*zDomain);
    }
    d3.selectAll('a-scene')
	      .selectAll('a-entity.xTick')
        .data(xTick)
        .enter()
        .append("a-entity")
        .attr('class','xTick')
        .attr("line", (d,i) => {
          return `start: ${xScale(d)}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(this.state.zDomain[1])}; end: ${xScale(d)}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(this.state.zDomain[1]) + 0.25}; color: #000; opacity: 1`
        });
    d3.selectAll('a-scene')
	      .selectAll('a-entity.xTickText')
        .data(xTick)
        .enter()
        .append("a-entity")
        .attr('class','xTickText')
        .attr("text", d => `value: ${d.toFixed(2)}; anchor: left; width: 5; color: black`)
        .attr("material",'color:#000')
        .attr("position", d => `${xScale(d)}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(this.state.zDomain[1]) + 0.3}`)
    d3.selectAll('a-scene')
	      .selectAll('a-entity.yTick')
        .data(yTick)
        .enter()
        .append("a-entity")
        .attr('class','yTick')
        .attr("line", (d,i) => {
          return `start: ${xScale(this.state.xDomain[0])}, ${yScale(d)}, ${zScale(this.state.zDomain[1])}; end: ${xScale(this.state.xDomain[0])}, ${yScale(d)}, ${zScale(this.state.zDomain[1]) + 0.25}; color: #000; opacity: 1`
        })
    d3.selectAll('a-scene')
	      .selectAll('a-entity.yTickText')
        .data(yTick)
        .enter()
        .append("a-entity")
        .attr('class','yTickText')
        .attr("text", d => `value: ${d.toFixed(2)}; anchor: left; width: 5; color: black`)
        .attr("material",'color:#000')
        .attr("position", d => `${xScale(this.state.xDomain[0])}, ${yScale(d) + 0.15}, ${zScale(this.state.zDomain[1]) + 0.6}`)
        .attr('rotation','0 90 0')
    d3.selectAll('a-scene')
	      .selectAll('a-entity.zTick')
        .data(zTick)
        .enter()
        .append("a-entity")
        .attr('class','zTick')
        .attr("line", (d,i) => {
          return `start: ${xScale(this.state.xDomain[1])}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(d)}; end: ${xScale(this.state.xDomain[1]) + 0.25}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(d)}; color: #000; opacity: 1`
        })
    d3.selectAll('a-scene')
	      .selectAll('a-entity.zTickText')
        .data(zTick)
        .enter()
        .append("a-entity")
        .attr('class','zTickText')
        .attr("text", d => `value: ${d.toFixed(2)}; anchor: left; width: 5; color: black`)
        .attr("material",'color:#000')
        .attr("position", d => `${xScale(this.state.xDomain[1]) + 0.1}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(d) - 0.2}`)
    
    
    //Drawing Axes Box
    

    d3.selectAll('a-scene')
            .append("a-entity")
            .attr('class','links')
            .attr("line", `start: ${xScale(this.state.xDomain[0])}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(this.state.zDomain[0])}; end: ${xScale(this.state.xDomain[0])}, ${yScale(d3.max(dataSphere, (d) =>  d[1])) + 0.1}, ${zScale(this.state.zDomain[0])}; color: #000`)
    d3.selectAll('a-scene')
            .append("a-entity")
            .attr('class','links')
            .attr("line", `start: ${xScale(this.state.xDomain[0])}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(this.state.zDomain[0])}; end: ${xScale(this.state.xDomain[1]) + 0.1}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(this.state.zDomain[0])}; color: #000`)
    d3.selectAll('a-scene')
            .append("a-entity")
            .attr('class','links')
            .attr("line", `start: ${xScale(this.state.xDomain[0])}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(this.state.zDomain[0])}; end: ${xScale(this.state.xDomain[0])}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(this.state.zDomain[1]) + 0.1}; color: #000`)
    d3.selectAll('a-scene')
            .append("a-entity")
            .attr('class','links')
            .attr("line", `start: ${xScale(this.state.xDomain[1]) + 0.1}, ${yScale(d3.max(dataSphere, (d) =>  d[1])) + 0.1}, ${zScale(this.state.zDomain[0])}; end: ${xScale(this.state.xDomain[0])}, ${yScale(d3.max(dataSphere, (d) =>  d[1])) + 0.1}, ${zScale(this.state.zDomain[0])}; color: #000`)
    d3.selectAll('a-scene')
            .append("a-entity")
            .attr('class','links')
            .attr("line", `start: ${xScale(this.state.xDomain[1]) + 0.1}, ${yScale(d3.max(dataSphere, (d) =>  d[1])) + 0.1}, ${zScale(this.state.zDomain[0])}; end: ${xScale(this.state.xDomain[1]) + 0.1}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(this.state.zDomain[0])}; color: #000`)
    d3.selectAll('a-scene')
            .append("a-entity")
            .attr('class','links')
            .attr("line", `start: ${xScale(this.state.xDomain[0])}, ${yScale(d3.max(dataSphere, (d) =>  d[1])) + 0.1}, ${zScale(this.state.zDomain[1]) + 0.1}; end: ${xScale(this.state.xDomain[0])}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(this.state.zDomain[1]) + 0.1}; color: #000`)
    d3.selectAll('a-scene')
            .append("a-entity")
            .attr('class','links')
            .attr("line", `start: ${xScale(this.state.xDomain[0])}, ${yScale(d3.max(dataSphere, (d) =>  d[1])) + 0.1}, ${zScale(this.state.zDomain[1]) + 0.1}; end: ${xScale(this.state.xDomain[0])}, ${yScale(d3.max(dataSphere, (d) =>  d[1])) + 0.1}, ${zScale(this.state.zDomain[0])}; color: #000`)
    d3.selectAll('a-scene')
            .append("a-entity")
            .attr('class','links')
            .attr("line", `start: ${xScale(this.state.xDomain[0])}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(this.state.zDomain[1]) + 0.1}; end: ${xScale(this.state.xDomain[1]) + 0.1}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(this.state.zDomain[1]) + 0.1}; color: #000`)
    d3.selectAll('a-scene')
            .append("a-entity")
            .attr('class','links')
            .attr("line", `start: ${xScale(this.state.xDomain[1]) + 0.1}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(this.state.zDomain[0])}; end: ${xScale(this.state.xDomain[1]) + 0.1}, ${yScale(d3.min(dataSphere, (d) =>  d[1]))}, ${zScale(this.state.zDomain[1]) + 0.1}; color: #000`)

    
    d3.selectAll('a-scene')
	      .selectAll('a-entity.faceset')
        .data(dataCoordinate)
        .enter()
        .append("a-entity")
        .attr('class','faceset')
        .attr('faceset', d => `vertices: ${xScale(d[0])} ${yScale(d[1])} ${zScale(d[2])}, ${xScale(d[3])} ${yScale(d[4])} ${zScale(d[5])}, ${xScale(d[6])} ${yScale(d[7])} ${zScale(d[8])}, ${xScale(d[9])} ${yScale(d[10])} ${zScale(d[11])}`)
        .attr('material', d => {
          if(!this.state.colorScale)
            return `color: ${this.state.color}; side: double; opacity: ${this.state.opacity}`
          else {
            return `color: ${colorValue(d[12])}; side: double; opacity: ${this.state.opacity}`
          }
        });
        /*
    d3.selectAll('a-scene')
	      .selectAll('a-sphere.sphere')
        .data(dataSphere)
        .enter()
        .append("a-sphere")
        .attr('class','sphere')
        .attr('radius','0.01')
        .attr('position', d => `${d[0]} ${d[1]} ${d[2]}`)
        .attr('color', '#000');
    */
  }
  
  render() {

  return (
      <Scene class = {'scene'} ref={node => this.node = node}>
        <a-assets>
          <img id="groundTexture" src="https://cdn.aframe.io/a-painter/images/floor.jpg"/>
          <img id="skyTexture" src="https://cdn.aframe.io/a-painter/images/sky.jpg"/>
        </a-assets>
        <Entity primitive="a-sky" color='#fafafa' height="100" width="100" />
        <Entity primitive="a-camera" position="10 0 20" rotation='0 15 0'>
          <Entity primitive="a-cursor" animation__click={{property: 'scale', startEvents: 'click', from: '0.1 0.1 0.1', to: '1 1 1', dur: 15000}}/>
        </Entity>
      </Scene>
    )
  }
}
export default Graph
