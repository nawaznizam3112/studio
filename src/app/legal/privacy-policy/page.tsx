import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Read our privacy policy to understand how QREngage collects, uses, and protects your data.',
};

export default function PrivacyPolicyPage() {
    return (
        <div>
            <h1>Privacy Policy</h1>
            <p>Last updated: {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <p>QREngage ("us", "we", or "our") operates the QREngage platform (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>

            <h2>1. Information Collection and Use</h2>
            <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
            <h3>Types of Data Collected</h3>
            <ul>
                <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to: Email address, Full Name, Phone number.</li>
                <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used. This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers, and other diagnostic data.</li>
                <li><strong>Service History Data:</strong> When you use our service to check in at a business, we collect information about that service, including the business name, service received, and date of service.</li>
            </ul>

            <h2>2. Use of Data</h2>
            <p>QREngage uses the collected data for various purposes:</p>
            <ul>
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information so that we can improve our Service</li>
                <li>To monitor the usage of our Service</li>
                <li>To detect, prevent and address technical issues</li>
            </ul>

            <h2>3. Data Sharing and Disclosure</h2>
            <p>We share your information only in the following circumstances:</p>
            <ul>
                <li><strong>With Businesses You Visit:</strong> When you scan a QR code to check in at a business, we share your name, email, and service history related to that business with them to facilitate their loyalty program and customer service.</li>
                <li><strong>For Legal Requirements:</strong> We may disclose your Personal Data in the good faith belief that such action is necessary to comply with a legal obligation.</li>
            </ul>

            <h2>4. Security of Data</h2>
            <p>The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
            
            <h2>5. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
            
        </div>
    );
}
