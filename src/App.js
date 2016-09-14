import React, { Component } from 'react';
import seedrandom from 'seedrandom'

import './App.css';

class BezierRainbow extends Component {
  static defaultProps = {
    dashSize: 1,
    dashSpaceSize: 1,
    numLines: 5,
    height: 500,
    ratioUpFirst: 0.5,
    seed: 1,
    width: 1275,
    xVariance: 0.5,
    yBufferDivisor: 20,
    yVariance: 0.5,
  }

  _getMinY = () => {
    const { height, yBufferDivisor } = this.props
    return Math.floor(height / yBufferDivisor)
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
    const { seed, width,xVariance } = this.props
    return (
      width / 3 * 2 +
      [-1, 1][Math.floor(seedrandom(seed + entropy)() + 0.5)] *
      seedrandom(seed + entropy * 2)() * width * xVariance
    )
  }

  _getCP2Y = (upFirst, endY, minPointY, entropy) => {
    const { seed, height, yVariance } = this.props
    const val = upFirst ?
      endY + seedrandom(seed + entropy)() * height * yVariance
    : endY - seedrandom(seed + entropy)() * height * yVariance
    return Math.max(0, Math.min(height, val))
  }

  setLines = () => {
    const {
      dashSize,
      dashSpaceSize,
      height,
      numLines,
      width,
      seed,
    } = this.props

    const entropyScalar = 2345676789
    const entropy = Math.floor(seedrandom(seed)() * entropyScalar)
    const ctx = this.canvas.getContext('2d')

    // Clear the canvas
    ctx.clearRect(0, 0, width, height)

    // Set the line dash
    ctx.setLineDash([dashSize, dashSpaceSize]);

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
      const endY = this._getStartY(minPointY, maxPointY, startY, i * entropy * 3)

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
      dashSize: 5,
      dashSpaceSize: 5,
      height: 500,
      numLines: 30,
      ratioUpFirst: 0.5,
      seed: 1,
      width: 1275,
      xVariance: 0.5,
      yBufferDivisor: 20,
      yVariance: 0.5,
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
      numLines,
      ratioUpFirst,
      seed,
      width,
      xVariance,
      yBufferDivisor,
      yVariance,
    } = this.state

    return (
      <div className="App">
        <div>
          Height: <input
              value={height}
              type="range"
              name="height"
              min="20"
              max="700"
              onChange={(e) => this.valueUpdater('height')(e.target.value)}
          />
          {height}px
        </div>
        <div>
          Width: <input
              value={width}
              type="range"
              name="width"
              min="20"
              max="1275"
              onChange={(e) => this.valueUpdater('width')(e.target.value)}
          />
          {width}px
        </div>
        <div>
          Seed: <input
              value={seed}
              type="range"
              name="seed"
              min="1"
              max="300"
              onChange={(e) => this.valueUpdater('seed')(e.target.value)}
          />
          {seed}
        </div>
        <div>
          Number of Lines: <input
              value={numLines}
              type="range"
              name="num-lines"
              min="1"
              max="300"
              onChange={(e) => this.valueUpdater('numLines')(e.target.value)}
          />
          {numLines} lines
        </div>
        <div>
          Y buffer divisor: <input
              value={yBufferDivisor}
              type="range"
              name="num-lines"
              min={1}
              max={15}
              step={0.5}
              onChange={(e) => this.valueUpdater('yBufferDivisor')(e.target.value)}
          />
          {yBufferDivisor}
        </div>
        <div>
          Dash Space Size: <input
              value={dashSpaceSize}
              type="range"
              name="dash-space-size"
              min="0"
              max="10"
              onChange={(e) => this.valueUpdater('dashSpaceSize')(e.target.value)}
          />
          {dashSpaceSize}px
        </div>
        <div>
          Dash Size: <input
              value={dashSize}
              type="range"
              name="dash-size"
              min="1"
              max="10"
              onChange={(e) => this.valueUpdater('dashSize')(e.target.value)}
          />
          {dashSize}px
        </div>
        <div>
          Ratio up first: <input
              value={ratioUpFirst}
              type="range"
              name="ratio-up-first"
              min={0}
              max={1}
              step={0.1}
              onChange={(e) => this.valueUpdater('ratioUpFirst')(e.target.value)}
          />
          {ratioUpFirst * 100}%
        </div>
        <div>
          X Variance: <input
              value={xVariance}
              type="range"
              name="ratio-up-first"
              min="0"
              max="1"
              step=".01"
              onChange={(e) => this.valueUpdater('xVariance')(e.target.value)}
          />
          {xVariance * 100}%
        </div>
        <div>
          Y Variance: <input
              value={yVariance}
              type="range"
              name="ratio-up-first"
              min="0"
              max="1"
              step=".01"
              onChange={(e) => this.valueUpdater('yVariance')(e.target.value)}
          />
          {yVariance * 100}%
        </div>
        <BezierRainbow
            dashSize={dashSize}
            dashSpaceSize={dashSpaceSize}
            height={height}
            numLines={numLines}
            ratioUpFirst={Number(ratioUpFirst)}
            seed={seed}
            width={width}
            xVariance={xVariance}
            yBufferDivisor={yBufferDivisor}
            yVariance={yVariance}
        />
      </div>
    );
  }
}

export default App;
