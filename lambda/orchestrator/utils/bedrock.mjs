/**
 * BharatVani — Bedrock AI Client
 * Single-call intent detection + response generation
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'ap-south-1'
});

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1'
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0';
const KB_BUCKET = process.env.KB_BUCKET || 'bharatvani-knowledge-base';

// Cache for system prompt and knowledge base
let cachedSystemPrompt = null;
let cachedSchemes = null;
let cachedMandiPrices = null;
let cachedFarmingTips = null;

/**
 * Load system prompt from local file (packaged with Lambda)
 */
function loadSystemPrompt() {
    if (cachedSystemPrompt) return cachedSystemPrompt;

    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const promptPath = join(__dirname, '..', '..', '..', 'knowledge-base', 'system', 'system_prompt.txt');
        cachedSystemPrompt = readFileSync(promptPath, 'utf-8');
    } catch (err) {
        // Fallback: minimal system prompt
        cachedSystemPrompt = 'You are BharatVani, a helpful AI voice assistant for Indian citizens. Respond in Hindi. Keep responses under 30 words. Always return JSON with intent, response_text, and entities fields.';
    }

    return cachedSystemPrompt;
}

/**
 * Load all scheme data from S3 (or local files)
 */
async function loadSchemes() {
    if (cachedSchemes) return cachedSchemes;

    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const schemesDir = join(__dirname, '..', '..', '..', 'knowledge-base', 'schemes');
        const { readdirSync } = await import('fs');
        const files = readdirSync(schemesDir).filter(f => f.endsWith('.json'));

        cachedSchemes = {};
        for (const file of files) {
            const data = JSON.parse(readFileSync(join(schemesDir, file), 'utf-8'));
            cachedSchemes[data.id] = data;
        }
    } catch (err) {
        console.warn('Could not load schemes from local files, trying S3...', err.message);
        cachedSchemes = {};
    }

    return cachedSchemes;
}

/**
 * Load mandi prices
 */
async function loadMandiPrices() {
    if (cachedMandiPrices) return cachedMandiPrices;

    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const pricesPath = join(__dirname, '..', '..', '..', 'knowledge-base', 'agriculture', 'mandi_prices.json');
        cachedMandiPrices = JSON.parse(readFileSync(pricesPath, 'utf-8'));
    } catch (err) {
        console.warn('Could not load mandi prices:', err.message);
        cachedMandiPrices = { prices: [] };
    }

    return cachedMandiPrices;
}

/**
 * Load farming tips
 */
async function loadFarmingTips() {
    if (cachedFarmingTips) return cachedFarmingTips;

    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const tipsPath = join(__dirname, '..', '..', '..', 'knowledge-base', 'agriculture', 'farming_tips.json');
        cachedFarmingTips = JSON.parse(readFileSync(tipsPath, 'utf-8'));
    } catch (err) {
        console.warn('Could not load farming tips:', err.message);
        cachedFarmingTips = { seasonal_tips: {}, general_tips: [] };
    }

    return cachedFarmingTips;
}

/**
 * Build the full prompt with context
 */
async function buildPrompt(userText, conversationHistory, language) {
    const systemPrompt = loadSystemPrompt();
    const schemes = await loadSchemes();
    const mandiPrices = await loadMandiPrices();
    const farmingTips = await loadFarmingTips();

    // Build scheme summaries for context injection
    const schemeSummaries = Object.values(schemes).map(s =>
        `${s.name} (${s.hindi_name}): ${s.hindi_summary}`
    ).join('\n');

    // Build mandi price summary
    const priceSummary = mandiPrices.prices?.map(p =>
        `${p.crop} (${p.crop_hindi}): ${p.markets.map(m => `${m.city}: ₹${m.price_per_kg}/kg`).join(', ')}`
    ).join('\n') || '';

    // Replace placeholders in system prompt
    let finalPrompt = systemPrompt
        .replace('{SCHEME_CONTEXT}', `\n## Available Government Schemes:\n${schemeSummaries}`)
        .replace('{AGRICULTURE_CONTEXT}', `\n## Today's Mandi Prices:\n${priceSummary}`);

    // Add conversation history
    const historyText = conversationHistory.map(h =>
        `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`
    ).join('\n');

    if (historyText) {
        finalPrompt += `\n\n## Conversation History:\n${historyText}`;
    }

    finalPrompt += `\n\nUser's language: ${language}`;

    return finalPrompt;
}

/**
 * Call Bedrock with the user's message — single call for intent + response
 */
export async function callBedrock(userText, conversationHistory = [], language = 'hi-IN') {
    const systemPrompt = await buildPrompt(userText, conversationHistory, language);

    const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 500,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
            {
                role: 'user',
                content: userText
            }
        ]
    };

    try {
        const command = new InvokeModelCommand({
            modelId: MODEL_ID,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(payload)
        });

        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        // Extract the text content from Bedrock's response
        const textContent = responseBody.content?.[0]?.text || '{}';

        // Parse the structured JSON response
        try {
            // Try to find JSON in the response (Claude sometimes wraps in markdown)
            const jsonMatch = textContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (parseErr) {
            console.warn('Could not parse Bedrock response as JSON:', parseErr.message);
        }

        // Fallback: return a general response
        return {
            intent: 'general_knowledge',
            confidence: 0.5,
            category: 'INFORMATION',
            entities: {},
            needs_verification: false,
            response_text: textContent.substring(0, 200),
            follow_up: null,
            sms_content: null
        };

    } catch (err) {
        console.error('Bedrock call failed:', err);
        return {
            intent: 'error',
            confidence: 0,
            category: 'NAVIGATION',
            entities: {},
            needs_verification: false,
            response_text: language === 'en-IN'
                ? 'Sorry, I could not process your request. Please try again.'
                : 'Maaf kijiye, aapki request process nahi ho payi. Kripya dobara try karein.',
            follow_up: null,
            sms_content: null
        };
    }
}

/**
 * Get detailed scheme data for deep queries
 */
export async function getSchemeDetails(schemeId) {
    const schemes = await loadSchemes();
    return schemes[schemeId] || null;
}
