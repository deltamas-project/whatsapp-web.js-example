const express = require('express')
const api = require('../controllers/WhatsappController')

const router = express.Router()

router.get('/api', api)

module.exports = router