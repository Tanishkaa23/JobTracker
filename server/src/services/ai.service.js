import groq from "./groq.service.js";

export const generateAIResponse = async (
    prompt,
    systemPrompt = "You are a helpful AI assistant. Return only the content requested by the user."
) => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is required to generate AI responses.");
    }

    const response = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            {
                role: "user",
                content: prompt,
            },
        ],

        temperature: 0.7,
    });

    return response.choices[0].message.content;
};

export const generateEmail = async (prompt) => {
    return generateAIResponse(prompt, "You are a professional email writing assistant.");
};
