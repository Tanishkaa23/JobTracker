import { PDFParse } from 'pdf-parse';

const MAX_TEXT_LENGTH = 12000;

function truncateText(text) {
    if (!text) return '';
    const trimmed = text.replace(/\s+/g, ' ').trim();
    return trimmed.length > MAX_TEXT_LENGTH
        ? `${trimmed.slice(0, MAX_TEXT_LENGTH)}...`
        : trimmed;
}

async function extractPdfText(buffer) {
    const parser = new PDFParse({ data: buffer });
    try {
        const result = await parser.getText();
        return truncateText(result.text);
    } finally {
        await parser.destroy();
    }
}

export async function extractTextFromFile(file) {
    if (!file?.buffer) {
        throw new Error('No file provided.');
    }

    const mimeType = file.mimetype || '';
    const fileName = (file.originalname || '').toLowerCase();

    if (mimeType === 'text/plain' || fileName.endsWith('.txt')) {
        return truncateText(file.buffer.toString('utf8'));
    }

    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return extractPdfText(file.buffer);
    }

    throw new Error('Unsupported file type. Upload a .txt or .pdf file.');
}

export function mergeTextSources(...sources) {
    return truncateText(
        sources
            .filter(Boolean)
            .map((value) => value.trim())
            .join('\n\n')
    );
}
