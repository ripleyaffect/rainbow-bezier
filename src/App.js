import qs from 'qs'
import Rainbow from 'rainbowvis.js'
import React, { Component } from 'react'
import { CompactPicker } from 'react-color';
import seedrandom from 'seedrandom'

import './App.css'
import logo from './logo.png'

const MAX_NUM_COLORS = 8
const MIN_NUM_COLORS = 2

const hexPairToNumber = (hexPair) => {
  hexPair = hexPair.toUpperCase()
  if (hexPair.length === 1) {
    hexPair += hexPair
  }
  const hexMap = '0123456789ABCDEF'
  return hexMap.indexOf(hexPair[0]) * 16 + hexMap.indexOf(hexPair[1])
}

class BezierRainbow extends Component {
  static defaultProps = {
    colors: [
      '#FFC887',
      '#CEFB74',
      '#82FBB6',
      '#7CC7FF',
      '#C17DFF',
      '#FF7FD8',
      '#FFC18C',
    ],
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
      colors,
    } = this.props

    const entropyScalar = 791
    const entropy = Math.floor(seedrandom(seed)() * entropyScalar)
    const ctx = this.canvas.getContext('2d')

    // Set up the color spectrum
    const spectrum = new Rainbow()
    spectrum.setNumberRange(0, numLines)
    spectrum.setSpectrum(...colors)

    // Clear the canvas
    ctx.clearRect(0, 0, width, height)

    // Set the line properties
    ctx.setLineDash([dashSize, dashSpaceSize])
    ctx.lineWidth = lineWidth

    // Draw the lines
    for (let i=0; i < numLines; i++) {
      ctx.beginPath()

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
      ctx.moveTo(startX, startY)
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY)

      // Set the color
      const hexColor = spectrum.colourAt(Math.floor(seedrandom(seed + i)() * numLines))
      const red = hexPairToNumber(hexColor.slice(0, 2))
      const green = hexPairToNumber(hexColor.slice(2, 4))
      const blue = hexPairToNumber(hexColor.slice(4, 6))
      ctx.strokeStyle = `rgb(${red}, ${green}, ${blue})`
      ctx.stroke()
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
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = this._parseQueryStringIntoValues({
      colors: [
        '#FFC887',
        '#CEFB74',
        '#82FBB6',
        '#7CC7FF',
        '#C17DFF',
        '#FF7FD8',
        '#FFC18C',
      ],
      colorEditingIndex: null,
      dashSize: 1,
      dashSpaceSize: 0,
      height: 500,
      lineWidth: 3,
      numLines: 30,
      ratioUpFirst: 0.5,
      seed: 1,
      width: 1000,
      startVariance: 0.5,
      xVariance: 0.1,
      yVariance: 0.5,
      nightModeOn: false,
    }, location.search)
  }

  _parseQueryStringIntoValues = (values, query) => {
    const bound = (min, max, value) => Math.min(max, Math.max(min, value))
    const q = qs.parse(query.replace('?', ''))

    try {
      if (q.cs) {
        let colors = q.cs.split(',').map(color => {
          if (color.length === 3) { color += color }
          if (color.length !== 6) { throw new Error('Invalid color') }
          return `#${color}`
        })
        if (colors.length === 1) {
          colors = colors.concat(colors)
        }
        values.colors = colors
      }
      if (q.ds) { values.dashSize = bound(1, 50, Number(q.ds)) }
      if (q.dss) { values.dashSpaceSize = bound(0, 50, Number(q.dss)) }
      if (q.h) { values.height = bound(1, 2000, Number(q.h)) }
      if (q.lw) { values.lineWidth = bound(1, 100, Number(q.lw)) }
      if (q.nl) { values.numLines = Math.min(300, Number(q.nl)) }
      if (q.ruf) { values.ratioUpFirst = bound(0, 1, Number(q.ruf)) }
      if (q.s) { values.seed = Number(q.s) }
      if (q.w) { values.width = bound(0, 5000, Number(q.w)) }
      if (q.sv) { values.startVariance = bound(0, 1, Number(q.sv)) }
      if (q.xv) { values.xVariance = bound(0, 1, Number(q.xv)) }
      if (q.yv) { values.yVariance = bound(0, 1, Number(q.yv)) }
      if (query.indexOf('nightMode') > -1) { values.nightModeOn = true }
    } catch(err) {
      console.log('There was an error parsing the query params. Using defaults.')
    }

    return values
  }

  _generateQueryString = () => {
    let str = ''

    str += `&cs=${this.state.colors.map(
      color => color.replace('#', '')).join(',')}`
    str += `&ds=${this.state.dashSize}`
    str += `&ds=${this.state.dashSpaceSize}`
    str += `&h=${this.state.height}`
    str += `&lw=${this.state.lineWidth}`
    str += `&nl=${this.state.numLines}`
    str += `&ru=${this.state.ratioUpFirst}`
    str += `&s=${this.state.seed}`
    str += `&w=${this.state.width}`
    str += `&sv=${this.state.startVariance}`
    str += `&xv=${this.state.xVariance}`
    str += `&yv=${this.state.yVariance}`

    return str
  }

  valueUpdater = (key) => {
    return (value) => {
      this.setState({ [key]: value })
    }
  }

  colorUpdater = (index) => {
    return (color) => {
      console.log(color)
      this.setState({
        colors: this.state.colors.map(
          (c, i) => index === i ? color.hex.hex || color.hex : c)
      })
    }
  }

  colorRemover = (index) => {
    return () => {
      const { colors, colorEditingIndex } = this.state
      this.setState({
        colors: colors.filter((c, i) => index !== i),
        colorEditingIndex: colorEditingIndex === index ? null : colorEditingIndex
      })
    }
  }

  addColor = () => {
    const { colors } = this.state
    this.setState({
      colors: colors.concat(colors[colors.length - 1]),
      colorEditingIndex: colors.length
    })
  }

  render() {
    const {
      colors,
      colorEditingIndex,
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

    const canAddColor = colors.length < MAX_NUM_COLORS
    const canRemoveColor = colors.length > MIN_NUM_COLORS

    return (
      <div className="App">
        <div className="controls-container">
          <div className="controls">
            <img className="logo" src={logo} alt="logo" />
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
              Start &amp; end variance <span className="control-value">{Math.floor(startVariance * 100)}%</span>
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
              X Variance <span className="control-value">{Math.floor(xVariance * 100)}%</span>
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
              Y Variance <span className="control-value">{Math.floor(yVariance * 100)}%</span>
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
              Ratio curving up first <span className="control-value">{Math.floor(ratioUpFirst * 100)}%</span>
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
              <span className="noselect">Share your settings</span>
              <div className="share-holder">
                https://ripleyaffect.github.io/rainbow-bezier/?{this._generateQueryString()}
              </div>
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
              colors={colors}
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
          <div className="color-swatches">
            {colors.map((color, idx) => {
              const editing = colorEditingIndex === idx
              return <div className="color-swatch-group" key={idx}>
                <div
                    className={
                      `color-swatch${editing ? ' color-swatch__editing' : ''}`}
                    onClick={
                      () => this.valueUpdater('colorEditingIndex')(
                        editing ? null : idx)}
                    style={{ backgroundColor: color }}
                />
                {editing && canRemoveColor &&
                  <div
                      className="remove-color-button"
                      onClick={this.colorRemover(idx)}>
                    Remove color
                  </div>}
                {editing &&
                  <div className="color-swatch-picker">
                    <CompactPicker
                        color={color}
                        onChange={this.colorUpdater(idx)} />
                  </div>}
              </div>
            })}
            {canAddColor && <div
                className="add-color-button"
                onClick={this.addColor}>
              <div className="add-color-button-text">+</div>
            </div>}
          </div>
        </div>
      </div>
    )
  }
}

export default App
