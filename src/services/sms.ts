
'use server';

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const fromWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

function getClient() {
  if (!accountSid || !authToken) {
    console.error('SMS/WhatsApp not sent. Twilio credentials are not set in the environment.');
    // In a real app, you would throw an error or handle this more gracefully.
    return null;
  }
  return twilio(accountSid, authToken);
}

export async function sendSms(to: string, body: string) {
  const twilioClient = getClient();
  if (!twilioClient || !fromPhoneNumber) {
    return { success: false, error: 'Twilio SMS credentials are not configured.' };
  }

  try {
    // Ensure 'to' number is in E.164 format
    const toE164 = to.startsWith('+') ? to : `+${to}`;
    const message = await twilioClient.messages.create({
      body,
      from: fromPhoneNumber,
      to: toE164,
    });
    console.log('SMS sent successfully. SID:', message.sid);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function sendWhatsappMessage(to: string, body: string, mediaUrl?: string) {
  const twilioClient = getClient();
  if (!twilioClient || !fromWhatsappNumber) {
    return { success: false, error: 'Twilio WhatsApp credentials are not configured.' };
  }

  try {
    // For WhatsApp, the 'from' and 'to' numbers must be prefixed with 'whatsapp:'
    const fromPrefixed = fromWhatsappNumber.startsWith('whatsapp:') ? fromWhatsappNumber : `whatsapp:${fromWhatsappNumber}`;
    const toPrefixed = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    const messageData: any = {
      body,
      from: fromPrefixed,
      to: toPrefixed,
    };
    
    if (mediaUrl) {
      messageData.mediaUrl = [mediaUrl];
    }

    const message = await twilioClient.messages.create(messageData);
    console.log('WhatsApp message sent successfully. SID:', message.sid);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error: (error as Error).message };
  }
}
