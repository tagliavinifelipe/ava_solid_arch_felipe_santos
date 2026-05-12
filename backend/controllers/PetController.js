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

    static async getAll(req,res){
        try{
            const pets = await Pet.find().sort('-createdAt')
            res.status(200).json({pets})
        }catch(error){
            res.status(500).json({message: error})
        }
    }

    static async getAllUserPets(req, res) {
        const token = getToken(req)
        const user = await getUserByToken(token)

        try{
            const pets = await Pet.find ({ 'user._id': user._id}).sort('-createdAt')
            res.status(200).json({ pets })
        } catch(error){
            res.status(500).json({message: error})
        }
    }

    static async getAllUserAdoptions(req, res){
        const token = getToken(req)
        const user = await getUserByToken(token)

        try{
            const pets = await Pet.find({ 'adopter._id': user._id }).sort('-createdAt')
            res.status(200).json({ pets })
        } catch(error){
            res.status(500).json({message: error})
        }
    }
    
    static async getPetById(req, res){
        const id = req.params.id

        if(!mongoose.isValidObjetcId(id)){
            res.status(422).json ({message: ' Id inválido '})
            return
        }


        const pet = await Pet.findById(id)

        if(!pet){
            res.status(404).json({message: 'Pet não encontrado'})
            return
        }

        res.status(200).json({ pet })

    }

    static async removePetById(req, res){
        const id = req.params.id

        if(!mongoose.isValidObjectId(id)){
            res.status(422).json({ message: 'Id inválido'})
            return
        }

        const pet = await Pet.findById(id)
        if(!pet){
            res.status(404).json({message: 'Pet não econtrado'})
            return
        }

        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id. toString() !== user._id.toString()){
            res.status(422).json({message: 'Acesso negado'})
            return
        }

        try{
            await Pet.findByIdAndDelete(id)
            res.status(200).json({message: 'Pet removido com sucesso!'})

        }catch(error){
            res.status(500).json({message:error})
        }

    }

    static async updatePet(req,res){
        const id = req.params.id
        const { name, age, weight, color} = req.body
        const images = req.files
        const token = getToken(req)
        const user = await getUserByToken(token)
        if(!mongoose.isValidObjectId(id)){
            res.status(422).json({message: 'Id invalido'})
            return
        }

        try{
            const pet = await Pet.findById(id)
            if(!pet){
                res.status(404).json({message: 'pet não encontrado'})
                return
            }

            if(pet.user._id.toString() !== user._id.toString()){
                res.status(403).json({message: 'voce não tem permissao para editar esse pet'})
                return
            }

            if(name) pet.name = name
            if(age) pet.age = age
            if(weight) pet.weight = weight
            if(color) pet.color = color

            if(images && images.lenght > 0){
                const imageNames = images.map((image) => image.filename)
                pet.images = imageNames
            }

            const updatedPet = await Pet.findByIdAndUpdate(
                {_id: id},
                {$set: pet},
                {new: true}
            )

            res.status(200).json({
                message: 'Pet atualizado com sucesso',
                pet: updatedPet
            })
        }catch(error){
            res.status(500).json({message: error})
        }
    }
       

    static async schedule(req,res){
        const id = req.params.id
        const token = getToken(req)
        const user = await getUserByToken(token)

        try{
            const pet = await Pet.findById(id)
            if(!pet){
                res.status(404).json({message: 'Petnão encontrado'})
                return
            }

            if (pet.user._id.toString() === user._id.toString()){
                res.status(403).json({message: 'você não pode agendar uma visita para seu próprio pet'})
                return
            }

            if (!pet.available){
            res.status(403).json({message: 'Este pet foi adotado'})
            return
            }

            pet.adopter = {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }

            await pet.save()

            res.status(200).json({
                message: 'visita agendada com sucesso, entre em contato com o dono do pet.',
                pet:pet
            })
        }catch(error){
            res.status(500).json({message: error})
        }
    }

    static async concludeAdoption(req, res){
        const id = req.params.id
        const token = getToken(req)
        const user = await getUserByToken(token)
        
        try{
            const pet = await Pet.findById(id)

            if(!pet){
                res.status(404).json({message: 'Pet não encontrado'})
                return
            }

            if(pet.user._id.toString() !== user._id.toString()){
                res.status(403).json({message: 'Apenas o dono pode concluir a adoção'})
                return
            }

            if(!pet.available){
                res.status(403).json({message: 'O pet ja foi adotado'})
                return
            }
        
            if(!pet.adopter){
                res.status(403).json({message: 'Não ha um adotante agendado para este pet'})
                return
            }
        
            pet.available = false
            await pet.save()

            res.status(200).json({
                message: 'Adoção concluída com sucesso',
                pet:pet
            })
         } catch(error){
            res.status(500).json({message: error})
         }
    }
}