const express = require('express')
const cors = require('cors')
const UserRouters = require('./routers/UserRouters')
const PetRoutes = require('./routers/PetRoutes');

app.use('/pets',PetRoutes) 


const app = express()

app.use(express.json())

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))

app.use(express.static('public'))

app.use('/users', UserRouters)

app.listen(5000)