import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Disclaimer',
    description: 'Read the disclaimer for the use of the QREngage platform.',
};

export default function DisclaimerPage() {
    return (
        <div>
            <h1>Disclaimer</h1>
            <p>Last updated: {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <p>The information provided by QREngage ("we," "us," or "our") on this platform is for general informational purposes only. All information on the site is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.</p>

            <h2>No Professional Advice</h2>
            <p>The information provided by the AI Stylist/Trainer chatbot is for informational and entertainment purposes only and should not be considered professional styling, fitness, or medical advice. You should not rely on the information from the chatbot as a substitute for, nor does it replace, professional advice from a qualified stylist, certified trainer, or healthcare provider. Always consult with a professional for your specific needs.</p>

            <h2>External Links Disclaimer</h2>
            <p>The site may contain (or you may be sent through the site) links to other websites or content belonging to or originating from third parties or links to websites and features in banners or other advertising. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR THE ACCURACY OR RELIABILITY OF ANY INFORMATION OFFERED BY THIRD-PARTY WEBSITES LINKED THROUGH THE SITE.</p>

            <h2>Errors and Omissions Disclaimer</h2>
            <p>While we have made every attempt to ensure that the information contained in this site has been obtained from reliable sources, QREngage is not responsible for any errors or omissions or for the results obtained from the use of this information.</p>
            
            <h2>Fair Use Disclaimer</h2>
            <p>The material on this website may be used for purposes such as criticism, comment, news reporting, teaching, scholarship, or research, and is not an infringement of copyright. </p>

            <h2>Views Expressed Disclaimer</h2>
            <p>The views and opinions expressed on this platform by businesses or customers are those of the authors and do not necessarily reflect the official policy or position of QREngage.</p>

            <h2>Intellectual Property Warning</h2>
            <p>The features, design, and workflow of the QREngage platform are the exclusive intellectual property of QREngage. Any unauthorized reproduction, imitation, or duplication of our platform's features, user interface, or operational workflow, in whole or in part, is strictly prohibited and will result in immediate legal action to the fullest extent permitted by law.</p>

        </div>
    );
}
