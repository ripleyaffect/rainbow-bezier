const express = require('express')

const PORT = process.env.PORT || 8000

const app = express()

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.listen(PORT, () => {
  console.log('Lisenting on port ' + PORT)
})