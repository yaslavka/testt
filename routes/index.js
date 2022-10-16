const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const matrixRouter = require('./matrixRouter')
const newsRouter = require('./newsRouter')
const structureRouter = require('./structureRouter')


   
router.use('/user', userRouter)
router.use('/matrix', matrixRouter)
router.use('/news', newsRouter)
router.use('/structure', structureRouter)
router.use('/fullstate', structureRouter)



module.exports = router 