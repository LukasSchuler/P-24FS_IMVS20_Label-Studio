// Copyright (c) 2024 FHNW, licensed under MIT License
// Based on ../Waveform/Waveform.js
import React, { Component } from 'react';
import SpectrogramPlugin from "wavesurfer.js/dist/plugins/spectrogram.esm";
import WaveSurfer from 'wavesurfer.js';
import {onSnapshot} from "mobx-state-tree";

export default class SpectrogramView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playbackSpeed: 0.1,
      zoomLevel: 1000,
      spec_plugin: null,
      isDrawing: false,
      maxFreq: 125000,
    };
    this.wsRef = React.createRef();
  }

  componentDidMount() {
    const colormap = require('colormap');
    const colors = colormap({
      colormap: 'hot',
      nshades: 256,
      format: 'float',
      alpha: 1,
    });

    this.spec_plugin = SpectrogramPlugin.create({
      labels: true,
      labelsColor: "white",
      labelsHzColor: "white",
      height: 512,
      splitChannels: false,
      colorMap: colors,
      frequencyMin: 0,
      frequencyMax: this.maxFreq,
      fftSamples: 1024,
    });

    this.wavesurfer = WaveSurfer.create({
      container: this.wsRef.current,
      waveColor: 'rgb(255, 255, 255)',
      progressColor: 'rgb(255, 255, 255)',
      url: this.props.src,
      mediaControls: true,
      sampleRate: 250000,
      splitChannels: false,
      height: 0,
      plugins: [
        this.spec_plugin
      ],
    });

    this.spec_canvas = this.spec_plugin.canvas;
    this.overlay_canvas = document.createElement('canvas');
    this.overlay_canvas.style.position = 'absolute';
    this.overlay_canvas.style.top = '0';
    this.overlay_canvas.style.left = '0';
    this.overlay_canvas.style.width = '100%';
    this.overlay_canvas.style.height = '100%';
    this.overlay_canvas.style.zIndex = '5';
    this.spec_canvas.parentElement.appendChild(this.overlay_canvas);

    this.overlay_canvas.addEventListener('mousedown', this.startDrawing);
    this.overlay_canvas.addEventListener('mouseup', this.draw);

    this.wavesurfer.on('ready', () => {
      this.wavesurfer.zoom(this.state.zoomLevel);
      this.overlay_canvas.width = this.spec_canvas.width;
      this.overlay_canvas.height = this.spec_canvas.height;
      this.props.setCanvas(this.overlay_canvas);
      this.props.setDuration(this.wavesurfer.getDuration());
      this.drawRegions(this.props.regions);
    });
    this.wavesurfer.on('init', () => {
      this.props.setFreqMin(this.spec_plugin.frequencyMin);
      this.props.setFreqMax(this.spec_plugin.frequencyMax);
    });
  }

  startDrawing = (event) => {
    const boundingRect = this.overlay_canvas.getBoundingClientRect();
    this.startX = event.clientX - boundingRect.left;
    this.startY = event.clientY - boundingRect.top;

    this.setState({ isDrawing: true });
  };
  draw = (event) => {
    const states = this.props.item.activeStates();
    if (states.length === 0) return;
    if (!this.state.isDrawing) return;

     const canvas = this.overlay_canvas;
     const boundingRect = canvas.getBoundingClientRect();
     const x = event.clientX - boundingRect.left;
     const y = event.clientY - boundingRect.top;

    this.props.finishDrawing(this.startX, this.startY, x - this.startX, y - this.startY);
    this.setState({ isDrawing: false });
  };

  drawRegions = (regions) => {
    this.props.addRectangles(regions);
    const ctx = this.overlay_canvas.getContext('2d');
    ctx.clearRect(0, 0, this.overlay_canvas.width, this.overlay_canvas.height);
    const lineInterval = this.overlay_canvas.height * 25000 / this.state.maxFreq;
    for (let y = 0; y < this.overlay_canvas.height; y += lineInterval) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.strokeRect(0, y, this.overlay_canvas.width, 0);
    }
    this.props.getRectangles().forEach((rect) => {
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeStyle = rect.color;
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.width, rect.height);
      ctx.fill();
      ctx.stroke();
    });
  };

  regionObserver =onSnapshot(this.props.item.annotation, () => {
    this.drawRegions(this.props.regions);
    this.scrollToSelectedRegion();
  });

  scrollToSelectedRegion = () => {
    let currentRegion = null;

    this.props.item.annotation.areas.forEach((area) => {
      if(area.highlighted) {
        currentRegion = area;
      }
      if (currentRegion) {
        this.wavesurfer.setScrollTime(currentRegion.start - 0.5);
      }
    });
  };

  handleSpeedChange = (event) => {
    const newSpeed = parseFloat(event.target.value);
    this.setState({ playbackSpeed: newSpeed });
    if (this.wavesurfer) {
      this.wavesurfer.setPlaybackRate(newSpeed, false);
    }
  };

  handleZoomIn = () => {
    const newZoomLevel = this.state.zoomLevel + 250;
    this.setState({ zoomLevel: newZoomLevel });
    if (this.wavesurfer) {
      this.wavesurfer.zoom(newZoomLevel);
    }
  };

  handleZoomOut = () => {
    const newZoomLevel = this.state.zoomLevel - 50;
    this.setState({ zoomLevel: newZoomLevel < 0 ? 0 : newZoomLevel });
    if (this.wavesurfer) {
      this.wavesurfer.zoom(newZoomLevel);
    }
  };

  render() {
    const { playbackSpeed, zoomLevel } = this.state;
    return (
      <div>
        <div id="wave" ref={this.wsRef} style={{ cursor: 'crosshair' }} />
        <div style={{ display: 'flex' }}>
          <div>
            <div>
              <div>
                <span>Playback Speed</span>
              </div>
              <span>{playbackSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={playbackSpeed}
              onChange={this.handleSpeedChange}
              onInput={this.handleSpeedChange}
            />
          </div>

          <div style={{ marginLeft: '200px' }}>
            <div>
              <span>Zoom</span>
            </div>
            <span>{zoomLevel}%</span>
            <div>
              <button onClick={this.handleZoomOut} style={{ marginRight: '5px' }}>-</button>
              <button onClick={this.handleZoomIn}>+</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

