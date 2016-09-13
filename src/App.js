import React, { Component } from 'react';
import seedrandom from 'seedrandom'

import './App.css';

class BezierRainbow extends Component {
  static defaultProps = {
    numLines: 5,
    height: 200,
    width: 500,
    seed: 1,
  }

  constructor(props) {
    super(props)

    this.state = {
      tick: 0
    }
  }

  _getStartX = (seed) => {
    return 0
  }

  _getStartY = (min, max, seed, entropy) => {
    const val = Math.floor(seedrandom(seed + entropy)() * (max - min) + min)
    return val
  }

  setLines = () => {
    const { height, numLines, width, seed } = this.props
    console.log(seed)
    const entropy = Math.floor(seedrandom(seed)() * 2345676789)

    const ctx = this.canvas.getContext('2d')
    ctx.clearRect(0, 0, width, height)

    ctx.setLineDash([1, 3]);

    for (let i=0; i < numLines; i++) {
      ctx.beginPath();

      // Give y values a buffer
      const minPointY = height / 200
      const maxPointY = height - minPointY

      // Set the starting position
      const startX = this._getStartX()
      const startY = this._getStartY(minPointY, maxPointY, seed, i * entropy)
      ctx.moveTo(startX, startY);

      const upFirst = Math.floor(seedrandom(seed + i + 11 * entropy)() + 0.5)

      // Set the curve values
      // console.log([-1, 1][Math.floor(seedrandom(seed + i * entropy)() + 0.499)])
      const cp1X = width / 3 + [-1, 1][Math.floor(seedrandom(seed + i * entropy)() + 0.499)] * (seedrandom(seed + i + 2 * entropy)() * width / 3)
      const cp1Y = upFirst ?
        seedrandom(seed + i + 3 * entropy)() * height / 3
      : height - (seedrandom(seed + i + 3 * entropy)() * height / 3)
      // console.log([-1, 1][Math.floor(seedrandom(seed + i + 5 * entropy)() + 0.499)])
      const cp2X = width / 3 * 2 + [-1, 1][Math.floor(seedrandom(seed + i + 5 * entropy)() + 0.499)] * (seedrandom(seed + i + 6 * entropy)() * width / 3)
      console.log(width / 3 * 2 < cp2X)
      const cp2Y = upFirst ?
        height - (seedrandom(seed + i + 4 * entropy)() * minPointY)
      : seedrandom(seed + i + 4 * entropy)() * minPointY
      const endX = width
      const endY = startY + (-1 * Math.floor(seedrandom(seed + i + 9 * entropy)() - 0.5)) * minPointY
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);

      // Set the color
      const center = 200;
      const w = 80;
      const frequency = Math.PI * 2 / numLines;
      const red = Math.floor(Math.sin(frequency*i+2) * w + center);
      const green = Math.floor(Math.sin(frequency*i+0) * w + center);
      const blue = Math.floor(Math.sin(frequency*i+4) * w + center);
      ctx.strokeStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.lineWidth = this.state.tick % 20;
      ctx.stroke();
    }
  }

  componentDidMount() {
    this.setLines()
  }

  render() {
    const { height, width } = this.props
    return (
      <canvas
        height={height}
        width={width}
        className="bezier-rainbow" ref={c => this.canvas = c} />
    );
  }
}


class App extends Component {
  render() {
    return (
      <div className="App">
        <BezierRainbow numLines={20} seed={9}/>
        <BezierRainbow numLines={20} seed={8}/>
        <BezierRainbow numLines={20} seed={7}/>
        <BezierRainbow numLines={20} seed={6}/>
      </div>
    );
  }
}

export default App;
