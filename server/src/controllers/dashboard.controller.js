import applicationModel from '../models/application.model.js';
import { getTopPriorities } from '../services/priorityEngine.service.js';
import { buildFallbackRecommendation, generateCareerRecommendations } from '../services/careerAssistant.service.js';

export async function getTodayPriorities(req, res) {
    try {
        const applications = await applicationModel.find({ userId: req.user._id });
        const priorities = getTopPriorities(applications);

        let recommendations = {};

        try {
            recommendations = await generateCareerRecommendations(priorities);
        } catch (error) {
            console.error('[dashboard] AI priority recommendation failed:', error.message);
        }

        const response = priorities.map((priority, index) => ({
            id: priority.applicationId,
            company: priority.company,
            role: priority.role,
            priority: priority.priority,
            priorityLabel: priority.priorityLabel,
            icon: priority.icon,
            actionType: priority.actionType,
            reason: priority.reason,
            aiRecommendation: recommendations[priority.applicationId]
                || buildFallbackRecommendation(priority, index, priorities)
        }));

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
