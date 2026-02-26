/**
 * BharatVani — SMS Utility
 * OTP generation, verification, and confirmation SMS via SNS
 */

import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { randomInt } from 'crypto';

const snsClient = new SNSClient({
    region: process.env.AWS_REGION || 'ap-south-1'
});

/**
 * Generate a 4-digit OTP
 */
export function generateOTP() {
    return randomInt(1000, 9999).toString();
}

/**
 * Send OTP via SMS
 */
export async function sendOTP(phoneNumber, otp) {
    const message = `BharatVani OTP: ${otp}. Ye OTP 5 minute mein expire hoga. Kripya kisi ko na bataayein. (Valid for 5 minutes. Do not share.)`;

    try {
        await snsClient.send(new PublishCommand({
            PhoneNumber: phoneNumber,
            Message: message,
            MessageAttributes: {
                'AWS.SNS.SMS.SenderID': {
                    DataType: 'String',
                    StringValue: 'BharatVani'
                },
                'AWS.SNS.SMS.SMSType': {
                    DataType: 'String',
                    StringValue: 'Transactional'
                }
            }
        }));

        return { success: true };
    } catch (err) {
        console.error('SMS send failed:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Send confirmation SMS after successful transaction
 */
export async function sendConfirmationSMS(phoneNumber, content) {
    try {
        await snsClient.send(new PublishCommand({
            PhoneNumber: phoneNumber,
            Message: `✅ BharatVani: ${content}`,
            MessageAttributes: {
                'AWS.SNS.SMS.SenderID': {
                    DataType: 'String',
                    StringValue: 'BharatVani'
                },
                'AWS.SNS.SMS.SMSType': {
                    DataType: 'String',
                    StringValue: 'Transactional'
                }
            }
        }));

        return { success: true };
    } catch (err) {
        console.error('Confirmation SMS failed:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Verify user-spoken OTP against stored OTP
 * Returns: { verified: boolean, attemptsRemaining: number }
 */
export function verifyOTP(spokenOTP, storedOTP, currentAttempts, maxAttempts = 3) {
    // Clean the spoken OTP — user might say "4-8-3-2" or "4832" or "four eight three two"
    const cleaned = spokenOTP.replace(/[^0-9]/g, '');

    if (cleaned === storedOTP) {
        return { verified: true, attemptsRemaining: maxAttempts - currentAttempts };
    }

    return {
        verified: false,
        attemptsRemaining: maxAttempts - (currentAttempts + 1)
    };
}
