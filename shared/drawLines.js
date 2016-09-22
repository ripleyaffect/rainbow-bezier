const Rainbow = require('rainbowvis.js')
const seedrandom = require('seedrandom')

const hexPairToNumber = (hexPair) => {
  hexPair = hexPair.toUpperCase()
  if (hexPair.length === 1) {
    hexPair += hexPair
  }
  const hexMap = '0123456789ABCDEF'
  return hexMap.indexOf(hexPair[0]) * 16 + hexMap.indexOf(hexPair[1])
}

const _getMinY = (height, startVariance) => {
  return Math.floor(height / 2 + startVariance * height / 2)
}

const _getUpFirst = (seed, ratioUpFirst, entropy) => {

  return Math.floor(seedrandom(seed + entropy)() + ratioUpFirst)
}

const _getStartX = () => {
  return 0
}

const _getStartY = (seed, min, max, entropy) => {
  return Math.floor(seedrandom(seed + entropy)() * (max - min) + min)
}

const _getEndX = (width) => {
  return width
}

const _getEndY = (seed, min, max, startY, entropy) => {
  return Math.floor(seedrandom(seed + entropy)() * (max - min) + min)
}

const _getCP1X = (seed, width, xVariance, entropy) => {
  const val = (
    width / 3 +
    [-1, 1][Math.floor(seedrandom(seed + entropy)() + 0.5)] *
    seedrandom(seed + entropy * 2)() * width * xVariance
  )
  return Math.max(0, Math.min(width, val))
}

const _getCP1Y = (seed, height, yVariance, upFirst, startY, entropy) => {
  const val = upFirst ?
    startY - seedrandom(seed + entropy)() * height * 2 * yVariance
  : startY + seedrandom(seed + entropy)() * height * 2 * yVariance
  return Math.max(0, Math.min(height, val))
}

const _getCP2X = (seed, width, xVariance, entropy) => {
  const val = (
    width / 3 * 2 +
    [-1, 1][Math.floor(seedrandom(seed + entropy)() + 0.5)] *
    seedrandom(seed + entropy * 2)() * width * xVariance
  )
  return Math.max(0, Math.min(width, val))
}

const _getCP2Y = (seed, height, yVariance, upFirst, endY, entropy) => {
  const val = upFirst ?
    endY + seedrandom(seed + entropy)() * height * 2 * yVariance
  : endY - seedrandom(seed + entropy)() * height * 2 * yVariance
  return Math.max(0, Math.min(height, val))
}

module.exports = (
  ctx,
  {
    backgroundColor,
    colors,
    dashSize,
    dashSpaceSize,
    discreteColors,
    height,
    lineWidth,
    numLines,
    opacity,
    ratioUpFirst,
    seed,
    startVariance,
    width,
    xVariance,
    yVariance,
    pointsRadius,
  }
) => {
  const entropyScalar = 791
  const entropy = Math.floor(seedrandom(seed)() * entropyScalar)

  // Set up the color spectrum
  const spectrumValues = discreteColors ?
    colors.length : Math.max(100, numLines)
  const spectrum = new Rainbow()
  spectrum.setNumberRange(1, spectrumValues)
  spectrum.setSpectrum(...colors)

  // Draw the background
  ctx.fillStyle=backgroundColor
  ctx.fillRect(0, 0, width, height)

  // Set the line properties
  ctx.setLineDash([dashSize, dashSpaceSize])
  ctx.lineWidth = lineWidth

  // Draw the lines
  for (let i=0; i < numLines; i++) {
    // Give y values a buffer
    const minPointY = _getMinY(height, startVariance)
    const maxPointY = height - minPointY

    // Calculate curve direction
    const upFirst = _getUpFirst(seed, ratioUpFirst, i * entropy)

    // Set the starting position
    const startX = _getStartX()
    const startY = _getStartY(seed, minPointY, maxPointY, i * entropy * 2)

    // Set the ending position
    const endX = _getEndX(width)
    const endY = _getEndY(seed, minPointY, maxPointY, startY, i * entropy * 3)

    // Set the first control point values
    const cp1X = _getCP1X(seed, width, xVariance, i * entropy * 4)
    const cp1Y = _getCP1Y(seed, height, yVariance, upFirst, startY, i + entropy * 5)

    // Set the second control point values
    const cp2X = _getCP2X(seed, width, xVariance, i * entropy * 5)
    const cp2Y = _getCP2Y(seed, height, yVariance, upFirst, endY, i * entropy * 9)

    // Set the color
    const colorIndex = Math.floor(seedrandom(seed + i)() * spectrumValues + 1)
    const hexColor = spectrum.colourAt(colorIndex)
    const red = hexPairToNumber(hexColor.slice(0, 2))
    const green = hexPairToNumber(hexColor.slice(2, 4))
    const blue = hexPairToNumber(hexColor.slice(4, 6))
    const colorString = `rgba(${red}, ${green}, ${blue}, ${opacity})`

    // draw the points if needed
    if (pointsRadius) {
      ctx.fillStyle = colorString
      ctx.beginPath()
      ctx.arc(cp1X, cp1Y, pointsRadius, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.beginPath()
      ctx.arc(cp2X, cp2Y, pointsRadius, 0, 2 * Math.PI, false);
      ctx.fill();
    }

    // Make the curve
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY)
    ctx.strokeStyle = colorString
    ctx.stroke()

  }
}
