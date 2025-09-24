import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Refund Policy',
    description: 'Read the refund policy for business subscriptions on the QREngage platform.',
};

export default function RefundPolicyPage() {
    return (
        <div>
            <h1>Refund Policy</h1>
            <p>Last updated: {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <h2>For Business Subscriptions</h2>
            <p>Thank you for subscribing to QREngage. We are committed to your satisfaction.</p>

            <h3>Monthly Subscriptions</h3>
            <p>We offer a 14-day money-back guarantee for new business subscribers. If you are not satisfied with our service for any reason during the first 14 days of your initial subscription, you may request a full refund.</p>
            <p>To request a refund, please contact our support team at <a href="mailto:support@qrengage.com">support@qrengage.com</a> with your business details and the reason for your request.</p>
            <p>After the first 14 days, we do not offer refunds for monthly subscription payments. You can cancel your subscription at any time, and you will not be billed for the following month. You will retain access to the service until the end of your current billing period.</p>

            <h3>Cancellation</h3>
            <p>You can cancel your subscription at any time from your business dashboard or by contacting our support team. The cancellation will take effect at the end of the current billing cycle.</p>
            
            <h2>For Customers</h2>
            <p>The QREngage platform is free for customers. Therefore, this refund policy does not apply to customer accounts.</p>

            <h2>Contact Us</h2>
            <p>If you have any questions about our Refund Policy, please contact us at <a href="mailto:support@qrengage.com">support@qrengage.com</a>.</p>
        </div>
    );
}
