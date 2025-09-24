import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us',
    description: 'Learn more about QREngage, our mission, and our team.',
};

export default function AboutUsPage() {
    return (
        <div>
            <h1>About QREngage</h1>
            <p>Welcome to QREngage, your modern solution for customer loyalty and engagement. We believe in empowering local businesses like salons, gyms, and cafes to connect with their customers in a meaningful and rewarding way.</p>
            
            <h2>Our Mission</h2>
            <p>Our mission is to bridge the gap between local businesses and their customers through innovative technology. We aim to replace traditional, cumbersome loyalty cards with a seamless, digital experience powered by simple QR code scans. By doing so, we help businesses foster stronger customer relationships, increase repeat visits, and grow their brand.</p>

            <h2>What We Do</h2>
            <p>QREngage provides a comprehensive platform that includes:</p>
            <ul>
                <li><strong>Instant Loyalty Points:</strong> Customers scan a QR code to earn points instantly.</li>
                <li><strong>Gamified Challenges:</strong> Businesses can create fun challenges to engage customers and offer unique rewards.</li>
                <li><strong>Personalized History:</strong> Customers can track their service history, from haircut details to workout logs.</li>
                <li><strong>Exclusive Offers:</strong> Limited-time coupons and special deals are unlocked through QR scans.</li>
                <li><strong>AI-Powered Assistance:</strong> An integrated AI chatbot acts as a personal stylist or trainer, answering customer questions.</li>
                <li><strong>Seamless Feedback & Tipping:</strong> A simple way for customers to provide ratings and digital tips after a service.</li>
            </ul>

            <h2>Our Vision</h2>
            <p>We envision a thriving community of local businesses that are deeply connected with their loyal customers. We strive to be the go-to platform for businesses looking to modernize their customer engagement strategies and for customers seeking more rewarding interactions with their favorite local spots.</p>

            <p>Thank you for being a part of the QREngage journey.</p>
        </div>
    );
}
