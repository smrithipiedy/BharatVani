/**
 * BharatVani — Main Lambda Orchestrator
 * Single Lambda that handles the full voice→AI→voice pipeline
 *
 * Supports TWO modes:
 *   1. Twilio: API Gateway → THIS LAMBDA (returns TwiML)
 *   2. Direct: Test events / Connect (returns JSON)
 */

import { createSession, getSession, updateSession, addToHistory } from './utils/session.mjs';
import { callBedrock } from './utils/bedrock.mjs';
import { sendOTP, verifyOTP, sendConfirmationSMS, generateOTP } from './utils/sms.mjs';
import { handleGovtScheme } from './handlers/govtSchemes.mjs';
import { handleFarmerQuery } from './handlers/farmerAssistant.mjs';
import { handleIncoming, handleGather } from './handlers/twilio.mjs';
import { parse } from 'querystring';

// Load welcome/error messages
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let welcomeMessages = null;
let errorResponses = null;

function loadMessages() {
    const searchPaths = [
        join(__dirname, '..', '..', 'knowledge-base', 'system'),
        join(__dirname, 'knowledge-base', 'system'),
        join('/var/task', 'knowledge-base', 'system')
    ];

    if (!welcomeMessages) {
        for (const dir of searchPaths) {
            try {
                welcomeMessages = JSON.parse(readFileSync(join(dir, 'welcome_messages.json'), 'utf-8'));
                break;
            } catch (e) { continue; }
        }
        if (!welcomeMessages) welcomeMessages = { welcome: { 'hi-IN': 'Namaste! BharatVani mein aapka swagat hai.' } };
    }
    if (!errorResponses) {
        for (const dir of searchPaths) {
            try {
                errorResponses = JSON.parse(readFileSync(join(dir, 'error_responses.json'), 'utf-8'));
                break;
            } catch (e) { continue; }
        }
        if (!errorResponses) errorResponses = { general_error: { 'hi-IN': 'Kuch gadbad ho gayi. Kripya dobara try karein.' } };
    }
}

/**
 * Main Lambda handler
 * Event structure from Amazon Connect:
 * {
 *   "Details": {
 *     "ContactData": {
 *       "CustomerEndpoint": { "Address": "+919876543210" },
 *       "ContactId": "contact-uuid",
 *       "Attributes": { "sessionId": "...", "userText": "..." }
 *     },
 *     "Parameters": {
 *       "action": "NEW_CALL" | "USER_INPUT" | "END_CALL",
 *       "userText": "...",
 *       "sessionId": "..."
 *     }
 *   }
 * }
 */
export async function handler(event) {
    console.log('BharatVani Event:', JSON.stringify(event, null, 2));

    loadMessages();

    // ========================================
    // MODE 1: API Gateway + Twilio webhooks
    // ========================================
    if (event.requestContext && (event.httpMethod || event.requestContext.http)) {
        return await handleTwilioEvent(event);
    }

    // ========================================
    // MODE 2: Direct invocation (test/Connect)
    // ========================================
    try {
        const contactData = event.Details?.ContactData || {};
        const params = event.Details?.Parameters || event;

        const action = params.action || 'USER_INPUT';
        const phoneNumber = contactData.CustomerEndpoint?.Address || params.phoneNumber || '+910000000000';
        const userText = params.userText || '';
        const sessionId = contactData.Attributes?.sessionId || params.sessionId || null;

        switch (action) {
            case 'NEW_CALL':
                return await handleNewCall(phoneNumber);

            case 'USER_INPUT':
                return await handleUserInput(sessionId, phoneNumber, userText);

            case 'END_CALL':
                return await handleEndCall(sessionId);

            default:
                return buildConnectResponse('Kuch gadbad ho gayi.', 'hi-IN', null, 'continue');
        }

    } catch (error) {
        console.error('Handler error:', error);
        return buildConnectResponse(
            errorResponses?.general_error?.['hi-IN'] || 'Kuch gadbad ho gayi. Kripya dobara call karein.',
            'hi-IN',
            null,
            'continue'
        );
    }
}

/**
 * Handle Twilio webhook events via API Gateway
 */
async function handleTwilioEvent(event) {
    try {
        const path = event.path || event.rawPath || event.requestContext?.http?.path || '';
        const body = event.isBase64Encoded
            ? Buffer.from(event.body, 'base64').toString('utf-8')
            : (event.body || '');
        const params = parse(body);
        const queryParams = event.queryStringParameters || {};

        console.log('Twilio path:', path, 'params:', JSON.stringify(params));

        let twimlResponse;

        if (path.includes('/voice/incoming')) {
            twimlResponse = await handleIncoming(params);
        } else if (path.includes('/voice/gather')) {
            const sessionId = queryParams.sessionId || '';
            twimlResponse = await handleGather(params, sessionId);
        } else {
            twimlResponse = `<?xml version="1.0" encoding="UTF-8"?><Response><Say language="hi-IN">BharatVani service active hai.</Say></Response>`;
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/xml' },
            body: twimlResponse
        };

    } catch (err) {
        console.error('Twilio handler error:', err);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/xml' },
            body: `<?xml version="1.0" encoding="UTF-8"?><Response><Say language="hi-IN" voice="Polly.Aditi">Maaf kijiye, kuch problem ho gayi.</Say></Response>`
        };
    }
}

/**
 * Handle new incoming call — create session, greet user
 */
async function handleNewCall(phoneNumber) {
    console.log(`New call from: ${phoneNumber}`);

    const { session, user } = await createSession(phoneNumber);
    const language = user?.language_preference || 'hi-IN';

    // Choose welcome message
    const greeting = user
        ? welcomeMessages?.welcome_returning?.[language] || welcomeMessages?.welcome?.[language]
        : welcomeMessages?.welcome?.[language] || 'Namaste! BharatVani mein aapka swagat hai. Aap kya jaanna chahte hain?';

    return buildConnectResponse(greeting, language, session.session_id, 'continue');
}

/**
 * Handle user's spoken input — the core conversation loop
 */
async function handleUserInput(sessionId, phoneNumber, userText) {
    if (!userText || userText.trim() === '') {
        return buildConnectResponse(
            errorResponses?.speech_not_understood?.['hi-IN'] || 'Maaf kijiye, samajh nahi aaya. Kripya dobara bataiye.',
            'hi-IN',
            sessionId,
            'continue'
        );
    }

    console.log(`User input [${sessionId}]: "${userText}"`);

    // Load or create session
    let session = sessionId ? await getSession(sessionId) : null;
    if (!session) {
        const result = await createSession(phoneNumber);
        session = result.session;
    }

    const language = session.language || 'hi-IN';

    // Add user's message to history
    const history = await addToHistory(session.session_id, 'user', userText);

    // Call Bedrock — SINGLE CALL for intent detection + response
    const aiResponse = await callBedrock(userText, session.conversation_history || [], language);

    console.log('AI Response:', JSON.stringify(aiResponse, null, 2));

    // Route based on intent
    let finalResponse = aiResponse;

    const intent = aiResponse.intent;
    const entities = aiResponse.entities || {};

    // For scheme and farmer intents, use dedicated handlers for richer responses
    if (intent === 'govt_scheme_info' || intent === 'govt_scheme_eligibility') {
        const schemeResult = await handleGovtScheme(intent, entities, session);
        if (schemeResult.response_text) {
            finalResponse.response_text = schemeResult.response_text;
        }
        if (schemeResult.sms_content) {
            finalResponse.sms_content = schemeResult.sms_content;
        }
    } else if (intent === 'crop_price' || intent === 'weather_forecast' || intent === 'farming_advice') {
        const farmResult = await handleFarmerQuery(intent, entities, session);
        if (farmResult.response_text) {
            finalResponse.response_text = farmResult.response_text;
        }
        if (farmResult.sms_content) {
            finalResponse.sms_content = farmResult.sms_content;
        }
    } else if (intent === 'end_call') {
        const goodbye = welcomeMessages?.goodbye?.[language] || 'Shukriya! Dobara call karein!';
        return buildConnectResponse(goodbye, language, session.session_id, 'end');
    }

    // Send SMS if there's content to send
    if (finalResponse.sms_content && phoneNumber !== '+910000000000') {
        await sendConfirmationSMS(phoneNumber, finalResponse.sms_content);
    }

    // Add AI response to history
    await addToHistory(session.session_id, 'assistant', finalResponse.response_text);

    // Update session state
    await updateSession(session.session_id, {
        current_intent: intent,
        current_module: getModuleFromIntent(intent),
        language: language
    });

    // Build the response text (use follow_up if present)
    let responseText = finalResponse.response_text;
    if (finalResponse.follow_up) {
        responseText += ` ${finalResponse.follow_up}`;
    }

    return buildConnectResponse(responseText, language, session.session_id, 'continue');
}

/**
 * Handle call end — cleanup session
 */
async function handleEndCall(sessionId) {
    if (sessionId) {
        const session = await getSession(sessionId);
        if (session) {
            await updateSession(sessionId, {
                ended_at: new Date().toISOString()
            });
            console.log(`Call ended: ${sessionId}, turns: ${session.conversation_history?.length || 0}`);
        }
    }

    return buildConnectResponse(null, 'hi-IN', sessionId, 'end');
}

/**
 * Build a response object for Amazon Connect
 */
function buildConnectResponse(responseText, language, sessionId, action) {
    return {
        statusCode: 200,
        response_text: responseText || '',
        language: language,
        session_id: sessionId,
        action: action, // 'continue' or 'end'
        // Amazon Connect specific attributes
        lambdaResult: {
            responseText: responseText || '',
            sessionId: sessionId,
            language: language,
            action: action
        }
    };
}

/**
 * Map intent to module name
 */
function getModuleFromIntent(intent) {
    const mapping = {
        'govt_scheme_info': 'govt_schemes',
        'govt_scheme_eligibility': 'govt_schemes',
        'crop_price': 'farmer_assistant',
        'weather_forecast': 'farmer_assistant',
        'farming_advice': 'farmer_assistant',
        'general_knowledge': 'general_qa'
    };

    return mapping[intent] || 'general_qa';
}
