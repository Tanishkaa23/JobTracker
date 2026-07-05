import dotenv from 'dotenv';
import { sendAppGmailMessage } from './google.service.js';
dotenv.config();


function formatDate(value) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


export async function sendRegEmail(userEmail, name) {
  const subject = 'Job Tracker: Registration Confirmation';
  const text = `Dear ${name},\n\nWelcome to Job Tracker. Your account has been successfully created.\n\nWe are delighted to assist you in managing your career opportunities and job applications effectively. You can now log in to your dashboard to start tracking your applications.\n\nShould you have any questions or require support, please do not hesitate to contact our team.\n\nBest Regards,\nThe Job Tracker Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <h2 style="color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px;">Welcome to Job Tracker</h2>
      <p>Dear ${escapeHtml(name)},</p>
      <p>Your account has been successfully created. We are delighted to assist you in managing your career opportunities and job applications effectively.</p>
      <p>You can now log in to your dashboard to start tracking your applications.</p>
      <p>Should you have any questions or require support, please do not hesitate to contact our team.</p>
      <br>
      <p>Best Regards,</p>
      <p><strong>The Job Tracker Team</strong></p>
    </div>
  `;

  await sendAppGmailMessage({
    to: userEmail,
    subject,
    body: text,
    html
});
}

export async function sendStaleApplicationReminderEmail(userEmail, userName, applications) {
  const subject = 'Job Tracker: Action Required for Inactive Applications';
  const rows = applications
    .map((application) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">${escapeHtml(application.companyName)}</td>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">${escapeHtml(application.role)}</td>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">${escapeHtml(application.status)}</td>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">${escapeHtml(formatDate(application.updatedAt || application.createdAt))}</td>
      </tr>
    `)
    .join('');

  const text = `Dear ${userName},\n\nThis is an automated notification regarding your job applications that have remained inactive for an extended period. We highly recommend reviewing the following applications and following up with the respective organizations:\n\n${applications.map((application) => `- ${application.companyName} (${application.role})`).join('\n')}\n\nPlease log in to your Job Tracker dashboard at your earliest convenience to update their statuses.\n\nBest Regards,\nThe Job Tracker Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #333; line-height: 1.6;">
      <h2 style="color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px;">Application Status Update Required</h2>
      <p>Dear ${escapeHtml(userName)},</p>
      <p>This is an automated notification regarding your job applications that have remained inactive for an extended period. We highly recommend reviewing the following applications and following up with the respective organizations:</p>
      <table style="border-collapse: collapse; width: 100%; margin-top: 16px; margin-bottom: 16px;">
        <thead>
          <tr>
            <th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f8f9fa; text-align: left;">Company</th>
            <th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f8f9fa; text-align: left;">Role</th>
            <th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f8f9fa; text-align: left;">Status</th>
            <th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f8f9fa; text-align: left;">Last Updated</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p>Please log in to your Job Tracker dashboard at your earliest convenience to update their statuses.</p>
      <br>
      <p>Best Regards,</p>
      <p><strong>The Job Tracker Team</strong></p>
    </div>
  `;

    await sendAppGmailMessage({
      to: userEmail,
      subject,
      body: text,
      html
    });;
}

export async function sendWeeklyApplicationReportEmail(userEmail, userName, applications) {
  const subject = 'Job Tracker: Your Weekly Application Status Report';
  const csvRows = [
    ['Company', 'Role', 'Status', 'Applied Date', 'Interview Date', 'Last Updated'],
    ...applications.map((application) => [
      application.companyName,
      application.role,
      application.status,
      formatDate(application.appliedDate),
      formatDate(application.interviewDate),
      formatDate(application.updatedAt || application.createdAt)
    ])
  ];

  const csvContent = csvRows.map((row) => row.join(',')).join('\n');
  const attachments = [{
    filename: 'job-tracker-weekly-report.csv',
    content: csvContent,
    contentType: 'text/csv'
  }];

  const statusSummary = applications.reduce((summary, application) => {
    summary[application.status] = (summary[application.status] || 0) + 1;
    return summary;
  }, {});

  const rows = applications
    .map((application) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">${escapeHtml(application.companyName)}</td>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">${escapeHtml(application.role)}</td>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">${escapeHtml(application.status)}</td>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">${escapeHtml(formatDate(application.interviewDate))}</td>
      </tr>
    `)
    .join('');

  const summaryRows = Object.entries(statusSummary)
    .map(([status, count]) => `<li style="margin-bottom: 4px;"><strong>${escapeHtml(status)}:</strong> ${count}</li>`)
    .join('');

  const text = `Dear ${userName},\n\nPlease find attached your weekly job application status report.\n\nThis report summarizes your recent activity and current application statuses.\n\nSummary of Application Statuses:\n${Object.entries(statusSummary).map(([status, count]) => `- ${status}: ${count}`).join('\n')}\n\nA detailed CSV report is attached for your reference.\n\nBest Regards,\nThe Job Tracker Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #333; line-height: 1.6;">
      <h2 style="color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px;">Weekly Application Status Report</h2>
      <p>Dear ${escapeHtml(userName)},</p>
      <p>Please find attached your weekly job application status report. This report summarizes your recent activity and current application statuses.</p>
      
      <h3 style="color: #34495e; margin-top: 20px;">Summary of Application Statuses:</h3>
      <ul style="background-color: #f8f9fa; padding: 15px 15px 15px 35px; border-radius: 4px; border: 1px solid #e9ecef;">
        ${summaryRows}
      </ul>

      <h3 style="color: #34495e; margin-top: 20px;">Applications:</h3>
      <table style="border-collapse: collapse; width: 100%; margin-top: 12px; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f8f9fa; text-align: left;">Company</th>
            <th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f8f9fa; text-align: left;">Role</th>
            <th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f8f9fa; text-align: left;">Status</th>
            <th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f8f9fa; text-align: left;">Interview Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      
      <p style="background-color: #e8f4f8; padding: 12px; border-radius: 4px; border-left: 4px solid #3498db;">
        <strong>Note:</strong> A comprehensive CSV report is attached to this email for your detailed review.
      </p>
      <br>
      <p>Best Regards,</p>
      <p><strong>The Job Tracker Team</strong></p>
    </div>
  `;

    await sendAppGmailMessage({
      to: userEmail,
      subject,
      body: text,
      html
    });
}
