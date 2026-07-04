import multer from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const interviewPrepUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter(_req, file, cb) {
        const fileName = (file.originalname || '').toLowerCase();
        const allowed =
            file.mimetype === 'application/pdf' ||
            file.mimetype === 'text/plain' ||
            fileName.endsWith('.pdf') ||
            fileName.endsWith('.txt');

        if (!allowed) {
            cb(new Error('Only .pdf and .txt files are supported.'));
            return;
        }

        cb(null, true);
    }
}).fields([
    { name: 'jobDescriptionFile', maxCount: 1 },
    { name: 'resumeFile', maxCount: 1 }
]);
