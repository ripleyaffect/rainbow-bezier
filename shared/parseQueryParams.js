const getDefaultValues = require('./getDefaultValues')

module.exports = (q) => {
  let values = getDefaultValues()
  const bound = (min, max, value) => Math.min(max, Math.max(min, value))

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

    // legacy support for showPoints
    if (q.showPoints) { values.pointsRadius = 5 }

    if (q.ds) { values.dashSize = bound(1, 50, Number(q.ds)) }
    if (q.dss) { values.dashSpaceSize = bound(0, 50, Number(q.dss)) }
    if (q.h) { values.height = bound(1, 2000, Number(q.h)) }
    if (q.lw) { values.lineWidth = bound(1, 100, Number(q.lw)) }
    if (q.nl) { values.numLines = bound(0, 300, Number(q.nl)) }
    if (q.o) { values.opacity = bound(0.1, 1, Number(q.o)) }
    if (q.pr) { values.pointsRadius = bound(0, 50, Number(q.pr)) }
    if (q.ruf) { values.ratioUpFirst = bound(0, 1, Number(q.ruf)) }
    if (q.s) { values.seed = Number(q.s) }
    if (q.w) { values.width = bound(0, 5000, Number(q.w)) }
    if (q.sv) { values.startVariance = bound(0, 1, Number(q.sv)) }
    if (q.xv) { values.xVariance = bound(0, 1, Number(q.xv)) }
    if (q.yv) { values.yVariance = bound(0, 1, Number(q.yv)) }
    if (q.discreteColors) { values.discreteColors = true }
  } catch(err) {
    console.log('There was an error parsing the query params. Using defaults.')
  }

  return values
}