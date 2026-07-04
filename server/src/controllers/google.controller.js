import {
    buildGoogleAuthUrl,
    connectGoogleAccount,
    disconnectGoogleAccount,
    getGoogleCallbackRedirectUrl,
    getGoogleStatus
} from '../services/google.service.js';

export async function connectGoogle(req, res) {
    try {
        const authUrl = buildGoogleAuthUrl(req.user._id.toString());
        return res.redirect(authUrl);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to start Google connection.',
            error: error.message
        });
    }
}

export async function handleGoogleCallback(req, res) {
    try {
        const { code, state, error } = req.query;

        if (error) {
            return res.redirect(`${getGoogleCallbackRedirectUrl()}?google=error`);
        }

        if (!code || !state) {
            return res.redirect(`${getGoogleCallbackRedirectUrl()}?google=error`);
        }

        await connectGoogleAccount(code, state);
        return res.redirect(`${getGoogleCallbackRedirectUrl()}?google=connected`);
    } catch (error) {
        return res.redirect(`${getGoogleCallbackRedirectUrl()}?google=error`);
    }
}

export async function getGoogleConnectionStatus(req, res) {
    try {
        const status = await getGoogleStatus(req.user);
        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).json({
            message: 'Could not retrieve Google connection status.',
            error: error.message
        });
    }
}

export async function disconnectGoogle(req, res) {
    try {
        const status = await disconnectGoogleAccount(req.user);
        return res.status(200).json({
            message: 'Google account disconnected successfully.',
            ...status
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Could not disconnect Google account.',
            error: error.message
        });
    }
}
