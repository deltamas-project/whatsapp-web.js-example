const express = require('express')
const app = express()
const router = require('./routers/WhatsappRouter')

const port = 8000

app.use('/', router)

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})