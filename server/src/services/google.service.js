import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import userModel from '../models/user.model.js';
import { getGoogleOAuthClient, GOOGLE_SCOPES, isGoogleConfigured } from '../config/google.js';

function getFrontendRedirectUrl() {
    return process.env.CLIENT_URL || 'http://localhost:5173';
}

export function getAppGmailClient() {
    const oauth2Client = getGoogleOAuthClient();

    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
    });

    return google.gmail({
        version: 'v1',
        auth: oauth2Client
    });
}

// Build the Google consent URL for the authenticated user so Google can return
// an authorization code that the backend exchanges for tokens.
export function buildGoogleAuthUrl(userId) {
    if (!isGoogleConfigured()) {
        throw new Error('Google OAuth is not configured.');
    }

    const oauth2Client = getGoogleOAuthClient();
    const state = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '10m' });

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: GOOGLE_SCOPES,
        state
    });
}

export function verifyGoogleState(state) {
    if (!state) {
        throw new Error('Missing OAuth state.');
    }

    return jwt.verify(state, process.env.JWT_SECRET);
}

// Exchange the OAuth code for Google tokens and persist the connection details
// on the authenticated user's record.
export async function connectGoogleAccount(code, state) {
    const { userId } = verifyGoogleState(state);
    const user = await userModel.findById(userId);

    if (!user) {
        throw new Error('User not found.');
    }

    const oauth2Client = getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const profileResponse = await oauth2.userinfo.get();

    user.google = {
        ...user.google,
        connected: true,
        email: profileResponse.data.email,
        accessToken: tokens.access_token || null,
        refreshToken: tokens.refresh_token || user.google?.refreshToken || null,
        expiryDate: tokens.expiry_date || null
    };

    await user.save();
    return user;
}

export async function createInterviewCalendarEvent(user, application) {
    if (!user?.google?.connected || !user?.google?.refreshToken) {
        return null;
    }

    if (application.googleEventId) {
        return application.googleEventId;
    }

    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
        access_token: user.google.accessToken,
        refresh_token: user.google.refreshToken,
        expiry_date: user.google.expiryDate
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const eventStart = application.interviewDate ? new Date(application.interviewDate) : new Date();
    const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);
    const timeZone = process.env.GOOGLE_CALENDAR_TIMEZONE || 'UTC';

    const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
            summary: `Interview - ${application.companyName}`,
            description: `Interview for ${application.role} at ${application.companyName}`,
            start: {
                dateTime: eventStart.toISOString(),
                timeZone
            },
            end: {
                dateTime: eventEnd.toISOString(),
                timeZone
            }
        }
    });

    application.googleEventId = response.data.id;
    await application.save();
    return response.data.id;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function emphasizeText(html, phrases = []) {
    return phrases.reduce((result, phrase) => {
        if (!phrase) return result;

        return result.replace(new RegExp(`\\b(${escapeRegExp(escapeHtml(phrase))})\\b`, 'gi'), '<em>$1</em>');
    }, html);
}

function textToEmailHtml(body, emphasis = []) {
    return escapeHtml(body)
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.replace(/\n/g, '<br>'))
        .map((paragraph) => emphasizeText(paragraph, emphasis))
        .map((paragraph) => `<p style="margin:0 0 14px;line-height:1.55;">${paragraph}</p>`)
        .join('');
}

function encodeMessage({ from, to, subject, body, html }) {
    const message = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: ${html ? 'text/html' : 'text/plain'}; charset="UTF-8"`,
        '',
        html || body
    ].join('\r\n');

    return Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function sendAppGmailMessage({
    to,
    subject,
    body,
    html
}) {
    const gmail = getAppGmailClient();

    const response = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodeMessage({
                from: process.env.EMAIL_USER,
                to,
                subject,
                body,
                html
            })
        }
    });

    return response.data;
}

export async function sendGmailMessage(user, { to, subject, body, emphasis = [] }) {
    if (!user?.google?.connected || !user?.google?.refreshToken) {
        throw new Error('Connect Google before sending recruiter emails.');
    }

    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
        access_token: user.google.accessToken,
        refresh_token: user.google.refreshToken,
        expiry_date: user.google.expiryDate
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodeMessage({
                from: user.google.email || user.email,
                to,
                subject,
                body,
                html: textToEmailHtml(body, emphasis)
            })
        }
    });

    return response.data;
}

export async function getGoogleStatus(user) {
    return {
        connected: Boolean(user.google?.connected),
        email: user.google?.email || null
    };
}

export async function disconnectGoogleAccount(user) {
    const oauth2Client = getGoogleOAuthClient();
    const tokenToRevoke = user.google?.accessToken || user.google?.refreshToken;

    if (tokenToRevoke) {
        try {
            await oauth2Client.revokeToken(tokenToRevoke);
        } catch (error) {
            console.warn('Could not revoke Google token:', error.message);
        }
    }

    user.google = {
        connected: false,
        email: null,
        accessToken: null,
        refreshToken: null,
        expiryDate: null
    };

    await user.save();
    return { connected: false };
}

export function getGoogleCallbackRedirectUrl() {
    return `${getFrontendRedirectUrl()}/dashboard`;
}
