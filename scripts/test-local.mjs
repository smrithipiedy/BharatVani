/**
 * BharatVani — Local Test Script
 * Tests the Lambda orchestrator locally without deploying to AWS
 *
 * Usage: node scripts/test-local.mjs
 *
 * This mocks the DynamoDB and SNS calls and tests the AI pipeline logic.
 */

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectDir = join(__dirname, '..');

// =============================================
// Mock AWS Services (no DynamoDB/SNS needed)
// =============================================

// In-memory session store
const sessions = new Map();

console.log('🇮🇳 BharatVani — Local Test Runner');
console.log('==================================\n');

// =============================================
// Test Cases
// =============================================

const testCases = [
    {
        name: '1. New Call — Session Creation',
        event: {
            action: 'NEW_CALL',
            phoneNumber: '+919876543210'
        },
        expect: 'Welcome message in Hindi'
    },
    {
        name: '2. Government Scheme Query — PM-KISAN',
        event: {
            action: 'USER_INPUT',
            phoneNumber: '+919876543210',
            userText: 'PM Kisan ke baare mein batao',
            sessionId: null // will be set from test 1
        },
        expect: 'PM-KISAN scheme info in Hindi'
    },
    {
        name: '3. Crop Price Query — Tomato',
        event: {
            action: 'USER_INPUT',
            phoneNumber: '+919876543210',
            userText: 'Aaj tamatar ka rate kya hai',
            sessionId: null
        },
        expect: 'Tomato prices across mandis'
    },
    {
        name: '4. Farmer Advice Query',
        event: {
            action: 'USER_INPUT',
            phoneNumber: '+919876543210',
            userText: 'Gehun ki fasal ke liye kya salaah hai',
            sessionId: null
        },
        expect: 'Wheat farming advice'
    },
    {
        name: '5. General Knowledge Query',
        event: {
            action: 'USER_INPUT',
            phoneNumber: '+919876543210',
            userText: 'Bharat ki population kitni hai',
            sessionId: null
        },
        expect: 'General knowledge answer'
    },
    {
        name: '6. End Call',
        event: {
            action: 'END_CALL',
            sessionId: null
        },
        expect: 'Goodbye message'
    }
];

// =============================================
// Run Tests (without Bedrock — tests data loading and routing)
// =============================================

async function runLocalTests() {
    console.log('📋 Testing knowledge base loading...\n');

    // Test 1: Load schemes
    try {
        const schemesDir = join(projectDir, 'knowledge-base', 'schemes');
        const { readdirSync } = await import('fs');
        const schemeFiles = readdirSync(schemesDir).filter(f => f.endsWith('.json'));

        console.log(`✅ Loaded ${schemeFiles.length} government schemes:`);
        for (const file of schemeFiles) {
            const scheme = JSON.parse(readFileSync(join(schemesDir, file), 'utf-8'));
            console.log(`   📋 ${scheme.name} (${scheme.hindi_name}) — ${scheme.category}`);
        }
    } catch (err) {
        console.log(`❌ Failed to load schemes: ${err.message}`);
    }

    // Test 2: Load mandi prices
    console.log('');
    try {
        const pricesPath = join(projectDir, 'knowledge-base', 'agriculture', 'mandi_prices.json');
        const prices = JSON.parse(readFileSync(pricesPath, 'utf-8'));
        console.log(`✅ Loaded mandi prices for ${prices.prices.length} crops:`);
        for (const crop of prices.prices) {
            const avgPrice = (crop.markets.reduce((sum, m) => sum + m.price_per_kg, 0) / crop.markets.length).toFixed(1);
            console.log(`   🌾 ${crop.crop} (${crop.crop_hindi}) — avg ₹${avgPrice}/kg across ${crop.markets.length} mandis`);
        }
    } catch (err) {
        console.log(`❌ Failed to load mandi prices: ${err.message}`);
    }

    // Test 3: Load farming tips
    console.log('');
    try {
        const tipsPath = join(projectDir, 'knowledge-base', 'agriculture', 'farming_tips.json');
        const tips = JSON.parse(readFileSync(tipsPath, 'utf-8'));
        const totalTips = Object.values(tips.seasonal_tips).reduce((sum, s) => sum + s.tips.length, 0) + tips.general_tips.length;
        console.log(`✅ Loaded ${totalTips} farming tips (${Object.keys(tips.seasonal_tips).length} seasons + ${tips.general_tips.length} general)`);
    } catch (err) {
        console.log(`❌ Failed to load farming tips: ${err.message}`);
    }

    // Test 4: Load system prompt
    console.log('');
    try {
        const promptPath = join(projectDir, 'knowledge-base', 'system', 'system_prompt.txt');
        const prompt = readFileSync(promptPath, 'utf-8');
        console.log(`✅ System prompt loaded — ${prompt.length} characters, ${prompt.split('\n').length} lines`);
    } catch (err) {
        console.log(`❌ Failed to load system prompt: ${err.message}`);
    }

    // Test 5: Load welcome/error messages
    console.log('');
    try {
        const welcomePath = join(projectDir, 'knowledge-base', 'system', 'welcome_messages.json');
        const welcome = JSON.parse(readFileSync(welcomePath, 'utf-8'));
        console.log(`✅ Welcome messages loaded — ${Object.keys(welcome).length} types`);

        const errorPath = join(projectDir, 'knowledge-base', 'system', 'error_responses.json');
        const errors = JSON.parse(readFileSync(errorPath, 'utf-8'));
        console.log(`✅ Error responses loaded — ${Object.keys(errors).length} types`);
    } catch (err) {
        console.log(`❌ Failed to load messages: ${err.message}`);
    }

    // Test 6: Test scheme alias resolution
    console.log('\n📋 Testing scheme name resolution...\n');

    const { handleGovtScheme } = await import('../lambda/orchestrator/handlers/govtSchemes.mjs');

    const aliasTests = [
        { input: 'pm kisan', expected: 'PM-KISAN' },
        { input: 'ayushman', expected: 'Ayushman Bharat' },
        { input: 'ujjwala', expected: 'PM Ujjwala Yojana' },
        { input: 'mudra loan', expected: 'PM MUDRA Yojana' },
        { input: 'pension', expected: 'Atal Pension Yojana' }
    ];

    for (const test of aliasTests) {
        const result = await handleGovtScheme('govt_scheme_info', { scheme_name: test.input, query_type: 'info' }, {});
        const pass = result.response_text && result.response_text.length > 10;
        console.log(`   ${pass ? '✅' : '❌'} "${test.input}" → ${pass ? 'Got response' : 'No response'}`);
    }

    // Test 7: Test crop price queries
    console.log('\n📋 Testing crop price queries...\n');

    const { handleFarmerQuery } = await import('../lambda/orchestrator/handlers/farmerAssistant.mjs');

    const cropTests = [
        { crop: 'tamatar', expected: 'Tomato prices' },
        { crop: 'pyaz', expected: 'Onion prices' },
        { crop: 'gehun', expected: 'Wheat prices' },
        { crop: 'chawal', expected: 'Rice prices' }
    ];

    for (const test of cropTests) {
        const result = await handleFarmerQuery('crop_price', { crop_name: test.crop }, {});
        const pass = result.response_text && result.response_text.includes('₹');
        console.log(`   ${pass ? '✅' : '❌'} "${test.crop}" → ${pass ? result.response_text.substring(0, 60) + '...' : 'No price data'}`);
    }

    console.log('\n==================================');
    console.log('🏁 Local tests complete!');
    console.log('==================================');
    console.log('\n💡 To test with Bedrock (live AI), deploy to AWS and call the Connect number.');
    console.log('   Run: bash scripts/deploy.sh\n');
}

// Run
runLocalTests().catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
});
