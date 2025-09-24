
import { handleWhatsappCheckin, askAI } from '@/app/actions';
import { sendWhatsappMessage } from '@/services/sms';
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const checkinCodeRegex = /CHECKIN-([a-zA-Z0-9-]+)-\d+/;

async function getUserIdFromPhone(phone: string): Promise<string | null> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phone', '==', phone.replace('whatsapp:+', '')));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
    }
    return null;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const from = data.get('From') as string;
    const to = data.get('To') as string;
    const body = data.get('Body') as string;

    if (!from || !to || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const isCheckin = checkinCodeRegex.test(body);

    if (isCheckin) {
        // The handleWhatsappCheckin action now takes care of user creation/lookup.
        const result = await handleWhatsappCheckin({ From: from, Body: body, To: to });

        if (result.error) {
          console.error('Webhook Check-in Error:', result.error);
          // We don't send a response to avoid loops, but log it.
          return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } else {
        // Handle the AI chatbot flow
        const userId = await getUserIdFromPhone(from);

        if (!userId) {
            await sendWhatsappMessage(from, "Welcome! It looks like you're new here. Please check-in at a partner business to get started.");
            return new Response(null, { status: 204 });
        }
        
        const aiResult = await askAI({ query: body, userId });
        
        if (aiResult.error) {
            console.error('Webhook AI Error:', aiResult.error);
            await sendWhatsappMessage(from, "Sorry, I had trouble processing that request. Please try again.");
        } else {
            await sendWhatsappMessage(from, aiResult.response || "Sorry, I couldn't come up with a response.");
        }
    }
    
    // Twilio expects a 200 OK response with an empty body or TwiML
    // to acknowledge receipt and prevent sending an error message to the user.
    return new Response(null, { status: 204 });


  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
