import { jsPDF } from 'jspdf';

const PAGE_MARGIN = 20;
const LINE_HEIGHT = 6;
const SECTION_GAP = 10;

function addWrappedText(doc, text, x, y, maxWidth) {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * LINE_HEIGHT;
}

function ensureSpace(doc, y, neededHeight) {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + neededHeight > pageHeight - PAGE_MARGIN) {
        doc.addPage();
        return PAGE_MARGIN;
    }
    return y;
}

function addSectionTitle(doc, title, y, maxWidth) {
    y = ensureSpace(doc, y, LINE_HEIGHT * 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    y = addWrappedText(doc, title, PAGE_MARGIN, y, maxWidth);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    return y + 4;
}

function addBulletList(doc, items, y, maxWidth) {
    for (const item of items) {
        y = ensureSpace(doc, y, LINE_HEIGHT * 2);
        y = addWrappedText(doc, `• ${item}`, PAGE_MARGIN + 2, y, maxWidth - 2);
        y += 2;
    }
    return y;
}

export function downloadInterviewPrepPdf(prep, application) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const maxWidth = doc.internal.pageSize.getWidth() - PAGE_MARGIN * 2;
    let y = PAGE_MARGIN;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39);
    y = addWrappedText(doc, 'Interview Preparation Guide', PAGE_MARGIN, y, maxWidth);
    y += 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    y = addWrappedText(
        doc,
        `${application.companyName} — ${application.role}`,
        PAGE_MARGIN,
        y,
        maxWidth
    );
    y += SECTION_GAP;

    if (prep.topics?.length) {
        y = addSectionTitle(doc, 'Key Topics to Review', y, maxWidth);
        y = addBulletList(doc, prep.topics, y, maxWidth);
        y += SECTION_GAP;
    }

    if (prep.likelyQuestions?.length) {
        y = addSectionTitle(doc, `Likely Questions & Tips (${prep.likelyQuestions.length})`, y, maxWidth);

        prep.likelyQuestions.forEach((item, index) => {
            y = ensureSpace(doc, y, LINE_HEIGHT * 4);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(17, 24, 39);
            y = addWrappedText(doc, `${index + 1}. ${item.question}`, PAGE_MARGIN, y, maxWidth);
            y += 1;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(75, 85, 99);
            y = addWrappedText(doc, item.tip, PAGE_MARGIN + 4, y, maxWidth - 4);
            y += 6;
        });
        y += SECTION_GAP - 6;
    }

    if (prep.preparationTips?.length) {
        y = addSectionTitle(doc, 'Preparation Tips', y, maxWidth);
        y = addBulletList(doc, prep.preparationTips, y, maxWidth);
        y += SECTION_GAP;
    }

    if (prep.strengthsToHighlight?.length) {
        y = addSectionTitle(doc, 'Strengths to Highlight', y, maxWidth);
        y = addBulletList(doc, prep.strengthsToHighlight, y, maxWidth);
        y += SECTION_GAP;
    }

    if (prep.gapsToAddress?.length) {
        y = addSectionTitle(doc, 'Gaps to Address', y, maxWidth);
        y = addBulletList(doc, prep.gapsToAddress, y, maxWidth);
    }

    const safeCompany = application.companyName.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    const filename = `interview-prep-${safeCompany || 'application'}.pdf`;
    doc.save(filename);
}
