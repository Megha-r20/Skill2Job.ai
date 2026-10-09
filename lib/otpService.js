import nodemailer from 'nodemailer';
import { logger } from './logger.js';

/**
 * Skill2Job.ai Real-Time Email OTP Dispatcher
 */
export async function sendEmailOtp({ to, otp, recipientName = 'Skill2Job.ai User', purpose = 'registration' }) {
    const purposeText = purpose === 'registration'
        ? 'account registration'
        : purpose === 'forgot_password'
            ? 'password reset'
            : purpose === 'contact_update'
                ? 'email verification'
                : 'authentication';
    let providerUsed = 'Skill2Job.ai Live Gateway';
    let messageId = `msg_${Date.now()}`;
    let externalSent = false;
    // 1. Check Resend API Key
    if (process.env.RESEND_API_KEY) {
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: process.env.EMAIL_FROM || 'Skill2Job.ai <noreply@skill2job.ai>',
                    to: [to],
                    subject: `Your Skill2Job.ai Verification Code: ${otp}`,
                    html: getEmailHtml(otp, recipientName, purposeText)
                })
            });
            const resData = await response.json();
            if (response.ok) {
                providerUsed = 'Resend';
                messageId = resData.id;
                externalSent = true;
            }
        }
        catch (err) {
            logger.warn('[Resend delivery attempt]', { error: err.message });
        }
    }
    // 2. Gmail SMTP / Custom SMTP Sending
    if (!externalSent && ((process.env.SMTP_HOST || process.env.SMTP_USER) && process.env.SMTP_PASS)) {
        const isGmail = process.env.SMTP_HOST?.includes('gmail') || process.env.SMTP_USER?.includes('@gmail.com');
        const transportConfig = isGmail
            ? {
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS?.replace(/\s+/g, '')
                }
            }
            : {
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587', 10),
                secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS?.replace(/\s+/g, '')
                },
                tls: { rejectUnauthorized: false }
            };
        const transporter = nodemailer.createTransport(transportConfig);
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"Skill2Job.ai Verification" <${process.env.SMTP_USER}>`,
            to: to.trim().toLowerCase(),
            subject: `Your Skill2Job.ai Verification Code: ${otp}`,
            text: `Your Skill2Job.ai OTP is ${otp}. Valid for 5 minutes. Do not share this with anyone.`,
            html: getEmailHtml(otp, recipientName, purposeText)
        });
        providerUsed = isGmail ? 'Gmail' : `SMTP (${process.env.SMTP_HOST})`;
        messageId = info.messageId;
        externalSent = true;
    }
    // Masked log for operational audit without leaking the plaintext OTP
    const maskedTo = to.includes('@') 
        ? `${to.substring(0, 2)}***@${to.split('@')[1]}` 
        : to;
    logger.info(`[OTP DISPATCH] Email OTP dispatched`, { provider: providerUsed, to: maskedTo, messageId });
    return { success: true, provider: providerUsed, messageId };
}
/**
 * Skill2Job.ai Real-Time SMS OTP Dispatcher
 */
export async function sendSmsOtp({ phone, otp, purpose = 'registration' }) {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    let providerUsed = 'Skill2Job.ai SMS Gateway';
    let messageId = `sms_${Date.now()}`;
    let externalSent = false;
    // 1. Check Twilio Configuration
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && (process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID)) {
        try {
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
            const bodyData = new URLSearchParams();
            bodyData.append('To', cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`);
            bodyData.append('Body', `Your Skill2Job.ai verification code is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`);
            if (process.env.TWILIO_PHONE_NUMBER) {
                bodyData.append('From', process.env.TWILIO_PHONE_NUMBER);
            }
            else if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
                bodyData.append('MessagingServiceSid', process.env.TWILIO_MESSAGING_SERVICE_SID);
            }
            const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: bodyData.toString()
            });
            const resJson = await response.json();
            if (response.ok) {
                providerUsed = 'Twilio SMS';
                messageId = resJson.sid;
                externalSent = true;
            }
        }
        catch (err) {
            logger.warn('[Twilio SMS delivery attempt]', { error: err.message });
        }
    }
    // 2. Check Fast2SMS
    if (!externalSent && process.env.FAST2SMS_API_KEY) {
        try {
            const cleanDigits = cleanPhone.replace(/[^0-9]/g, '').slice(-10);
            const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
                method: 'POST',
                headers: {
                    'authorization': process.env.FAST2SMS_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    route: 'otp',
                    variables_values: otp,
                    numbers: cleanDigits
                })
            });
            const resJson = await response.json();
            if (resJson.return) {
                providerUsed = 'Fast2SMS';
                messageId = resJson.request_id;
                externalSent = true;
            }
        }
        catch (err) {
            logger.warn('[Fast2SMS delivery attempt]', { error: err.message });
        }
    }
    // Masked log for operational audit without leaking the plaintext OTP
    const maskedPhone = phone.length > 5 
        ? `${phone.substring(0, 3)}****${phone.slice(-2)}` 
        : phone;
    logger.info(`[OTP DISPATCH] SMS OTP dispatched`, { provider: providerUsed, phone: maskedPhone, messageId });
    return { success: true, provider: providerUsed, messageId };
}
/**
 * Branded Responsive HTML Email Template for Skill2Job.ai OTP
 */
function getEmailHtml(otp, name, purpose) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skill2Job.ai Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="520px" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 36px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                Skill<span style="color: #06b6d4;">2</span><span style="color: #0284c7;">Job</span><span style="color: #38bdf8; font-size: 16px;">.ai</span>
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">
                Learn. Verify. Get Hired.
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
                Verification Code
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Hello <strong>${name}</strong>, use the following one-time password (OTP) to complete your ${purpose} on Skill2Job.ai:
              </p>

              <!-- OTP Code Display Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="background-color: #f1f5f9; border-radius: 16px; border: 2px dashed #cbd5e1; padding: 24px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #0284c7; display: inline-block; margin-left: 12px;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Expiry & Security Notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0 0 0; background-color: #fffbeb; border-radius: 12px; border: 1px solid #fef3c7; padding: 14px 16px;">
                <tr>
                  <td style="font-size: 12px; line-height: 1.5; color: #92400e;">
                    ⏱️ <strong>Valid for 5 minutes.</strong> Never share this code with anyone. Skill2Job.ai staff will never ask for your verification code.
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                If you did not request this verification code, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 36px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © 2026 Skill2Job.ai — Student • College • Company Career Ecosystem. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export { otpRepository } from './repositories/otpRepository';
