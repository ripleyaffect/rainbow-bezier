const express = require('express')

const PORT = process.env.PORT || 8000

const app = express()

app.use('/', express.static(`${__dirname}/public`))

app.get('/', (req, res) => {
  res.sendFile('index.html')
})

app.listen(PORT, () => {
  console.log('Lisenting on port ' + PORT)
})