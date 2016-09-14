import React, { Component } from 'react';
import seedrandom from 'seedrandom'

import './App.css';
import logo from './logo.png'

class BezierRainbow extends Component {
  static defaultProps = {
    dashSize: 1,
    dashSpaceSize: 0,
    lineWidth: 1,
    numLines: 10,
    height: 500,
    ratioUpFirst: 0.5,
    seed: 1,
    width: 1000,
    xVariance: 0.1,
    startVariance: 0.5,
    yVariance: 0.5,
  }

  _getMinY = () => {
    const { height, startVariance } = this.props
    return Math.floor(height / 2 + startVariance * height / 2)
  }

  _getUpFirst = (entropy) => {
    const { seed, ratioUpFirst } = this.props

    return Math.floor(seedrandom(seed + entropy)() + ratioUpFirst)
  }

  _getStartX = () => {
    return 0
  }

  _getStartY = (min, max, entropy) => {
    const { seed } = this.props
    return Math.floor(seedrandom(seed + entropy)() * (max - min) + min)
  }

  _getEndX = () => {
    return this.props.width
  }

  _getEndY = (min, max, startY, entropy) => {
    const { seed } = this.props
    return Math.floor(seedrandom(seed + entropy)() * (max - min) + min)
  }

  _getCP1X = (entropy) => {
    const { seed, width, xVariance } = this.props
    return (
      width / 3 +
      [-1, 1][Math.floor(seedrandom(seed + entropy)() + 0.5)] *
      seedrandom(seed + entropy * 2)() * width * xVariance
    )
  }

  _getCP1Y = (upFirst, startY, minPointY, entropy) => {
    const { seed, height, yVariance } = this.props
    const val = upFirst ?
      startY - seedrandom(seed + entropy)() * height * 2 * yVariance
    : startY + seedrandom(seed + entropy)() * height * 2 * yVariance
    return Math.max(0, Math.min(height, val))
  }

  _getCP2X = (entropy) => {
    const { seed, width, xVariance } = this.props
    return (
      width / 3 * 2 +
      [-1, 1][Math.floor(seedrandom(seed + entropy)() + 0.5)] *
      seedrandom(seed + entropy * 2)() * width * xVariance
    )
  }

  _getCP2Y = (upFirst, endY, minPointY, entropy) => {
    const { seed, height, yVariance } = this.props
    const val = upFirst ?
      endY + seedrandom(seed + entropy)() * height * 2 * yVariance
    : endY - seedrandom(seed + entropy)() * height * 2 * yVariance
    return Math.max(0, Math.min(height, val))
  }

  setLines = () => {
    const {
      dashSize,
      dashSpaceSize,
      height,
      lineWidth,
      numLines,
      width,
      seed,
    } = this.props

    const entropyScalar = 2345676789
    const entropy = Math.floor(seedrandom(seed)() * entropyScalar)
    const ctx = this.canvas.getContext('2d')

    // Clear the canvas
    ctx.clearRect(0, 0, width, height)

    // Set the line properties
    ctx.setLineDash([dashSize, dashSpaceSize]);
    ctx.lineWidth = lineWidth;

    // Draw the lines
    for (let i=0; i < numLines; i++) {
      ctx.beginPath();

      // Give y values a buffer
      const minPointY = this._getMinY()
      const maxPointY = height - minPointY

      // Calculate curve direction
      const upFirst = this._getUpFirst(i * entropy)

      // Set the starting position
      const startX = this._getStartX()
      const startY = this._getStartY(minPointY, maxPointY, i * entropy * 2)

      // Set the ending position
      const endX = this._getEndX()
      const endY = this._getEndY(minPointY, maxPointY, startY, i * entropy * 3)

      // Set the first control point values
      const cp1X = this._getCP1X(i * entropy * 4)
      const cp1Y = this._getCP1Y(upFirst, startY, minPointY, i + entropy * 5)

      // Set the second control point values
      const cp2X = this._getCP2X(i * entropy * 5)
      const cp2Y = this._getCP2Y(upFirst, endY, minPointY, i * entropy * 9)

      // Make the curve
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);

      // Set the color
      const center = 200;
      const w = 80;
      const frequency = Math.PI * 2 / numLines;
      const red = Math.floor(Math.sin(frequency * i + 2) * w + center)
      const green = Math.floor(Math.sin(frequency * i + 0) * w + center)
      const blue = Math.floor(Math.sin(frequency * i + 4) * w + center)
      ctx.strokeStyle = `rgb(${red}, ${green}, ${blue})`
      ctx.stroke();
    }
  }

  componentDidMount() {
    this.setLines()
  }

  componentDidUpdate() {
    this.setLines()
  }

  render() {
    const { height, width } = this.props
    return (
      <canvas
        height={height}
        width={width}
        className="bezier-rainbow"
        ref={c => this.canvas = c}
    />
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      dashSize: 1,
      dashSpaceSize: 0,
      height: 500,
      lineWidth: 3,
      numLines: 30,
      ratioUpFirst: 0.5,
      seed: 1,
      width: 1000,
      xVariance: 0.1,
      startVariance: 0.5,
      yVariance: 0.5,
      nightModeOn: false,
    }
  }

  valueUpdater = (key) => {
    return (value) => {
      this.setState({ [key]: value })
    }
  }

  render() {
    const {
      dashSize,
      dashSpaceSize,
      height,
      lineWidth,
      nightModeOn,
      numLines,
      ratioUpFirst,
      seed,
      width,
      xVariance,
      startVariance,
      yVariance,
    } = this.state

    return (
      <div className="App">
        <div className="controls-container">
          <div className="controls">
            <img className="logo" src={logo} alt="logo" />
            <h4 className="controls-header">Controls</h4>
            <div className="canvas-control">
              Height <span className="control-value">{height}px</span>
              <input
                  value={height}
                  type="range"
                  name="height"
                  min="20"
                  max="700"
                  onChange={(e) => this.valueUpdater('height')(e.target.value)}
              />
            </div>
            <div className="canvas-control">
              Width <span className="control-value">{width}px</span>
              <input
                  value={width}
                  type="range"
                  name="width"
                  min="20"
                  max="1275"
                  onChange={(e) => this.valueUpdater('width')(e.target.value)}
              />
            </div>
            <div className="canvas-control">
              Seed <span className="control-value">{seed}</span>
              <input
                  value={seed}
                  type="range"
                  name="seed"
                  min="1"
                  max="300"
                  onChange={(e) => this.valueUpdater('seed')(e.target.value)}
              />
            </div>
            <div className="canvas-control">
              Number of Lines <span className="control-value">{numLines}</span>
              <input
                  value={numLines}
                  type="range"
                  name="num-lines"
                  min="1"
                  max="300"
                  onChange={(e) => this.valueUpdater('numLines')(e.target.value)}
              />
            </div>
            <div className="canvas-control">
              Start &amp; end variance <span className="control-value">{ratioUpFirst * 100}%</span>
              <input
                  value={startVariance}
                  type="range"
                  name="num-lines"
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(e) => this.valueUpdater('startVariance')(e.target.value)}
              />
            </div>
            <div className="canvas-control">
              X Variance <span className="control-value">{xVariance * 100}%</span>
              <input
                  value={xVariance}
                  type="range"
                  name="ratio-up-first"
                  min="0"
                  max="1"
                  step=".01"
                  onChange={(e) => this.valueUpdater('xVariance')(e.target.value)}
              />
            </div>
            <div className="canvas-control">
              Y Variance <span className="control-value">{yVariance * 100}%</span>
              <input
                  value={yVariance}
                  type="range"
                  name="ratio-up-first"
                  min="0"
                  max="1"
                  step=".01"
                  onChange={(e) => this.valueUpdater('yVariance')(e.target.value)}
              />
            </div>
            <div className="canvas-control">
              Ratio curving up first <span className="control-value">{ratioUpFirst * 100}%</span>
              <input
                  value={ratioUpFirst}
                  type="range"
                  name="ratio-up-first"
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={(e) => this.valueUpdater('ratioUpFirst')(e.target.value)}
              />
            </div>
            <div className="canvas-control">
              Dash Space Size <span className="control-value">{dashSpaceSize}px</span>
              <input
                  value={dashSpaceSize}
                  type="range"
                  name="dash-space-size"
                  min="0"
                  max="10"
                  onChange={(e) => this.valueUpdater('dashSpaceSize')(e.target.value)}
              />
            </div>
            <div className="canvas-control">
              Dash Size <span className="control-value">{dashSize}px</span>
              <input
                  value={dashSize}
                  type="range"
                  name="dash-size"
                  min="1"
                  max="10"
                  onChange={(e) => this.valueUpdater('dashSize')(e.target.value)}
              />
            </div>
            <div className="canvas-control">
              Line Width <span className="control-value">{lineWidth}px</span>
              <input
                  value={lineWidth}
                  type="range"
                  name="line-width"
                  min="1"
                  max="15"
                  onChange={(e) => this.valueUpdater('lineWidth')(e.target.value)}
              />
            </div>
            <div className="canvas-control">
              Night mode
              <span className="control-value">
                {nightModeOn ? 'on' : 'off'}
                <input
                    value={nightModeOn}
                    type="checkbox"
                    name="night-mode"
                    onChange={(e) => this.valueUpdater('nightModeOn')(!nightModeOn)}
                />
              </span>
            </div>
          </div>
        </div>
        <div className={`canvas-container${nightModeOn ? ' canvas-container__dark' : ''}`}>
          <BezierRainbow
              dashSize={dashSize}
              dashSpaceSize={dashSpaceSize}
              height={height}
              lineWidth={lineWidth}
              numLines={numLines}
              ratioUpFirst={Number(ratioUpFirst)}
              seed={seed}
              width={width}
              xVariance={xVariance}
              startVariance={startVariance}
              yVariance={yVariance}
          />
        </div>
      </div>
    );
  }
}

export default App;
