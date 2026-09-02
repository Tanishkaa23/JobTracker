import applicationModel from '../models/application.model.js';
import {buildStaleFilter} from '../constants/constants.js'
import { generateFollowUpEmailDraft, generateInterviewPrep } from '../services/careerAssistant.service.js';
import { extractTextFromFile, mergeTextSources } from '../services/fileParser.service.js';
import { sendEmail } from '../services/email.service.js';

const FOLLOW_UP_STATUSES = ['applied', 'interviewing'];

function canSendFollowUp(application) {
    return FOLLOW_UP_STATUSES.includes(application.status);
}

export async function getApplications(req, res){
    try{
        const filter = { userId: req.user._id };

        if (req.query.stale !== undefined) {
            const staleValue = req.query.stale === 'true';
            Object.assign(filter, buildStaleFilter(staleValue));
        }

        const applications = await applicationModel.find(filter);

        res.status(200).json({ message: "Applications fetched successfully", applications });
    } catch(err){
        res.status(500).json({ message: err.message });
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

        await applicationModel.deleteOne({_id:id, userId:req.user._id});

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
            return res.status(404).json({message:"Application not found"})
        }

        return res.status(200).json({message:"Application fetched successfully", application})
        }catch(err){
            return res.status(500).json({message:err.message})
        }
}

export async function generateFollowUpDraft(req, res) {
    try {
        const { id } = req.params;
        const application = await applicationModel.findOne({ _id: id, userId: req.user._id });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (!canSendFollowUp(application)) {
            return res.status(400).json({ message: "Follow-up emails can only be generated for applied or interviewing applications." });
        }

        const draft = await generateFollowUpEmailDraft(application, req.user);
        return res.status(200).json({
            to: application.recruiterEmail || '',
            ...draft
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export async function sendFollowUpEmail(req, res) {
    try {
        const { id } = req.params;
        const { to, subject, body } = req.body;

        if (!to || !subject || !body) {
            return res.status(400).json({ message: "Recipient, subject, and body are required." });
        }

        const application = await applicationModel.findOne({ _id: id, userId: req.user._id });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (!canSendFollowUp(application)) {
            return res.status(400).json({ message: "Follow-up emails can only be sent for applied or interviewing applications." });
        }

        await sendEmail({ to, subject, text: body });

        if (application.recruiterEmail !== to) {
            application.recruiterEmail = to;
        }
        application.lastReminderSentAt = new Date();
        await application.save();

        return res.status(200).json({ message: "Follow-up email sent successfully." });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export async function generateInterviewPrepContent(req, res) {
    try {
        const { id } = req.params;
        const application = await applicationModel.findOne({ _id: id, userId: req.user._id });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const jdFile = req.files?.jobDescriptionFile?.[0];
        const resumeFile = req.files?.resumeFile?.[0];

        let jobDescriptionText = req.body.jobDescriptionText || '';
        let resumeText = req.body.resumeText || '';

        if (jdFile) {
            jobDescriptionText = mergeTextSources(jobDescriptionText, await extractTextFromFile(jdFile));
        }

        if (resumeFile) {
            resumeText = mergeTextSources(resumeText, await extractTextFromFile(resumeFile));
        }

        const prep = await generateInterviewPrep(application, { jobDescriptionText, resumeText });
        return res.status(200).json(prep);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
