const router =  require('express').Router()
const PetController = require ('../controllers/PetController')

const verifyToken = require ('../helpers/verify-token')
const { imageUpload }  = require ('../helpers/image-upload')

router.post('/create', verifyToken, imageUpload.array('images'), PetController.create)
router.get('/', PetController.getAll)
router.get('/mypets', verifyToken, PetController.getAllUserPets)
router.get('/:id', PetController.getPetById)
router.delete('/:id', PetController.deletePet) 
router.patch('/schedule/:id', verifyToken, PetController.schedule)
router.patch('/conclude/:id', verifyToken, PetController.concludeAdoption) 
router.patch('/edit/:id', verifyToken, imageUpload.array('images'), PetController.editPet)

module.exports = router