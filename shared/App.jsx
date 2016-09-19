import qs from 'qs'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { SketchPicker } from 'react-color'
import CopyToClipboard from 'react-copy-to-clipboard'
import { ShareButtons, generateShareIcon } from 'react-share';

import drawLines from './drawLines'
import logo from './logo.png'
import getDefaultValues from './getDefaultValues'
import parseQueryParams from './parseQueryParams'

const MAX_NUM_COLORS = 8
const MIN_NUM_COLORS = 2
const { FacebookShareButton, TwitterShareButton } = ShareButtons
const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');

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

    this.state = {
      ...this._parseQueryStringIntoValues(getDefaultValues(), location.search),
      colorEditingIndex: null,
      showShareCopiedMessage: false,
      showImageCopiedMessage: false,
    }
  }

  _parseQueryStringIntoValues = (values, query) => {
    const q = qs.parse(query.replace('?', ''))
    return parseQueryParams(q)
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
    str += `&o=${this.state.opacity}`
    str += `&ru=${this.state.ratioUpFirst}`
    str += `&s=${this.state.seed}`
    str += `&sv=${this.state.startVariance}`
    str += `&w=${this.state.width}`
    str += `&xv=${this.state.xVariance}`
    str += `&yv=${this.state.yVariance}`

    // Add flags
    if (this.state.discreteColors) { str += '&discreteColors=1' }
    if (this.state.showPoints) { str += '&showPoints=1' }

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

  handleShareCopied = () => {
    this.setState({ showShareCopiedMessage: true }, () => {
      setTimeout(() => this.setState({ showShareCopiedMessage: false }), 1000)
    })
  }

  handleImageCopied = () => {
    this.setState({ showImageCopiedMessage: true }, () => {
      setTimeout(() => this.setState({ showImageCopiedMessage: false }), 1000)
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
      opacity,
      ratioUpFirst,
      seed,
      showShareCopiedMessage,
      showImageCopiedMessage,
      showPoints,
      width,
      xVariance,
      startVariance,
      yVariance,
    } = this.state
    console.log(colorEditingIndex)

    const canAddColor = colors.length < MAX_NUM_COLORS
    const canRemoveColor = colors.length > MIN_NUM_COLORS
    const editingBackground = colorEditingIndex === 'bg'

    const urlBase = 'http://rainbow-bezier.herokuapp.com'
    const queryString = this._generateQueryString()
    const shareUrl = `${urlBase}/?${queryString}`
    const imageUrl = `${urlBase}/image?${queryString}`

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
              Opacity <span className="control-value">{Math.floor(opacity * 100)}%</span>
              <input
                  value={opacity}
                  type="range"
                  name="line-width"
                  min="0.1"
                  max="1"
                  step="0.1"
                  onChange={(e) => this.valueUpdater('opacity')(e.target.value)}
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
              Show control points
              <span className="control-value">
                {showPoints ? 'on' : 'off'}
                <input
                    value={showPoints}
                    type="checkbox"
                    name="show-points"
                    checked={showPoints}
                    onChange={(e) => this.valueUpdater('showPoints')(!showPoints)}
                />
              </span>
            </div>
            <div className="canvas-control">
              <span className="noselect">Share your settings</span>
              {showShareCopiedMessage ?
                <span className="control-value">Copied!</span>
              : <CopyToClipboard text={shareUrl} onCopy={this.handleShareCopied}>
                  <span className="control-value copy-button">Copy</span>
                </CopyToClipboard>}
              <a href={shareUrl} target="_blank" className="share-holder">{shareUrl}</a>
              <FacebookShareButton
                  title="Rainbow Bezier"
                  description="Make your own colorful curves"
                  url={shareUrl}
              >
                <FacebookIcon size={40} />
              </FacebookShareButton>
              <TwitterShareButton
                  title="Rainbow Bezier"
                  url={shareUrl}
                  hastags={['reactjs', 'rainbow']}
              >
                <TwitterIcon size={40} />
              </TwitterShareButton>
            </div>
            <div className="canvas-control">
              <span className="noselect">Image link</span>
              {showImageCopiedMessage ?
                <span className="control-value">Copied!</span>
              : <CopyToClipboard text={imageUrl} onCopy={this.handleImageCopied}>
                  <span className="control-value copy-button">Copy</span>
                </CopyToClipboard>}
              <a href={imageUrl} target="_blank" className="share-holder">{imageUrl}</a>
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
              opacity={Number(opacity)}
              ratioUpFirst={Number(ratioUpFirst)}
              seed={Number(seed)}
              showPoints={showPoints}
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
