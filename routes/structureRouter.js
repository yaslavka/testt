const Router = require('express')
const structureControllers = require('../controllers/StructureControllers')
const router = new Router()



router.get('/', structureControllers.structure)
router.post('/html5/evoplay', structureControllers.project)



module.exports = router