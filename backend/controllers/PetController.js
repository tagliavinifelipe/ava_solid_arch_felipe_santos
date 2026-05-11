const Pet = require ('../models/Pet')
const getToken = require('../helpers/get-tokens')
const getUserByToken = require ('../helpers/get-user-by-token')    

module.exports = class PetController {
    static async create(req,res) {
        const {name, age, weight, color} = req.body 
        const images = req.files
    
    if(!name){
        res.status(422).json({
            message: 'O nome é obrigatório'
        })
        return
    }

    if(!age){
        res.status(422).json({
            message: 'A idade é obrigatório!'
        })
        return
    }
    
    if(!weight){
        res.status(422).json({
            message: 'O peso é obrigatório'
        })
        return
    }

    if(!color){
        res.status(422).json({
            message: 'A cor é obrigatória'
        })
        return
    }

    if(!images || images.length === 0){
        res.status(422).json({
            message: 'As imagens são obrigatórias!'
        })
        return
    }

    const token = getToken(req)
    const user = await getUserByToken(token)

    const imageNames = images.map((image) => image.filename)

    const pet = new Pet({
        name,
        age,
        weight,
        color,
        images: imageNames,
        available: true,
        user:{
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone
        }
    })

    try{
        const newPet = await pet.save()
            res.status(201).json({
                message: 'Pet cadastrado com sucesso', newPet
            }) 
        }catch (error){
            res.status(500).json({message: error})
        }

    }
}