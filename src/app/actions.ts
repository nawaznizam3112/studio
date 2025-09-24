

'use server';

import 'dotenv/config';
import { aiStylistTrainerChatbot } from '@/ai/flows/ai-stylist-trainer-chatbot';
import { db } from '@/lib/firebase';
import { addDoc, collection, getDocs, Timestamp, query, where, doc, updateDoc, getDoc, serverTimestamp, increment, setDoc, deleteDoc, collectionGroup, orderBy, runTransaction,getCountFromServer } from 'firebase/firestore';
import { z } from 'zod';
import { subMonths, format, startOfDay, differenceInDays, addDays } from 'date-fns';
import { toDate, format as formatTz } from 'date-fns-tz';
import { v4 as uuidv4 } from 'uuid';
import { sendSms, sendWhatsappMessage } from '@/services/sms';


// New action to handle WhatsApp check-ins from Twilio webhook
export async function handleWhatsappCheckin(webhookData: { From: string, Body: string, To: string }) {
    const { From: customerPhone, Body: message, To: businessWhatsapp } = webhookData;
    
    // 1. Parse the message to find the businessId
    const checkinCodeRegex = /CHECKIN-([a-zA-Z0-9-]+)-\d+/;
    const match = message.match(checkinCodeRegex);
    if (!match) {
        console.log("Not a valid check-in message:", message);
        // Optional: Send a generic "I didn't understand" reply
        return { error: "Invalid check-in code in message." };
    }
    const businessId = match[1];

    try {
        // 2. Find or create the customer
        const usersRef = collection(db, 'users');
        const plainPhoneNumber = customerPhone.replace('whatsapp:+', '');
        const customerQuery = query(usersRef, where('phone', '==', plainPhoneNumber));
        const customerSnapshot = await getDocs(customerQuery);
        let customerId: string;
        let customerName: string;

        if (customerSnapshot.empty) {
            // Create a new guest user
            customerId = uuidv4();
            customerName = "New Customer";
            await setDoc(doc(db, 'users', customerId), {
                name: customerName,
                phone: plainPhoneNumber,
                role: 'customer',
                isGuest: true,
                createdAt: serverTimestamp(),
            });
        } else {
            customerId = customerSnapshot.docs[0].id;
            customerName = customerSnapshot.docs[0].data().name;
        }

        // 3. Generate a token
        const token = await generateToken(businessId);
        
        // 4. Record the service (check-in)
        await recordService({
            businessId,
            userId: customerId,
            service: 'WhatsApp Check-in',
            requestToken: false, // Token is generated manually above
        }, token); // Pass the generated token

        // 5. Send automated responses
        const businessSnap = await getDoc(doc(db, 'businesses', businessId));
        const businessData = businessSnap.exists() ? businessSnap.data() : { name: 'the business', phone: null };
        const businessName = businessData.name;

        // WhatsApp confirmation to customer
        const whatsappBody = `Thanks for checking in, ${customerName}! Your token is *#${token}*. Please take a seat, we'll be with you soon.`;
        await sendWhatsappMessage(customerPhone, whatsappBody);
        
        // SMS notification to business owner
        if (businessData.phone) {
            const businessSmsBody = `New WhatsApp Check-in: ${customerName} has checked in. Token: #${token}.`;
            await sendSms(businessData.phone, businessSmsBody);
        }

        return { success: true, token };

    } catch (error) {
        console.error("Error handling WhatsApp check-in:", error);
        return { error: 'Failed to process WhatsApp check-in.' };
    }
}


// AI Chatbot Action
const askAISchema = z.object({
  query: z.string().min(1, 'Query cannot be empty.'),
  userId: z.string().min(1, 'User ID is required.'),
  quizResults: z.any().optional(),
});

export async function askAI(input: { query: string, userId: string, quizResults?: any }) {
  const validatedInput = askAISchema.safeParse(input);
  if (!validatedInput.success) {
    return { error: 'Invalid input.' };
  }
  
  try {
    const result = await aiStylistTrainerChatbot(validatedInput.data);
    return { response: result.response };
  } catch (error) {
    console.error('AI Chatbot Error:', error);
    return { error: 'An error occurred while communicating with the AI.' };
  }
}

// Service History Action for AI Tool & Customer Dashboard
export async function getServiceHistory(userId: string): Promise<{ history: any[], error?: string }> {
    if (!userId) {
        return { history: [], error: 'User ID is required.' };
    }
    try {
        const historyCollectionRef = collection(db, `users/${userId}/serviceHistory`);
        const historyQuery = query(historyCollectionRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(historyQuery);
        
        const history = snapshot.docs.map(doc => {
            const data = doc.data();
            const serviceDate = data.date.toDate();
            return {
                id: doc.id,
                ...data,
                type: data.industry || 'General',
                date: serviceDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' }),
                sortDate: serviceDate,
            };
        });

        return { history };
    } catch (error) {
        console.error("Error fetching service history:", error);
        return { history: [], error: "Failed to fetch history." };
    }
}


// Auth Actions
const signupCustomerSchema = z.object({
    name: z.string().min(1, "Name is required."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    phone: z.string().min(10, "A valid phone number is required."),
});

export async function signupUser(formData: FormData) {
    const validatedFields = signupCustomerSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
    });

    if (!validatedFields.success) {
        return { error: "Invalid form data.", issues: validatedFields.error.issues };
    }

    const { name, email, password, phone } = validatedFields.data;

    try {
        const userQuery = query(collection(db, 'users'), where('email', '==', email));
        const existingUser = await getDocs(userQuery);
        if (!existingUser.empty) {
            return { error: "A user with this email already exists." };
        }
        
        const phoneQuery = query(collection(db, 'users'), where('phone', '==', phone));
        const existingPhone = await getDocs(phoneQuery);
        if (!existingPhone.empty) {
            return { error: "A user with this phone number already exists." };
        }

        // Generate a new unique ID for the user
        const newUserId = uuidv4();
        const userDocRef = doc(db, 'users', newUserId);

        await setDoc(userDocRef, {
            name,
            email,
            phone,
            password, // In a real app, hash this!
            role: 'customer',
            shareCount: 0,
        });
        
        return { success: true, message: 'Customer account created successfully!' };
    } catch (error) {
        console.error("Error signing up user:", error);
        return { error: 'Failed to create account.' };
    }
}

export async function loginUser(formData: FormData) {
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!phone && !email) {
        return { success: false, error: 'Phone number or email is required.' };
    }

    try {
        const usersRef = collection(db, 'users');
        let q;

        if (phone) {
            q = query(usersRef, where('phone', '==', phone));
        } else {
            q = query(usersRef, where('email', '==', email));
        }
        
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: false, error: 'No account found with this credential.' };
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // If a password is provided (password login flow), validate it.
        // If not (OTP flow), we can skip this check as OTP is the validation.
        if (password && userData.password !== password) {
            return { success: false, error: 'Invalid password.' };
        }

        const role = userData.role || 'customer';
        const businessId = role === 'business' ? userData.businessId : undefined;
        const name = userData.name || 'User';

        return { success: true, role, userId: userDoc.id, name, businessId };

    } catch (error) {
        console.error("Login Error:", error);
        return { success: false, error: 'An error occurred during login.' };
    }
}


const guestLoginSchema = z.object({
  name: z.string().min(1, "Name is required."),
  phone: z.string().min(10, "A valid phone number is required."),
});

export async function guestLoginOrSignup(formData: FormData) {
    const validatedFields = guestLoginSchema.safeParse({
        name: formData.get('name'),
        phone: formData.get('phone'),
    });

    if (!validatedFields.success) {
        return { error: "Invalid form data.", issues: validatedFields.error.issues };
    }

    const { name, phone } = validatedFields.data;

    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phone', '==', phone));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // User exists, log them in
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            return { 
                success: true, 
                role: userData.role || 'customer', 
                userId: userDoc.id, 
                name: userData.name,
                businessId: userData.businessId
            };
        } else {
            // User doesn't exist, create a new guest account
            const newUserId = uuidv4();
            await setDoc(doc(db, 'users', newUserId), {
                name,
                phone,
                email: null, // Guests don't have email/password
                password: null,
                role: 'customer',
                shareCount: 0,
                isGuest: true,
            });
            return { 
                success: true, 
                role: 'customer', 
                userId: newUserId, 
                name: name,
            };
        }
    } catch (error) {
        console.error("Guest login/signup error:", error);
        return { error: "An error occurred during guest access." };
    }
}


// Customer Actions
const recordServiceSchema = z.object({
    businessId: z.string().min(1),
    userId: z.string().min(1),
    service: z.string().min(1),
    preConsultationNotes: z.string().optional(),
    quizResults: z.any().optional(),
    requestToken: z.boolean(),
});

async function generateToken(businessId: string): Promise<number> {
    const nowInIST = toDate(new Date(), { timeZone: 'Asia/Kolkata' });
    const today = formatTz(nowInIST, 'yyyy-MM-dd', { timeZone: 'Asia/Kolkata' });
    const tokenCounterRef = doc(db, `businesses/${businessId}/dailyTokens`, today);

    try {
        const newTokenNumber = await runTransaction(db, async (transaction) => {
            const tokenCounterSnap = await transaction.get(tokenCounterRef);
            
            if (!tokenCounterSnap.exists()) {
                transaction.set(tokenCounterRef, { count: 1 });
                return 1;
            } else {
                const newCount = tokenCounterSnap.data().count + 1;
                transaction.update(tokenCounterRef, { count: newCount });
                return newCount;
            }
        });
        return newTokenNumber;
    } catch (error) {
        console.error("Token generation transaction failed: ", error);
        throw new Error("Could not generate a token.");
    }
}


export async function recordService(input: z.infer<typeof recordServiceSchema>, providedToken?: number | null) {
    const validation = recordServiceSchema.safeParse(input);
    if (!validation.success) {
        return { error: 'Invalid input for recording service.' };
    }
    const { businessId, userId, service, preConsultationNotes, quizResults, requestToken } = validation.data;

    try {
        const businessSnap = await getDoc(doc(db, 'businesses', businessId));
        if (!businessSnap.exists()) {
            return { error: "Business not found." };
        }
        const businessData = businessSnap.data();
        const industry = businessData.industry;

        if (!industry) {
            return { error: "Business does not have a specified industry." };
        }

        let token: number | null = providedToken || null;
        if (!token && requestToken) {
            token = await generateToken(businessId);
        }
        
        const historyCollectionRef = collection(db, `users/${userId}/serviceHistory`);
        await addDoc(historyCollectionRef, {
            userId: userId, 
            service: service,
            token: token,
            businessName: businessData.name,
            businessId: businessId,
            industry: industry,
            promoLinkUrl: businessData.promoLinkUrl || null,
            preConsultationNotes: preConsultationNotes || null,
            quizResults: quizResults || null,
            date: new Date(),
            details: `Completed ${service} at ${businessData.name}`,
            status: 'Ongoing' // New status field for the workflow
        });

        if (businessData.phone && service !== 'WhatsApp Check-in') {
            const customerSnap = await getDoc(doc(db, 'users', userId));
            const customerName = customerSnap.exists() ? customerSnap.data().name : 'A customer';
            const message = token 
                ? `New Check-in: ${customerName} checked in for '${service}' and was assigned token #${token}.`
                : `New Check-in: ${customerName} checked in for '${service}'.`;
            await sendSms(businessData.phone, message);
        }

        const loyaltyRef = doc(db, 'loyalty', userId);
        const loyaltySnap = await getDoc(loyaltyRef);
        if (loyaltySnap.exists()) {
            await updateDoc(loyaltyRef, {
                points: increment(10)
            });
        } else {
            await setDoc(loyaltyRef, {
                userId: userId,
                points: 10,
                pointsToNextReward: 100,
                nextReward: "15% off coupon"
            });
        }

        return { success: true, token: token };
    } catch (error) {
        console.error("Error recording service:", error);
        return { error: "Failed to record service." };
    }
}

export async function recordShare(userId: string) {
    if (!userId) {
        return { error: 'User ID is required.' };
    }
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            shareCount: increment(1)
        });
        return { success: true };
    } catch (error) {
        console.error("Error recording share:", error);
        return { error: 'Failed to record share.' };
    }
}


export async function getAllActiveCampaigns() {
    try {
        const now = new Date();
        const businessesSnapshot = await getDocs(collection(db, 'businesses'));
        const businessMap = new Map(businessesSnapshot.docs.map(doc => [doc.id, doc.data().name]));

        const campaignsQuery = query(collection(db, 'campaigns'), where('status', '==', 'active'));
        const campaignsSnapshot = await getDocs(campaignsQuery);
        
        const validCampaigns: any[] = [];
        for (const campaignDoc of campaignsSnapshot.docs) {
            const campaignData = campaignDoc.data();
            
            if (campaignData.expiresAt && campaignData.expiresAt.toDate() > now) {
                const businessName = businessMap.get(campaignData.businessId) || 'A business';
                
                validCampaigns.push({
                    id: campaignDoc.id,
                    title: campaignData.title,
                    description: campaignData.description,
                    reward: campaignData.reward,
                    businessName: businessName,
                    businessId: campaignData.businessId,
                    expiresAt: campaignData.expiresAt.toDate().toISOString(),
                });
            }
        }
        
        return { campaigns: validCampaigns };
    } catch (error) {
        console.error("Error fetching active campaigns:", error);
        return { campaigns: [], error: 'Failed to fetch campaigns.' };
    }
}

export async function getAllActiveOffers() {
    try {
        const now = new Date();

        // Step 1: Fetch all businesses and create a map for quick lookup.
        const businessesSnapshot = await getDocs(collection(db, 'businesses'));
        const businessMap = new Map(businessesSnapshot.docs.map(doc => [doc.id, doc.data().name]));

        // Step 2: Fetch all offers. Filtering by date happens in the next step.
        const offersQuery = query(collection(db, 'offers'), where('status', '==', 'active'));
        const offersSnapshot = await getDocs(offersQuery);
        
        // Step 3: Filter and map offers in memory.
        const validOffers: any[] = [];
        for (const offerDoc of offersSnapshot.docs) {
            const offerData = offerDoc.data();
            
            if (offerData.expiresAt && offerData.expiresAt.toDate() > now) {
                const businessName = businessMap.get(offerData.businessId) || 'A business';
                
                validOffers.push({
                    id: offerDoc.id,
                    title: offerData.title,
                    description: offerData.description,
                    businessName: businessName,
                    businessId: offerData.businessId,
                    pointsRequired: offerData.pointsRequired || 0,
                    expiresAt: offerData.expiresAt.toDate().toISOString(),
                });
            }
        }
        
        return { offers: validOffers };
    } catch (error) {
        console.error("Error fetching active offers:", error);
        return { offers: [], error: 'Failed to fetch offers. Please check a composite index is created in Firestore.' };
    }
}


const redeemOfferSchema = z.object({
  userId: z.string().min(1),
  offerId: z.string().min(1),
  businessId: z.string().min(1),
  title: z.string().min(1),
  price: z.number().min(0),
});

export async function redeemOffer(input: z.infer<typeof redeemOfferSchema>) {
    const validation = redeemOfferSchema.safeParse(input);
    if (!validation.success) {
        return { error: 'Invalid booking data.' };
    }
    const { userId, businessId, title, price } = validation.data;

    try {
        const businessSnap = await getDoc(doc(db, 'businesses', businessId));
        if (!businessSnap.exists()) {
            return { error: 'Business not found' };
        }
        const businessData = businessSnap.data();
        const businessName = businessData.name || "A business";

        // This function now just records a booking as a lead.
        // It no longer deducts points.
        const historyCollectionRef = collection(db, `users/${userId}/serviceHistory`);
        await addDoc(historyCollectionRef, {
            userId,
            businessId,
            businessName,
            service: `Booked: ${title}`,
            industry: businessData.industry || 'General',
            date: new Date(),
            details: `Booked '${title}' for ₹${price} at ${businessName}.`,
            isRedemption: true // Keep this flag to identify it as a special activity
        });
        
        // Send SMS to business owner
        if (businessData.phone) {
            const customerSnap = await getDoc(doc(db, 'users', userId));
            const customerName = customerSnap.exists() ? customerSnap.data().name : 'A customer';
            const message = `New Booking: ${customerName} has booked your offer: "${title}". Please contact them to schedule.`;
            await sendSms(businessData.phone, message);
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error booking offer:", error);
        return { error: error.message || 'Failed to book offer.' };
    }
}


const submitFeedbackSchema = z.object({
  userId: z.string().min(1),
  businessId: z.string().min(1),
  rating: z.number().min(1).max(5),
  tip: z.number().min(0),
  comment: z.string().optional(),
});


export async function submitFeedback(input: z.infer<typeof submitFeedbackSchema>) {
  const validation = submitFeedbackSchema.safeParse(input);
  if (!validation.success) {
    return { error: 'Invalid feedback data.' };
  }

  try {
    const feedbackData = {
      ...validation.data,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'feedback'), feedbackData);

    return { success: true };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { error: 'Failed to submit feedback.' };
  }
}

const updateUserProfileSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1, "Name is required."),
  phone: z.string().optional(),
});

export async function updateUserProfile(formData: FormData) {
    const validatedFields = updateUserProfileSchema.safeParse({
        userId: formData.get('userId'),
        name: formData.get('name'),
        phone: formData.get('phone'),
    });

    if (!validatedFields.success) {
        return { error: "Invalid form data.", issues: validatedFields.error.issues };
    }

    try {
        const userRef = doc(db, 'users', validatedFields.data.userId);
        await updateDoc(userRef, {
            name: validatedFields.data.name,
            phone: validatedFields.data.phone,
        });
        return { success: true, message: 'Profile updated successfully!' };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { error: 'Failed to update profile.' };
    }
}

const changeUserPasswordSchema = z.object({
    userId: z.string().min(1),
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
});

export async function changeUserPassword(formData: FormData) {
    const validatedFields = changeUserPasswordSchema.safeParse({
        userId: formData.get('userId'),
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
    });

    if (!validatedFields.success) {
        return { error: "Invalid form data.", issues: validatedFields.error.issues };
    }

    const { userId, currentPassword, newPassword } = validatedFields.data;

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return { error: "User not found." };
        }

        const userData = userSnap.data();
        // In a real app, passwords would be hashed and compared securely.
        if (userData.password !== currentPassword) {
            return { error: "Incorrect current password." };
        }

        await updateDoc(userRef, { password: newPassword });

        return { success: true, message: 'Password changed successfully!' };
    } catch (error) {
        console.error("Error changing password:", error);
        return { error: 'Failed to change password.' };
    }
}

export async function deleteUserAccount(userId: string) {
    if (!userId) {
        return { error: 'User ID is required.' };
    }

    try {
        // This is a simplified deletion. A real-world scenario would involve
        // deleting associated data across multiple collections, which can be complex.
        await deleteDoc(doc(db, 'users', userId));
        return { success: true, message: 'Account deleted successfully.' };
    } catch (error) {
        console.error("Error deleting user account:", error);
        return { error: 'Failed to delete account.' };
    }
}


// Admin Actions

const addCreditsSchema = z.object({
  businessId: z.string().min(1),
  amount: z.coerce.number().int().min(1, "Amount must be at least 1."),
});

export async function addMessageCredits(formData: FormData) {
  const validatedFields = addCreditsSchema.safeParse({
    businessId: formData.get('businessId'),
    amount: formData.get('amount'),
  });

  if (!validatedFields.success) {
    return { error: "Invalid data.", issues: validatedFields.error.issues };
  }
  
  const { businessId, amount } = validatedFields.data;

  try {
    const businessRef = doc(db, 'businesses', businessId);
    await updateDoc(businessRef, {
        message_credits: increment(amount)
    });
    return { success: true, message: `${amount} credits added successfully!` };
  } catch (error) {
    console.error("Error adding message credits:", error);
    return { error: 'Failed to add credits.' };
  }
}

const createIndustrySchema = z.object({
  name: z.string().min(1, 'Industry name cannot be empty.'),
});
export async function createIndustry(formData: FormData) {
    const validatedFields = createIndustrySchema.safeParse({
        name: formData.get('industry-name'),
    });

    if (!validatedFields.success) {
        return { error: 'Invalid industry name.' };
    }

    try {
        await addDoc(collection(db, 'industries'), {
            name: validatedFields.data.name,
        });
        return { success: true, message: 'Industry created successfully!' };
    } catch (error) {
        console.error("Error creating industry:", error);
        return { error: 'Failed to create industry.' };
    }
}

const registerBusinessSchema = z.object({
    name: z.string().min(1, "Business name is required."),
    industry: z.string().min(1, "Industry is required."),
    ownerEmail: z.string().email("Invalid email address."),
    ownerName: z.string().min(1, "Owner's name is required."),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters."),
    promoLinkUrl: z.string().url("Invalid URL.").optional().or(z.literal('')),
    introVideoUrl: z.string().url("Invalid URL.").optional().or(z.literal('')),
    promoVideoUrl: z.string().url("Invalid URL.").optional().or(z.literal('')),
});

export async function registerBusiness(formData: FormData) {
    const validatedFields = registerBusinessSchema.safeParse({
        name: formData.get('business-name'),
        industry: formData.get('industry'),
        ownerEmail: formData.get('owner-email'),
        ownerName: formData.get('owner-name'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        promoLinkUrl: formData.get('promoLinkUrl'),
        introVideoUrl: formData.get('introVideoUrl'),
        promoVideoUrl: formData.get('promoVideoUrl'),
    });

    if (!validatedFields.success) {
        return { error: "Invalid form data.", issues: validatedFields.error.issues };
    }
    
    const { name, industry, ownerEmail, ownerName, phone, password, promoLinkUrl, introVideoUrl, promoVideoUrl } = validatedFields.data;

    try {
        // Check if a user with this email already exists
        const userQuery = query(collection(db, 'users'), where('email', '==', ownerEmail));
        const existingUser = await getDocs(userQuery);
        if (!existingUser.empty) {
            return { error: "A user with this email already exists." };
        }

        // Add business to 'businesses' collection
        const businessDocRef = await addDoc(collection(db, 'businesses'), {
            name,
            industry,
            ownerEmail,
            ownerName,
            phone,
            promoLinkUrl,
            introVideoUrl,
            promoVideoUrl,
            qrStatus: 'inactive',
            welcomeJourneyActive: true,
            message_credits: 100, // Grant 100 free credits on registration
            createdAt: serverTimestamp(),
        });

        // Use a unique ID for the user document
        const newUserId = uuidv4();
        
        // Add user to 'users' collection with the business ID
        await setDoc(doc(db, 'users', newUserId), {
            email: ownerEmail,
            // In a real app, NEVER store plain text passwords. Always hash them.
            password: password, 
            name: ownerName,
            phone: phone || null, // Also add phone to user for login
            role: 'business',
            businessId: businessDocRef.id,
        });

        return { success: true, message: 'Business and owner account registered successfully!' };
    } catch (error) {
        console.error("Error registering business:", error);
        return { error: 'Failed to register business.' };
    }
}

const updateBusinessSchema = z.object({
    name: z.string().min(1, "Business name is required."),
    industry: z.string().min(1, "Industry is required."),
    ownerEmail: z.string().email("Invalid email address."),
    ownerName: z.string().min(1, "Owner's name is required."),
    phone: z.string().optional(),
    promoLinkUrl: z.string().url("Invalid URL.").optional().or(z.literal('')),
    introVideoUrl: z.string().url("Invalid URL.").optional().or(z.literal('')),
    promoVideoUrl: z.string().url("Invalid URL.").optional().or(z.literal('')),
});

export async function updateBusiness(businessId: string, formData: FormData) {
    if (!businessId) {
        return { error: "Business ID is missing." };
    }

    const validatedFields = updateBusinessSchema.safeParse({
        name: formData.get('business-name'),
        industry: formData.get('industry'),
        ownerEmail: formData.get('owner-email'),
        ownerName: formData.get('owner-name'),
        phone: formData.get('phone'),
        promoLinkUrl: formData.get('promoLinkUrl'),
        introVideoUrl: formData.get('introVideoUrl'),
        promoVideoUrl: formData.get('promoVideoUrl'),
    });

    if (!validatedFields.success) {
        return { error: "Invalid form data." };
    }
    
    const businessData = { ...validatedFields.data };

    try {
        const businessRef = doc(db, 'businesses', businessId);
        // Ensure the phone number is explicitly included in the update for the business document.
        await updateDoc(businessRef, {
            name: businessData.name,
            industry: businessData.industry,
            ownerEmail: businessData.ownerEmail,
            ownerName: businessData.ownerName,
            phone: businessData.phone || null,
            promoLinkUrl: businessData.promoLinkUrl,
            introVideoUrl: businessData.introVideoUrl,
            promoVideoUrl: businessData.promoVideoUrl,
        });
        
        // Also update the owner's user document if phone number changes
        const userQuery = query(collection(db, 'users'), where('email', '==', businessData.ownerEmail));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
            const userDocRef = userSnapshot.docs[0].ref;
            await updateDoc(userDocRef, {
                phone: businessData.phone || null,
            });
        }

        return { success: true, message: 'Business updated successfully!' };
    } catch (error) {
        console.error("Error updating business:", error);
        return { error: 'Failed to update business.' };
    }
}

export async function toggleBusinessStatus(businessId: string, currentStatus: 'active' | 'inactive') {
    if (!businessId) {
        return { error: "Business ID is missing." };
    }

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
        const businessRef = doc(db, 'businesses', businessId);
        await updateDoc(businessRef, { qrStatus: newStatus });
        return { success: true, message: `Business status updated to ${newStatus}.` };
    } catch (error) {
        console.error("Error updating business status:", error);
        return { error: 'Failed to update business status.' };
    }
}

export async function deleteBusiness(businessId: string) {
    if (!businessId) {
        return { error: "Business ID is missing." };
    }

    try {
        const businessRef = doc(db, 'businesses', businessId);
        const businessSnap = await getDoc(businessRef);
        if (!businessSnap.exists()) {
            return { error: "Business not found." };
        }
        const businessData = businessSnap.data();

        // Delete business document
        await deleteDoc(businessRef);

        // Find and delete the associated user account
        if (businessData.ownerEmail) {
            const userQuery = query(collection(db, 'users'), where('email', '==', businessData.ownerEmail));
            const userSnapshot = await getDocs(userQuery);
            if (!userSnapshot.empty) {
                const userDocRef = userSnapshot.docs[0].ref;
                await deleteDoc(userDocRef);
            }
        }

        return { success: true, message: 'Business and associated user account deleted successfully.' };
    } catch (error) {
        console.error("Error deleting business:", error);
        return { error: 'Failed to delete business.' };
    }
}


export async function getIndustries() {
    try {
        const querySnapshot = await getDocs(collection(db, "industries"));
        const industries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as { name: string } }));
        return { industries };
    } catch (error) {
        console.error("Error fetching industries:", error);
        return { error: 'Failed to fetch industries.' };
    }
}

export async function getBusinesses() {
    try {
        const querySnapshot = await getDocs(collection(db, "businesses"));
        const businesses = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                industry: data.industry,
                ownerName: data.ownerName,
                ownerEmail: data.ownerEmail,
                phone: data.phone,
                qrStatus: data.qrStatus || 'inactive',
                promoLinkUrl: data.promoLinkUrl || '',
                introVideoUrl: data.introVideoUrl || '',
                promoVideoUrl: data.promoVideoUrl || '',
                message_credits: data.message_credits || 0,
            };
        });
        return { businesses };
    } catch (error) {
        console.error("Error fetching businesses:", error);
        return { error: 'Failed to fetch businesses.' };
    }
}

export async function getBusinessById(businessId: string) {
    try {
        if (!businessId) {
            return { error: 'Business ID is required.' };
        }
        const businessRef = doc(db, 'businesses', businessId);
        const businessSnap = await getDoc(businessRef);

        if (!businessSnap.exists()) {
            return { error: 'Business not found.' };
        }

        const businessData = businessSnap.data();
        return {
            business: {
                id: businessSnap.id,
                name: businessData.name,
                industry: businessData.industry,
                ownerName: businessData.ownerName,
                ownerEmail: businessData.ownerEmail,
                phone: businessData.phone,
                qrStatus: businessData.qrStatus,
                promoLinkUrl: businessData.promoLinkUrl || '',
                introVideoUrl: businessData.introVideoUrl || '',
                promoVideoUrl: businessData.promoVideoUrl || '',
                welcomeJourneyActive: businessData.welcomeJourneyActive,
                message_credits: businessData.message_credits,
            }
        };
    } catch (error) {
        console.error("Error fetching business by ID:", error);
        return { error: 'Failed to fetch business details.' };
    }
}

export async function getDashboardStats() {
    try {
        const industriesSnapshot = await getDocs(collection(db, "industries"));
        const allBusinessesSnapshot = await getDocs(collection(db, "businesses"));
        const customersQuery = query(collection(db, 'users'), where('role', '==', 'customer'));
        const customersSnapshot = await getCountFromServer(customersQuery);


        // --- Real-time business growth analytics ---
        const sixMonthsAgo = subMonths(new Date(), 5);
        sixMonthsAgo.setDate(1); // Start from the beginning of the month
        
        const businessGrowthData = Array(6).fill(0).map((_, i) => {
            const date = subMonths(new Date(), i);
            return {
                date: format(date, 'MMM yy'),
                count: 0,
            };
        }).reverse();
        
        allBusinessesSnapshot.forEach(doc => {
            const businessData = doc.data();
            if (businessData.createdAt && businessData.createdAt.toDate) {
                 const createdAtDate = businessData.createdAt.toDate();
                if (createdAtDate >= sixMonthsAgo) {
                    const monthYear = format(createdAtDate, 'MMM yy');
                    const monthIndex = businessGrowthData.findIndex(d => d.date === monthYear);
                    if (monthIndex !== -1) {
                        businessGrowthData[monthIndex].count++;
                    }
                }
            }
        });
        
        return {
            industryCount: industriesSnapshot.size,
            businessCount: allBusinessesSnapshot.size,
            customerCount: customersSnapshot.data().count,
            businessGrowth: businessGrowthData,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return { error: 'Failed to fetch stats.' };
    }
}

// Business Actions
async function fetchUserDetails(userId: string, userDetailsCache: Map<string, any>) {
    if (userDetailsCache.has(userId)) {
        return userDetailsCache.get(userId);
    }
    if (!userId) return { name: "Anonymous", email: "N/A", phone: "N/A", shareCount: 0 };
    try {
        const userSnap = await getDoc(doc(db, 'users', userId));
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const userDetails = { 
                name: userData.name, 
                email: userData.email, 
                phone: userData.phone,
                shareCount: userData.shareCount || 0
            };
            userDetailsCache.set(userId, userDetails);
            return userDetails;
        }
        return { name: "Unknown User", email: "N/A", phone: "N/A", shareCount: 0 };
    } catch (error) {
        console.error(`Failed to fetch user details for ${userId}:`, error);
        return { name: "Error", email: "N/A", phone: "N/A", shareCount: 0 };
    }
}


export async function getBusinessCustomerHistory(businessId: string) {
    if (!businessId) {
        return { history: [], error: 'Business ID is required.' };
    }

    try {
        const allUsersSnapshot = await getDocs(collection(db, 'users'));
        const userDetailsCache = new Map();
        const userVisitCounts: Record<string, number> = {};

        allUsersSnapshot.forEach(userDoc => {
            const userData = userDoc.data();
            userDetailsCache.set(userDoc.id, {
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                shareCount: userData.shareCount || 0,
            });
            userVisitCounts[userDoc.id] = 0;
        });
        
        const serviceHistoryQuery = query(
            collectionGroup(db, 'serviceHistory'),
            where('businessId', '==', businessId)
        );
        const serviceSnapshots = await getDocs(serviceHistoryQuery);
        
        serviceSnapshots.forEach(doc => {
            const userId = doc.data().userId;
            if(userId && (doc.data().activityType === 'Check-in' || !doc.data().activityType)) { // Count check-ins
                 if (userVisitCounts[userId] !== undefined) {
                    userVisitCounts[userId]++;
                }
            }
        });

        const allHistory: any[] = [];
        
        const feedbackQuery = query(
            collection(db, 'feedback'), 
            where('businessId', '==', businessId)
        );
        const feedbackSnapshots = await getDocs(feedbackQuery);
        
        for (const serviceDoc of serviceSnapshots.docs) {
            const data = serviceDoc.data();
            const userId = data.userId;
            const userDetails = userDetailsCache.get(userId) || { name: "Unknown", email: "N/A", phone: "N/A", shareCount: 0 };
            const serviceDate = data.date.toDate();

            allHistory.push({
                ...data,
                id: serviceDoc.id,
                userName: userDetails.name,
                userEmail: userDetails.email,
                userPhone: userDetails.phone,
                shareCount: userDetails.shareCount,
                visitCount: userVisitCounts[userId] || 0,
                date: serviceDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
                sortDate: serviceDate,
                activityType: data.isRedemption ? 'Booking' : 'Check-in',
                createdAt: serviceDate.toISOString(),
            });
        }
        
        for (const feedbackDoc of feedbackSnapshots.docs) {
            const data = feedbackDoc.data();
            const userId = data.userId;
            if (!userId) continue;

            const userDetails = userDetailsCache.get(userId) || { name: "Unknown", email: "N/A", phone: "N-A", shareCount: 0 };
            const feedbackDate = data.createdAt.toDate();
            
            allHistory.push({
                ...data,
                id: feedbackDoc.id,
                service: 'Feedback',
                rating: data.rating,
                comment: data.comment,
                tip: data.tip,
                expense: data.expense || null,
                userId: userId,
                userName: userDetails.name,
                userEmail: userDetails.email,
                userPhone: userDetails.phone,
                shareCount: userDetails.shareCount,
                visitCount: userVisitCounts[userId] || 0,
                date: feedbackDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
                sortDate: feedbackDate,
                createdAt: feedbackDate.toISOString(),
                activityType: 'Feedback',
            });
        }
        
        allHistory.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
        
        return { history: allHistory };
    } catch (error: any) {
        console.error("Error fetching business history:", error);
        return { history: [], error: `Failed to fetch customer history. Details: ${error.message}` };
    }
}

const sendBroadcastSchema = z.object({
    businessId: z.string().min(1),
    message: z.string().min(1),
    mediaUrl: z.string().url().optional().or(z.literal('')),
});

export async function sendBroadcastMessage(formData: FormData) {
    const validatedFields = sendBroadcastSchema.safeParse({
        businessId: formData.get('businessId'),
        message: formData.get('message'),
        mediaUrl: formData.get('mediaUrl'),
    });

    if (!validatedFields.success) {
        return { error: 'Invalid broadcast data.' };
    }
    const { businessId, message, mediaUrl } = validatedFields.data;

    try {
        const businessRef = doc(db, 'businesses', businessId);
        const businessSnap = await getDoc(businessRef);
        if (!businessSnap.exists()) {
            return { error: 'Business not found.' };
        }
        const businessData = businessSnap.data();

        // 1. Get all unique customers for the business
        const historyQuery = query(collectionGroup(db, 'serviceHistory'), where('businessId', '==', businessId));
        const historySnap = await getDocs(historyQuery);
        const userIds = [...new Set(historySnap.docs.map(d => d.data().userId))];

        if (userIds.length === 0) {
            return { error: 'No customers to message.' };
        }

        // 2. Check for message credits
        const credits = businessData.message_credits || 0;
        if (credits < userIds.length) {
            return { error: `Not enough message credits. You have ${credits}, but need ${userIds.length}.` };
        }

        // 3. Fetch user phone numbers
        const userDocs = await Promise.all(userIds.map(id => getDoc(doc(db, 'users', id))));
        const phoneNumbers = userDocs
            .map(snap => snap.exists() ? snap.data().phone : null)
            .filter(phone => phone);

        // 4. Send messages
        let successCount = 0;
        let failCount = 0;
        for (const phone of phoneNumbers) {
            if (phone) {
                // In a real scenario, you'd want to handle prefixes more robustly
                const prefixedPhone = phone.startsWith('+') ? phone : `+${phone}`;
                const result = await sendWhatsappMessage(prefixedPhone, message, mediaUrl || undefined);
                if (result.success) successCount++;
                else failCount++;
            }
        }

        // 5. Decrement credits
        await updateDoc(businessRef, {
            message_credits: increment(-successCount)
        });
        
        return { success: true, message: `Broadcast sent to ${successCount} customers. ${failCount} failed.` };

    } catch (error) {
        console.error('Error sending broadcast:', error);
        return { error: 'Failed to send broadcast message.' };
    }
}


const createCampaignSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  reward: z.string().min(1, 'Reward is required.'),
  businessId: z.string().min(1),
});

export async function createCampaign(formData: FormData) {
  const validatedFields = createCampaignSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    reward: formData.get('reward'),
    businessId: formData.get('businessId'),
  });

  if (!validatedFields.success) {
    return { error: "Invalid form data." };
  }

  const expiresAt = addDays(new Date(), 5);

  try {
    await addDoc(collection(db, 'campaigns'), {
      ...validatedFields.data,
      status: 'active',
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });
    return { success: true, message: 'Campaign created successfully!' };
  } catch (error) {
    console.error("Error creating campaign:", error);
    return { error: 'Failed to create campaign.' };
  }
}

export async function getCampaignsForBusiness(businessId: string) {
  if (!businessId) {
    return { campaigns: [], error: 'Business ID is required.' };
  }
  try {
    const q = query(
        collection(db, 'campaigns'), 
        where('businessId', '==', businessId)
    );
    const querySnapshot = await getDocs(q);
    const campaigns = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .map(campaign => ({ 
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            reward: campaign.reward,
            status: campaign.status,
            businessId: campaign.businessId,
            winnerId: campaign.winnerId || null,
            winnerName: campaign.winnerName || null,
            drawDate: campaign.drawDate ? campaign.drawDate.toDate().toISOString() : null,
            createdAt: campaign.createdAt ? campaign.createdAt.toDate().toISOString() : new Date().toISOString(),
            expiresAt: campaign.expiresAt.toDate().toISOString(),
        }));

    return { campaigns };
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return { campaigns: [], error: 'Failed to fetch campaigns.' };
  }
}

export async function getAllCampaigns() {
    try {
        const businessesSnapshot = await getDocs(collection(db, 'businesses'));
        const businessMap = new Map(businessesSnapshot.docs.map(doc => [doc.id, doc.data().name]));

        const campaignsQuery = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'));
        const campaignsSnapshot = await getDocs(campaignsQuery);
        
        const allCampaigns = campaignsSnapshot.docs.map(campaignDoc => {
            const campaignData = campaignDoc.data();
            const businessName = businessMap.get(campaignData.businessId) || 'Unknown Business';

            return {
                id: campaignDoc.id,
                title: campaignData.title,
                description: campaignData.description,
                reward: campaignData.reward,
                status: campaignData.status,
                businessId: campaignData.businessId,
                businessName: businessName,
                winnerId: campaignData.winnerId || null,
                winnerName: campaignData.winnerName || null,
                drawDate: campaignData.drawDate ? campaignData.drawDate.toDate().toISOString() : null,
                createdAt: campaignData.createdAt ? campaignData.createdAt.toDate().toISOString() : new Date().toISOString(),
                expiresAt: campaignData.expiresAt.toDate().toISOString(),
            };
        });
        
        return { campaigns: allCampaigns };
    } catch (error) {
        console.error("Error fetching all campaigns:", error);
        return { campaigns: [], error: 'Failed to fetch campaigns.' };
    }
}


export async function runLuckyDraw(campaignId: string, businessId: string): Promise<{ success: boolean; error?: string; winnerName?: string }> {
    if (!campaignId || !businessId) {
        return { success: false, error: 'Campaign ID and Business ID are required.' };
    }

    try {
        const campaignRef = doc(db, 'campaigns', campaignId);
        const campaignSnap = await getDoc(campaignRef);

        if (!campaignSnap.exists()) {
            return { success: false, error: 'Campaign not found.' };
        }
        const campaignData = campaignSnap.data();
        const campaignStartDate = campaignData.createdAt.toDate();

        // 1. Get all "Verified" visits for the business since the campaign started
        const entriesQuery = query(
            collectionGroup(db, 'serviceHistory'),
            where('businessId', '==', businessId),
            where('status', '==', 'Verified'),
            where('date', '>=', campaignStartDate)
        );

        const entriesSnapshot = await getDocs(entriesQuery);
        if (entriesSnapshot.empty) {
            return { success: false, error: 'No verified entries found for this campaign period.' };
        }

        // 2. Select a random winner
        const entries = entriesSnapshot.docs;
        const randomIndex = Math.floor(Math.random() * entries.length);
        const winningEntry = entries[randomIndex].data();
        const winnerId = winningEntry.userId;

        // 3. Get winner's details
        const userRef = doc(db, 'users', winnerId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            throw new Error('Winner user data not found.');
        }
        const winnerName = userSnap.data().name;

        // 4. Update the campaign with the winner
        await updateDoc(campaignRef, {
            status: 'completed',
            winnerId: winnerId,
            winnerName: winnerName,
            drawDate: serverTimestamp(),
        });
        
        // 5. TODO: Notify business and winner (optional, can be added later)
        // For now, the client will handle the success message.

        return { success: true, winnerName };

    } catch (error) {
        console.error('Error running lucky draw:', error);
        return { success: false, error: 'Failed to run the lucky draw.' };
    }
}


export async function deleteCampaign(campaignId: string) {
    if (!campaignId) {
        return { error: 'Campaign ID is missing.' };
    }
    try {
        await deleteDoc(doc(db, 'campaigns', campaignId));
        return { success: true, message: 'Campaign deleted.' };
    } catch (error) {
        console.error("Error deleting campaign:", error);
        return { error: 'Failed to delete campaign.' };
    }
}

const createOfferSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  businessId: z.string().min(1),
  pointsRequired: z.coerce.number().min(0, "Points must be a positive number."),
  promoLinkUrl: z.string().url("Invalid URL.").optional().or(z.literal('')),
  introVideoUrl: z.string().url("Invalid URL.").optional().or(z.literal('')),
  promoVideoUrl: z.string().url("Invalid URL.").optional().or(z.literal('')),
});

export async function createOffer(formData: FormData) {
  const validatedFields = createOfferSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    businessId: formData.get('businessId'),
    pointsRequired: formData.get('pointsRequired'),
    promoLinkUrl: formData.get('promoLinkUrl'),
    introVideoUrl: formData.get('introVideoUrl'),
    promoVideoUrl: formData.get('promoVideoUrl'),
  });

  if (!validatedFields.success) {
    return { error: "Invalid form data.", issues: validatedFields.error.flatten().fieldErrors };
  }

  const expiresAt = addDays(new Date(), 3);

  try {
    await addDoc(collection(db, 'offers'), {
      ...validatedFields.data,
      status: 'active',
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });
    return { success: true, message: 'Offer created successfully!' };
  } catch (error) {
    console.error("Error creating offer:", error);
    return { error: 'Failed to create offer.' };
  }
}

export async function getOffersForBusiness(businessId: string) {
    if (!businessId) {
        return { offers: [], error: 'Business ID is required.' };
    }
    try {
        const now = new Date();
        const q = query(
            collection(db, 'offers'),
            where('businessId', '==', businessId),
            where('status', '==', 'active')
        );
        const querySnapshot = await getDocs(q);
        const offers = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as any))
            .filter(offer => offer.expiresAt && offer.expiresAt.toDate() > now)
            .map(offer => ({
                id: offer.id,
                title: offer.title,
                description: offer.description,
                pointsRequired: offer.pointsRequired || 0,
                businessId: offer.businessId,
                status: offer.status,
                promoLinkUrl: offer.promoLinkUrl || '',
                introVideoUrl: offer.introVideoUrl || '',
                promoVideoUrl: offer.promoVideoUrl || '',
                expiresAt: offer.expiresAt.toDate().toISOString(),
                createdAt: offer.createdAt ? offer.createdAt.toDate().toISOString() : new Date().toISOString(),
            }));
        return { offers };
    } catch (error) {
        console.error("Error fetching offers:", error);
        return { offers: [], error: 'Failed to fetch offers.' };
    }
}

export async function deleteOffer(offerId: string) {
    if (!offerId) {
        return { error: 'Offer ID is missing.' };
    }
    try {
        await deleteDoc(doc(db, 'offers', offerId));
        return { success: true, message: 'Offer deleted.' };
    } catch (error) {
        console.error("Error deleting offer:", error);
        return { error: 'Failed to delete offer.' };
    }
}

const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required.'),
  businessId: z.string().min(1),
});

export async function createService(formData: FormData) {
  const validatedFields = createServiceSchema.safeParse({
    name: formData.get('name'),
    businessId: formData.get('businessId'),
  });

  if (!validatedFields.success) {
    return { error: "Invalid form data." };
  }

  try {
    const servicesCollection = collection(db, `businesses/${validatedFields.data.businessId}/services`);
    await addDoc(servicesCollection, {
      name: validatedFields.data.name,
      createdAt: serverTimestamp(),
    });
    return { success: true, message: 'Service created successfully!' };
  } catch (error) {
    console.error("Error creating service:", error);
    return { error: 'Failed to create service.' };
  }
}

export async function getServicesForBusiness(businessId: string) {
  if (!businessId) {
    return { services: [], error: 'Business ID is required.' };
  }
  try {
    const servicesCollection = collection(db, `businesses/${businessId}/services`);
    const q = query(servicesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const services = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));
    return { services };
  } catch (error) {
    console.error("Error fetching services:", error);
    return { services: [], error: 'Failed to fetch services.' };
  }
}

export async function deleteService(serviceId: string, businessId: string) {
    if (!serviceId || !businessId) {
        return { error: 'Service ID and Business ID are required.' };
    }
    try {
        await deleteDoc(doc(db, `businesses/${businessId}/services`, serviceId));
        return { success: true, message: 'Service deleted.' };
    } catch (error) {
        console.error("Error deleting service:", error);
        return { error: 'Failed to delete service.' };
    }
}

// Quiz Actions
const quizOptionSchema = z.object({
  text: z.string().min(1, 'Option text is required.'),
  tip: z.string().optional(),
});

const quizQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required.'),
  options: z.array(quizOptionSchema).min(2, 'Each question must have at least 2 options.'),
});

const createQuizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required.'),
  businessId: z.string().min(1),
  questions: z.array(quizQuestionSchema).min(1, 'A quiz must have at least one question.'),
});

export async function createQuiz(input: z.infer<typeof createQuizSchema>) {
  const validatedFields = createQuizSchema.safeParse(input);
  if (!validatedFields.success) {
    return { error: "Invalid form data.", issues: validatedFields.error.issues };
  }

  try {
    await addDoc(collection(db, `businesses/${validatedFields.data.businessId}/quizzes`), {
      ...validatedFields.data,
      status: 'active', // You can manage status later (active/inactive)
      createdAt: serverTimestamp(),
    });
    return { success: true, message: 'Quiz created successfully!' };
  } catch (error) {
    console.error("Error creating quiz:", error);
    return { error: 'Failed to create quiz.' };
  }
}

export async function getQuizzesForBusiness(businessId: string) {
  if (!businessId) {
    return { quizzes: [], error: 'Business ID is required.' };
  }
  try {
    const q = query(collection(db, `businesses/${businessId}/quizzes`), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const quizzes = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id,
        title: data.title,
        questions: data.questions,
        status: data.status,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
       };
    });
    return { quizzes };
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return { quizzes: [], error: 'Failed to fetch quizzes.' };
  }
}

export async function deleteQuiz(quizId: string, businessId: string) {
    if (!quizId || !businessId) {
        return { error: 'Quiz ID and Business ID are required.' };
    }
    try {
        await deleteDoc(doc(db, `businesses/${businessId}/quizzes`, quizId));
        return { success: true, message: 'Quiz deleted.' };
    } catch (error) {
        console.error("Error deleting quiz:", error);
        return { error: 'Failed to delete quiz.' };
    }
}

// Story Actions
const createStorySchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  content: z.string().min(1, 'Content is required.'),
  businessId: z.string().min(1),
});

export async function createStory(formData: FormData) {
  const validatedFields = createStorySchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    businessId: formData.get('businessId'),
  });

  if (!validatedFields.success) {
    return { error: "Invalid form data." };
  }

  try {
    await addDoc(collection(db, `businesses/${validatedFields.data.businessId}/stories`), {
      ...validatedFields.data,
      createdAt: serverTimestamp(),
    });
    return { success: true, message: 'Story created successfully!' };
  } catch (error) {
    console.error("Error creating story:", error);
    return { error: 'Failed to create story.' };
  }
}

export async function getStoriesForBusiness(businessId: string) {
  if (!businessId) {
    return { stories: [], error: 'Business ID is required.' };
  }
  try {
    const storiesCollection = collection(db, `businesses/${businessId}/stories`);
    const q = query(storiesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const stories = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
          id: doc.id,
          title: data.title,
          content: data.content,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      };
    });
    return { stories };
  } catch (error) {
    console.error("Error fetching stories:", error);
    return { stories: [], error: 'Failed to fetch stories.' };
  }
}

export async function deleteStory(storyId: string, businessId: string) {
    if (!storyId || !businessId) {
        return { error: 'Story ID and Business ID are required.' };
    }
    try {
        await deleteDoc(doc(db, `businesses/${businessId}/stories`, storyId));
        return { success: true, message: 'Story deleted.' };
    } catch (error) {
        console.error("Error deleting story:", error);
        return { error: 'Failed to delete story.' };
    }
}

// Nudge Actions
const createNudgeSchema = z.object({
  triggerService: z.string().min(1, 'Trigger service is required.'),
  recommendationText: z.string().min(1, 'Recommendation text is required.'),
  businessId: z.string().min(1),
});

export async function createNudge(formData: FormData) {
  const validatedFields = createNudgeSchema.safeParse({
    triggerService: formData.get('triggerService'),
    recommendationText: formData.get('recommendationText'),
    businessId: formData.get('businessId'),
  });

  if (!validatedFields.success) {
    return { error: "Invalid form data.", issues: validatedFields.error.issues };
  }

  try {
    await addDoc(collection(db, `businesses/${validatedFields.data.businessId}/nudges`), {
      ...validatedFields.data,
      status: 'active',
      createdAt: serverTimestamp(),
    });
    return { success: true, message: 'Nudge created successfully!' };
  } catch (error) {
    console.error("Error creating nudge:", error);
    return { error: 'Failed to create nudge.' };
  }
}

export async function getNudgesForBusiness(businessId: string) {
  if (!businessId) {
    return { nudges: [], error: 'Business ID is required.' };
  }
  try {
    const nudgesCollection = collection(db, `businesses/${businessId}/nudges`);
    const q = query(nudgesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const nudges = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id,
        triggerService: data.triggerService,
        recommendationText: data.recommendationText,
        status: data.status,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
       };
    });
    return { nudges };
  } catch (error) {
    console.error("Error fetching nudges:", error);
    return { nudges: [], error: 'Failed to fetch nudges.' };
  }
}

export async function deleteNudge(nudgeId: string, businessId: string) {
    if (!nudgeId || !businessId) {
        return { error: 'Nudge ID and Business ID are required.' };
    }
    try {
        await deleteDoc(doc(db, `businesses/${businessId}/nudges`, nudgeId));
        return { success: true, message: 'Nudge deleted.' };
    } catch (error) {
        console.error("Error deleting nudge:", error);
        return { error: 'Failed to delete nudge.' };
    }
}

// Product Actions for Marketplace
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required.'),
  description: z.string().min(1, 'Description is required.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  productUrl: z.string().url('Invalid product URL.').optional().or(z.literal('')),
  imageUrl: z.string().url('Invalid image URL.').optional().or(z.literal('')),
  businessId: z.string().min(1),
});

export async function createProduct(formData: FormData) {
  const validatedFields = createProductSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    productUrl: formData.get('productUrl'),
    imageUrl: formData.get('imageUrl'),
    businessId: formData.get('businessId'),
  });

  if (!validatedFields.success) {
    return { error: "Invalid form data.", issues: validatedFields.error.issues };
  }

  try {
    const productsCollection = collection(db, `businesses/${validatedFields.data.businessId}/products`);
    await addDoc(productsCollection, {
      ...validatedFields.data,
      createdAt: serverTimestamp(),
    });
    return { success: true, message: 'Product created successfully!' };
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: 'Failed to create product.' };
  }
}

export async function getProductsForBusiness(businessId: string) {
  if (!businessId) {
    return { products: [], error: 'Business ID is required.' };
  }
  try {
    const productsCollection = collection(db, `businesses/${businessId}/products`);
    const q = query(productsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        productUrl: data.productUrl,
        imageUrl: data.imageUrl,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      };
    });
    return { products };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], error: 'Failed to fetch products.' };
  }
}

export async function deleteProduct(productId: string, businessId: string) {
    if (!productId || !businessId) {
        return { error: 'Product ID and Business ID are required.' };
    }
    try {
        await deleteDoc(doc(db, `businesses/${businessId}/products`, productId));
        return { success: true, message: 'Product deleted.' };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { error: 'Failed to delete product.' };
    }
}

const updateVisitSchema = z.object({
    visitId: z.string().min(1),
    userId: z.string().min(1),
    amount: z.coerce.number().positive("Amount must be a positive number."),
    paymentMode: z.enum(['cash', 'upi', 'card', 'wallet']),
    notes: z.string().optional(),
});

export async function updateVisit(formData: FormData) {
    const validated = updateVisitSchema.safeParse({
        visitId: formData.get('visitId'),
        userId: formData.get('userId'),
        amount: formData.get('amount'),
        paymentMode: formData.get('paymentMode'),
        notes: formData.get('notes'),
    });

    if (!validated.success) {
        return { error: 'Invalid data provided for visit update.', issues: validated.error.issues };
    }

    const { visitId, userId, amount, paymentMode, notes } = validated.data;

    try {
        const visitRef = doc(db, `users/${userId}/serviceHistory`, visitId);
        const visitSnap = await getDoc(visitRef);
        if (!visitSnap.exists()) {
            return { error: "Visit record not found." };
        }
        const visitData = visitSnap.data();

        await updateDoc(visitRef, {
            expense: {
                amount: amount,
                currency: 'INR',
                mode: paymentMode,
                timestamp: serverTimestamp(),
                validated: false,
            },
            notes: notes || null,
            status: 'Pending Customer Confirmation',
        });
        
        // Send WhatsApp notification to the customer for validation
        const userSnap = await getDoc(doc(db, 'users', userId));
        if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.phone) {
                const businessSnap = await getDoc(doc(db, 'businesses', visitData.businessId));
                const businessName = businessSnap.exists() ? businessSnap.data().name : "the business";

                const message = `Hi ${userData.name},\n\n${businessName} has logged an expense of *₹${amount.toFixed(2)}* for your recent visit.\n\nPlease open your QREngage dashboard to confirm or dispute this charge.\n\nThank you!`;
                await sendWhatsappMessage(userData.phone, message);
            }
        }

        return { success: true, message: 'Visit updated. A notification has been sent to the customer for confirmation.' };
    } catch (error) {
        console.error("Error updating visit:", error);
        return { error: 'Failed to update visit record.' };
    }
}

const confirmOrDisputeVisitSchema = z.object({
    visitId: z.string().min(1),
    userId: z.string().min(1),
    action: z.enum(['confirm', 'dispute']),
});

export async function confirmOrDisputeVisit(input: z.infer<typeof confirmOrDisputeVisitSchema>) {
    const validated = confirmOrDisputeVisitSchema.safeParse(input);
    if (!validated.success) {
        return { error: 'Invalid data provided for visit confirmation.' };
    }
    const { visitId, userId, action } = validated.data;

    try {
        const visitRef = doc(db, `users/${userId}/serviceHistory`, visitId);
        const visitSnap = await getDoc(visitRef);

        if (!visitSnap.exists() || visitSnap.data().status !== 'Pending Customer Confirmation') {
            return { error: 'This visit is not awaiting confirmation.' };
        }

        const newStatus = action === 'confirm' ? 'Verified' : 'Disputed';

        await updateDoc(visitRef, {
            status: newStatus,
            'expense.validated': action === 'confirm',
        });
        
        // TODO: Notify the business if a dispute is raised.

        return { success: true, message: `Visit has been marked as ${newStatus}.` };
    } catch (error) {
        console.error(`Error ${action}ing visit:`, error);
        return { error: `Failed to ${action} the visit record.` };
    }
}

    
