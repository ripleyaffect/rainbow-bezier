import qs from 'qs'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { SketchPicker } from 'react-color'
import CopyToClipboard from 'react-copy-to-clipboard'

import drawLines from './drawLines'
import logo from './logo.png'
import getDefaultValues from './getDefaultValues'

const MAX_NUM_COLORS = 8
const MIN_NUM_COLORS = 2

class BezierRainbow extends Component {
  static defaultProps = getDefaultValues()

  drawLines = () => {
    const ctx = this.canvas.getContext('2d')
    drawLines(ctx, this.props)
  }

  componentDidMount() {
    this.drawLines()
  }

  componentDidUpdate() {
    this.drawLines()
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

class ClickawayColorSwatch extends React.Component {
  componentDidMount () {
    window.document.addEventListener('mousedown', this.handleDocumentClick)
  }

  componentWillUnmount () {
    window.document.removeEventListener('mousedown', this.handleDocumentClick)
  }

  handleDocumentClick = (e) => {
    const area = ReactDOM.findDOMNode(this.area);

    if (!area.contains(e.target) && this.props.editing) {
      this.props.onClose(e)
    }
  }

  render() {
    const {
      canRemove,
      color,
      editing,
      onClickRemove,
      onClose,
      onColorChange,
      onOpen,
      swatchClassName,
    } = this.props
    return <div
          className="color-swatch-group"
          ref={c => this.area = c}>
        <div
            className={
              `color-swatch${
                editing ? ' color-swatch__editing' : ''} ${
                swatchClassName || ''}`}
            onClick={()=> editing ? onClose() : onOpen()}
            style={{ backgroundColor: color }}
        />
        {editing && canRemove &&
          <div
              className="remove-color-button"
              onClick={onClickRemove}>
            Remove color
          </div>}
        {editing &&
          <div className="color-swatch-picker">
            <SketchPicker color={color} onChange={onColorChange} />
          </div>}
      </div>
  }
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = this._parseQueryStringIntoValues({
      ...getDefaultValues(),
      colorEditingIndex: null,
      showCopiedMessage: false,
    }, location.search)
  }

  _parseQueryStringIntoValues = (values, query) => {
    const bound = (min, max, value) => Math.min(max, Math.max(min, value))
    const q = qs.parse(query.replace('?', ''))

    try {
      if (q.bg) {
        let backgroundColor = q.bg
        if (backgroundColor.length === 3) { backgroundColor += backgroundColor }
        if (backgroundColor.length !== 6) { throw new Error('Invalid background color') }
        backgroundColor = `#${backgroundColor}`
        values.backgroundColor = backgroundColor
      }

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
      if (query.indexOf('discreteColors') > -1) { values.discreteColors = true }
    } catch(err) {
      console.log('There was an error parsing the query params. Using defaults.')
    }

    return values
  }

  _generateQueryString = () => {
    let str = ''

    // Add colors
    str += `bg=${this.state.backgroundColor.replace('#', '')}`
    str += `&cs=${this.state.colors.map(
      color => color.replace('#', '')).join(',')}`

    // Add settings
    str += `&ds=${this.state.dashSize}`
    str += `&dss=${this.state.dashSpaceSize}`
    str += `&h=${this.state.height}`
    str += `&lw=${this.state.lineWidth}`
    str += `&nl=${this.state.numLines}`
    str += `&ru=${this.state.ratioUpFirst}`
    str += `&s=${this.state.seed}`
    str += `&w=${this.state.width}`
    str += `&sv=${this.state.startVariance}`
    str += `&xv=${this.state.xVariance}`
    str += `&yv=${this.state.yVariance}`

    // Add flags
    if (this.state.discreteColors) { str += '&discreteColors' }

    return str
  }

  valueUpdater = (key) => {
    return (value) => {
      this.setState({ [key]: value })
    }
  }

  colorUpdater = (index) => {
    return (color) => {
      this.setState({
        colors: this.state.colors.map(
          (c, i) => index === i ? color.hex : c)
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

  handleCopied = () => {
    this.setState({ showCopiedMessage: true }, () => {
      setTimeout(() => this.setState({ showCopiedMessage: false }), 1000)
    })
  }

  render() {
    const {
      backgroundColor,
      colors,
      colorEditingIndex,
      dashSize,
      dashSpaceSize,
      discreteColors,
      height,
      lineWidth,
      numLines,
      ratioUpFirst,
      seed,
      showCopiedMessage,
      width,
      xVariance,
      startVariance,
      yVariance,
    } = this.state

    const canAddColor = colors.length < MAX_NUM_COLORS
    const canRemoveColor = colors.length > MIN_NUM_COLORS
    const editingBackground = colorEditingIndex === 'bg'
    const shareUrl = `https://ripleyaffect.github.io/rainbow-bezier/?${
      this._generateQueryString()}`

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
              Use discrete colors
              <span className="control-value">
                {discreteColors ? 'on' : 'off'}
                <input
                    value={discreteColors}
                    type="checkbox"
                    name="discrete-colors"
                    checked={discreteColors}
                    onChange={(e) => this.valueUpdater('discreteColors')(!discreteColors)}
                />
              </span>
            </div>
            <div className="canvas-control">
              <span className="noselect">Share your settings</span>
              {showCopiedMessage ?
                <span className="control-value">Copied!</span>
              : <CopyToClipboard text={shareUrl} onCopy={this.handleCopied}>
                  <span className="control-value copy-button">Copy</span>
                </CopyToClipboard>}
              <div className="share-holder">{shareUrl}</div>
            </div>
          </div>
        </div>
        <div className="canvas-container" style={{ backgroundColor }}>
          <BezierRainbow
              backgroundColor={backgroundColor}
              colors={colors}
              dashSize={Number(dashSize)}
              dashSpaceSize={Number(dashSpaceSize)}
              discreteColors={discreteColors}
              height={Number(height)}
              lineWidth={Number(lineWidth)}
              numLines={Number(numLines)}
              ratioUpFirst={Number(ratioUpFirst)}
              seed={Number(seed)}
              width={Number(width)}
              xVariance={Number(xVariance)}
              startVariance={Number(startVariance)}
              yVariance={Number(yVariance)}
          />
          <div className={`color-swatches${
            colorEditingIndex !== null || editingBackground ?
              ' color-swatches__editing' : ''}`}>
            <ClickawayColorSwatch
                swatchClassName="background-color-swatch"
                color={backgroundColor}
                editing={editingBackground}
                onColorChange={
                  (color) => this.valueUpdater('backgroundColor')(color.hex)}
                onClose={() => this.valueUpdater('colorEditingIndex')(null)}
                onOpen={() => this.valueUpdater('colorEditingIndex')('bg')}
            />
            {colors.map((color, idx) => {
              const editing = colorEditingIndex === idx
              return <ClickawayColorSwatch
                  canRemove={canRemoveColor}
                  color={color}
                  editing={editing}
                  key={idx}
                  onClickRemove={this.colorRemover(idx)}
                  onColorChange={this.colorUpdater(idx)}
                  onClose={() => this.valueUpdater('colorEditingIndex')(null)}
                  onOpen={() => this.valueUpdater('colorEditingIndex')(idx)}
              />
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
