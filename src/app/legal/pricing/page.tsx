import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing Policy',
    description: 'Understand the pricing structure for businesses using the QREngage platform.',
};

export default function PricingPage() {
    return (
        <div>
            <h1>Pricing Policy</h1>
            <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <p>At QREngage, we believe in transparent and straightforward pricing. Our goal is to provide exceptional value to businesses of all sizes.</p>

            <h2>For Customers</h2>
            <p>The QREngage platform is **completely free for customers**. You can sign up, scan QR codes, earn loyalty points, participate in challenges, and receive offers at no cost.</p>

            <h2>For Businesses</h2>
            <p>We offer a simple subscription model for businesses to access our full suite of engagement tools. Our pricing is designed to be affordable and scalable as your business grows.</p>

            <h3>Standard Plan</h3>
            <ul>
                <li><strong>Price:</strong> ₹2500 per month per location</li>
                <li><strong>Includes:</strong></li>
                <li>Unlimited QR code scans</li>
                <li>Customer loyalty program management</li>
                <li>Gamified challenges creation</li>
                <li>Exclusive member offers creation</li>
                <li>AI Stylist/Trainer chatbot integration</li>
                <li>Customer feedback and digital tipping system</li>
                <li>Access to business dashboard with analytics</li>
                <li>Email and chat support</li>
            </ul>

            <h3>Enterprise Plan</h3>
            <p>For businesses with multiple locations or specific needs, we offer custom enterprise plans. Please contact our sales team for a personalized quote.</p>
            <p><a href="mailto:sales@qrengage.com">sales@qrengage.com</a></p>

            <h2>Changes to Pricing</h2>
            <p>We reserve the right to modify our pricing policy at any time. Any changes will be communicated to existing subscribers at least 30 days in advance. All payments are processed securely through our payment provider.</p>

        </div>
    );
}
