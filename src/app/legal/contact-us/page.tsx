import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with the QREngage team for support, inquiries, or feedback.',
};

export default function ContactUsPage() {
    return (
        <div>
            <h1>Contact Us</h1>
            <p>We'd love to hear from you! Whether you have a question about our services, need assistance with your account, or just want to share some feedback, please feel free to reach out to us.</p>

            <h2>General Inquiries</h2>
            <p>For general questions, partnerships, or media inquiries, please email us at:</p>
            <p><a href="mailto:nawaznizam3112@medicode-connect.com">nawaznizam3112@medicode-connect.com</a></p>

            <h2>Support</h2>
            <p>If you are a customer or a business owner and need help with our platform, our support team is ready to assist you. Please contact us at:</p>
            <p><a href="mailto:nawaznizam3112@medicode-connect.com">nawaznizam3112@medicode-connect.com</a></p>

            <h2>Business Address</h2>
            <p>
                Dr Nawaz Nizam<br />
                #4514, 3rd cross, N R Mohalla<br />
                Mysore, Karnataka, India
            </p>

            <h2>Feedback</h2>
            <p>Your feedback is invaluable to us. If you have any suggestions on how we can improve our services, please let us know. We are constantly working to make QREngage better for our community.</p>

        </div>
    );
}
