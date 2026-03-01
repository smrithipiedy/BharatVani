/**
 * BharatVani — Twilio Voice Handler
 * Generates TwiML responses for Twilio voice webhooks
 */

import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { callBedrock } from '../utils/bedrock.mjs';
import { createSession, getSession, updateSession } from '../utils/session.mjs';

const pollyClient = new PollyClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });

const KB_BUCKET = process.env.KB_BUCKET || 'bharatvani-knowledge-base';
const AUDIO_BUCKET = process.env.AUDIO_BUCKET || KB_BUCKET;

/**
 * Generate TwiML XML string
 */
function twiml(content) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
${content}
</Response>`;
}

/**
 * Generate Polly audio → upload to S3 → return public URL
 */
async function textToSpeechUrl(text, sessionId) {
    try {
        const command = new SynthesizeSpeechCommand({
            Text: text,
            OutputFormat: 'mp3',
            VoiceId: 'Aditi',  // Hindi voice
            Engine: 'standard',
            LanguageCode: 'hi-IN'
        });

        const pollyResponse = await pollyClient.send(command);

        // Read the audio stream
        const chunks = [];
        for await (const chunk of pollyResponse.AudioStream) {
            chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);

        // Upload to S3
        const key = `audio/${sessionId}/${Date.now()}.mp3`;
        await s3Client.send(new PutObjectCommand({
            Bucket: AUDIO_BUCKET,
            Key: key,
            Body: audioBuffer,
            ContentType: 'audio/mpeg',
            ACL: 'public-read'
        }));

        return `https://${AUDIO_BUCKET}.s3.ap-south-1.amazonaws.com/${key}`;
    } catch (err) {
        console.error('Polly/S3 error:', err.message);
        return null;
    }
}

/**
 * Handle incoming call — greet and listen
 */
export async function handleIncoming(params) {
    const phoneNumber = params.From || params.Caller || '+unknown';
    console.log('Twilio incoming call from:', phoneNumber);

    // Create session
    const { session } = await createSession(phoneNumber);
    const sessionId = session.session_id;

    // Welcome message
    const welcomeText = 'Namaste! BharatVani mein aapka swagat hai. ' +
        'Main aapki kya madad kar sakti hoon? ' +
        'Aap sarkari yojana, fasal ki keemat, ya kheti ke baare mein pooch sakte hain.';

    const audioUrl = await textToSpeechUrl(welcomeText, sessionId);

    if (audioUrl) {
        return twiml(`
    <Play>${audioUrl}</Play>
    <Gather input="speech" language="hi-IN" speechTimeout="3" timeout="5" action="/voice/gather?sessionId=${sessionId}" method="POST">
        <Say language="hi-IN" voice="Polly.Aditi">Kripya boliye...</Say>
    </Gather>
    <Say language="hi-IN" voice="Polly.Aditi">Maaf kijiye, mujhe kuch sunai nahi diya. Kripya dobara call karein. Dhanyavaad!</Say>
`);
    }

    // Fallback: use Twilio's built-in TTS
    return twiml(`
    <Say language="hi-IN" voice="Polly.Aditi">${welcomeText}</Say>
    <Gather input="speech" language="hi-IN" speechTimeout="3" timeout="5" action="/voice/gather?sessionId=${sessionId}" method="POST">
        <Say language="hi-IN" voice="Polly.Aditi">Kripya boliye...</Say>
    </Gather>
    <Say language="hi-IN" voice="Polly.Aditi">Maaf kijiye, mujhe kuch sunai nahi diya. Dhanyavaad!</Say>
`);
}

/**
 * Handle speech input — process through AI and respond
 */
export async function handleGather(params, sessionId) {
    const speechResult = params.SpeechResult || '';
    const phoneNumber = params.From || params.Caller || '+unknown';
    const confidence = parseFloat(params.Confidence || '0');

    console.log(`Speech received: "${speechResult}" (confidence: ${confidence}, session: ${sessionId})`);

    // If no speech detected
    if (!speechResult || speechResult.trim() === '') {
        return twiml(`
    <Gather input="speech" language="hi-IN" speechTimeout="3" timeout="5" action="/voice/gather?sessionId=${sessionId}" method="POST">
        <Say language="hi-IN" voice="Polly.Aditi">Maaf kijiye, mujhe sunai nahi diya. Kripya dobara boliye.</Say>
    </Gather>
    <Say language="hi-IN" voice="Polly.Aditi">Koi baat nahi, aap kabhi bhi dobara call kar sakte hain. Dhanyavaad!</Say>
`);
    }

    // Check for goodbye/end words
    const endWords = ['bye', 'goodbye', 'alvida', 'dhanyavaad', 'thank you', 'bas', 'band karo'];
    if (endWords.some(w => speechResult.toLowerCase().includes(w))) {
        const goodbyeText = 'Dhanyavaad! BharatVani mein aapka swagat hai. Kripya kabhi bhi call karein. Jai Hind!';
        return twiml(`
    <Say language="hi-IN" voice="Polly.Aditi">${goodbyeText}</Say>
    <Hangup/>
`);
    }

    try {
        // Get session history
        let session = await getSession(sessionId);
        const conversationHistory = session?.conversation_history || [];

        // Call Bedrock AI
        const aiResponse = await callBedrock(speechResult, conversationHistory, 'hi-IN');
        const responseText = aiResponse.response_text || 'Maaf kijiye, mujhe samajh nahi aaya. Kripya dobara boliye.';

        console.log('AI Response:', responseText);

        // Update session history
        if (session) {
            const updatedHistory = [
                ...conversationHistory,
                { role: 'user', text: speechResult },
                { role: 'assistant', text: responseText }
            ].slice(-10); // Keep last 10 turns

            await updateSession(sessionId, {
                conversation_history: updatedHistory,
                last_intent: aiResponse.intent,
                turn_count: (session.turn_count || 0) + 1
            });
        }

        // Generate Polly audio for the response
        const audioUrl = await textToSpeechUrl(responseText, sessionId);

        if (audioUrl) {
            return twiml(`
    <Play>${audioUrl}</Play>
    <Gather input="speech" language="hi-IN" speechTimeout="3" timeout="5" action="/voice/gather?sessionId=${sessionId}" method="POST">
        <Say language="hi-IN" voice="Polly.Aditi">Aur kuch poochna hai?</Say>
    </Gather>
    <Say language="hi-IN" voice="Polly.Aditi">Dhanyavaad! Kripya kabhi bhi call karein.</Say>
`);
        }

        // Fallback: use Twilio's built-in TTS
        return twiml(`
    <Say language="hi-IN" voice="Polly.Aditi">${responseText}</Say>
    <Gather input="speech" language="hi-IN" speechTimeout="3" timeout="5" action="/voice/gather?sessionId=${sessionId}" method="POST">
        <Say language="hi-IN" voice="Polly.Aditi">Aur kuch poochna hai?</Say>
    </Gather>
    <Say language="hi-IN" voice="Polly.Aditi">Dhanyavaad! Kripya kabhi bhi call karein.</Say>
`);

    } catch (err) {
        console.error('Error processing speech:', err);
        return twiml(`
    <Say language="hi-IN" voice="Polly.Aditi">Maaf kijiye, kuch problem ho gayi. Kripya dobara try karein.</Say>
    <Gather input="speech" language="hi-IN" speechTimeout="3" timeout="5" action="/voice/gather?sessionId=${sessionId}" method="POST">
        <Say language="hi-IN" voice="Polly.Aditi">Kripya boliye...</Say>
    </Gather>
`);
    }
}
