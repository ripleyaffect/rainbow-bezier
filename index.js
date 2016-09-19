const Canvas = require('canvas')
const express = require('express')
const qs = require('qs')

const drawLines = require('./shared/drawLines')
const parseQueryParams = require('./shared/parseQueryParams')

const PORT = process.env.PORT || 8000

const app = express()

app.use('/static', express.static(`${__dirname}/public`))
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  const ogUrl = "http://rainbows.ripley.nyc"
  const queryString = qs.stringify(req.query)
  const ogImageUrl = `${ogUrl}/image${queryString ? `?${queryString}` : ''}`
  res.render(`index`, {
    ogUrl,
    ogImageUrl,
  })
})

app.get('/image', (req, res) => {
  values = parseQueryParams(req.query)
  console.log(values)

  canvas = new Canvas(values.width, values.height)
  ctx = canvas.getContext('2d');
  drawLines(ctx, values)

  res.setHeader('Content-Type', 'image/png');
  canvas.pngStream().pipe(res);
})

app.listen(PORT, () => {
  console.log('Lisenting on port ' + PORT)
})