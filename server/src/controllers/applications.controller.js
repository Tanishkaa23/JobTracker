import app from '../app.js';
import applicationModel from '../models/application.model.js';

export async function getApplications(req, res){
    try{
        const applications = await applicationModel.find({userId: req.user._id});

        res.status(200).json({message: "Applications fetched successfully", applications});
    }catch(err){
        res.status(500).json({message: err.message});
    }
}

export async function createApplication(req, res){
    try{
        const application = await applicationModel.create({
            ...req.body,
            userId: req.user._id
        });

        return res.status(201).json({message: "Application created successfully", application});
    } catch(err){
        return res.status(500).json({message: err.message});
    }
}

export async function deleteApplication(req, res){
    try{
        const {id} = req.params

        const application = await applicationModel.findOne({
            _id:id,
            userId: req.user._id
        })

        if(!application){
            return res.status(404).json({message:"Application not found"})
        }

        await applicationModel.deleteOne();

        return res.status(200).json({message:"Application deleted successfully"})
    }catch(err){
        return res.status(500).json({message:err.message})
    }
}

export async function updateApplication(req, res){
    try{
        const {id} = req.params
        const application = await applicationModel.findOneAndUpdate(
            {
                _id:id,
                userId:req.user._id
            },
            req.body,
            {
                returnDocument: "after",
                runValidators: true
            }
        )
        
        if(!application){
            return res.status(404).json({message:"Application not found"})
        }

        return res.status(200).json({message:"Application updated successfully", application})
    }catch(err){
        return res.status(500).json({message:err.message})
    }
}

export async function getOneApplication(req, res){
    try{
        const {id} = req.params

        const application = await applicationModel.findOne({_id:id, userId:req.user._id})

        if(!application){
            return res.status(500).json({message:"Application not found"})
        }

        return res.status(200).json({message:"Application fetched successfully", application})
        }catch(err){
            return res.status(500).json({message:err.message})
        }
}