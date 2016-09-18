const express = require('express')

const PORT = process.env.PORT || 8000

const app = express()

app.use('/static', express.static(`${__dirname}/public`))

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`)
})

app.listen(PORT, () => {
  console.log('Lisenting on port ' + PORT)
})