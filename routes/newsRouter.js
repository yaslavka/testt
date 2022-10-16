const Router = require('express')
const NewsControllers = require('../controllers/NewsControllers')
const router = new Router()



router.get('/get-block', NewsControllers.getBlock)



module.exports = router