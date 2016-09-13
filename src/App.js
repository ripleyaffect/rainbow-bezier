import React, { Component } from 'react';
import './App.css';

class BezierRainbow extends Component {
  static defaultProps = {
    numLines: 5,
    height: 500,
    width: 1250,
  }

  componentDidMount() {
    const { height, numLines, width } = this.props

    const ctx = this.canvas.getContext('2d')
    ctx.setLineDash([5, 5]);

    for (let i=0; i < numLines; i++) {
      ctx.beginPath();

      // Give y values a buffer
      const minPointY = height / 20
      const maxPointY = height - minPointY

      // Set the starting position
      const startX = 0
      const startY = Math.floor(
        Math.random() * (maxPointY - minPointY) + minPointY)
      ctx.moveTo(startX, startY);

      const upFirst = Math.floor(Math.random() * 2)

      // Set the curve values
      const cp1X = width / 3 + (-1 * Math.floor(Math.random() - 0.5)) * (Math.random() * width / 2)
      const cp1Y = upFirst ?
        0 + (Math.random() * height / 3)
      : height - (Math.random() * height / 3)
      const cp2X = width / 3 * 2 + (-1 * Math.floor(Math.random() - 0.5)) * (Math.random() * width / 2)
      const cp2Y = upFirst ?
        height - (Math.random() * minPointY)
      : 0 + (Math.random() * minPointY)
      const endX = width
      const endY = startY + (-1 * Math.floor(Math.random() - 0.5)) * minPointY
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);

      // Set the color
      const center = 200;
      const w = 80;
      const frequency = Math.PI * 2 / numLines;
      const red = Math.floor(Math.sin(frequency*i+2) * w + center);
      const green = Math.floor(Math.sin(frequency*i+0) * w + center);
      const blue = Math.floor(Math.sin(frequency*i+4) * w + center);
      ctx.strokeStyle = `rgb(${red}, ${green}, ${blue})`;
      console.log(`rgb(${red}, ${green}, ${blue})`)
      ctx.stroke();
    }
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
        <BezierRainbow numLines={20}/>
      </div>
    );
  }
}

export default App;
