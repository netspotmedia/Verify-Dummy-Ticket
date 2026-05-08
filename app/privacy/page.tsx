import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata = {
  title: "Privacy Policy – Verify Dummy Tickets",
  description: "How Verify Dummy Tickets collects, uses, and protects your personal information.",
}

const LAST_UPDATED = "May 8, 2025"
const COMPANY = "Verify Dummy Tickets"
const SITE_URL = "https://verifydummytickets.com"
const EMAIL = "verifydummyticket@gmail.com"
const PHONE = "+27 68 707 6011"

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 mb-3 text-xl font-bold text-slate-900">{children}</h2>
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 mb-2 text-base font-semibold text-slate-800">{children}</h3>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-slate-600 leading-7">{children}</p>
}
function UL({ children }: { children: React.ReactNode }) {
  return <ul className="mb-4 ml-6 list-disc space-y-1.5 text-slate-600 leading-7">{children}</ul>
}
function LI({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>
}
function A({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} className="text-primary underline underline-offset-2 hover:text-primary/80">{children}</a>
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Privacy Policy</h1>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">

              <P>
                Welcome to {COMPANY} ("{COMPANY}", "we", "us", or "our"). We are committed to protecting
                your personal information and your right to privacy. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you visit our website{" "}
                <A href={SITE_URL}>{SITE_URL}</A> and use our services.
              </P>
              <P>
                Please read this policy carefully. If you disagree with its terms, please discontinue
                use of our site. By accessing or using our services, you agree to the collection and use
                of information in accordance with this policy.
              </P>

              <H2>1. Information We Collect</H2>

              <H3>1.1 Information You Provide Directly</H3>
              <P>When you place an order or create an account, we collect:</P>
              <UL>
                <LI><strong>Identity data:</strong> Full name, title (Mr/Mrs/Miss/Master)</LI>
                <LI><strong>Contact data:</strong> Email address, phone number, country of residence</LI>
                <LI><strong>Travel data:</strong> Passport number, nationality, date of birth, flight itinerary details, hotel preferences, insurance coverage requirements</LI>
                <LI><strong>Payment data:</strong> Payment method (PayPal or Paystack), transaction reference numbers. We do <strong>not</strong> store full card numbers or bank account details — payments are processed by our third-party payment providers.</LI>
                <LI><strong>Account credentials:</strong> Email address and hashed password (if you create an account)</LI>
                <LI><strong>Communications:</strong> Messages you send via our contact form</LI>
              </UL>

              <H3>1.2 Information Collected Automatically</H3>
              <P>When you visit our website, we may automatically collect:</P>
              <UL>
                <LI><strong>Log data:</strong> IP address, browser type and version, pages visited, time and date of visit, time spent on pages</LI>
                <LI><strong>Device data:</strong> Device type, operating system, unique device identifiers</LI>
                <LI><strong>Usage data:</strong> Clickstream data, referring URLs, and site navigation patterns</LI>
                <LI><strong>Cookies and similar technologies:</strong> Session tokens required for authentication and site functionality (see Section 7)</LI>
              </UL>

              <H2>2. How We Use Your Information</H2>
              <P>We use the information we collect for the following purposes:</P>
              <UL>
                <LI><strong>Service delivery:</strong> To process your order and generate your travel documents (flight reservations, hotel confirmations, travel insurance documents)</LI>
                <LI><strong>Account management:</strong> To create and maintain your user account, and to authenticate you when you log in</LI>
                <LI><strong>Communications:</strong> To send you order confirmations, status updates, and document delivery notifications via email</LI>
                <LI><strong>Customer support:</strong> To respond to your inquiries, complaints, and support requests</LI>
                <LI><strong>Payment processing:</strong> To verify and process payments through our third-party payment processors</LI>
                <LI><strong>Legal compliance:</strong> To comply with applicable laws, regulations, court orders, or other legal obligations</LI>
                <LI><strong>Fraud prevention:</strong> To detect, investigate, and prevent fraudulent transactions and other illegal activities</LI>
                <LI><strong>Service improvement:</strong> To analyse how our services are used and to improve user experience</LI>
              </UL>
              <P>
                We will only use your personal information for the purposes it was collected, unless we
                reasonably consider that we need to use it for another reason compatible with the original purpose.
              </P>

              <H2>3. Legal Basis for Processing (GDPR)</H2>
              <P>
                If you are located in the European Economic Area (EEA) or the United Kingdom, we process
                your personal data under the following legal bases:
              </P>
              <UL>
                <LI><strong>Contract performance:</strong> Processing necessary to deliver the service you ordered</LI>
                <LI><strong>Legitimate interests:</strong> Fraud prevention, service improvement, and security of our platform</LI>
                <LI><strong>Legal obligation:</strong> Compliance with applicable laws and regulations</LI>
                <LI><strong>Consent:</strong> Where you have given explicit consent (e.g., marketing communications)</LI>
              </UL>

              <H2>4. How We Share Your Information</H2>
              <P>
                We do not sell, trade, or rent your personal information to third parties. We may share
                your data only in the following circumstances:
              </P>
              <UL>
                <LI>
                  <strong>Service providers:</strong> We share data with trusted third-party vendors who
                  assist us in operating our website and delivering services, including:
                  <ul className="mt-1.5 ml-5 list-disc space-y-1">
                    <li><strong>Supabase</strong> — database hosting and authentication</li>
                    <li><strong>Resend</strong> — transactional email delivery</li>
                    <li><strong>PayPal</strong> — payment processing</li>
                    <li><strong>Paystack</strong> — payment processing</li>
                    <li><strong>Vercel</strong> — website hosting and infrastructure</li>
                  </ul>
                  <span className="block mt-1.5">All service providers are contractually obligated to keep your information confidential and to use it only for the purposes we specify.</span>
                </LI>
                <LI><strong>Legal requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).</LI>
                <LI><strong>Business transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, your information may be transferred. We will notify you via email and/or a prominent notice on our website of any change in ownership or uses of your data.</LI>
                <LI><strong>Protection of rights:</strong> We may disclose your information where necessary to investigate, prevent, or take action regarding illegal activities, suspected fraud, or potential threats to safety.</LI>
              </UL>

              <H2>5. Data Retention</H2>
              <P>
                We retain your personal information for as long as necessary to fulfil the purposes outlined
                in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </P>
              <UL>
                <LI><strong>Order and travel data:</strong> Retained for 3 years from the date of your last order</LI>
                <LI><strong>Account data:</strong> Retained for as long as your account is active, plus 12 months after account closure</LI>
                <LI><strong>Contact form messages:</strong> Retained for 12 months</LI>
                <LI><strong>Payment transaction references:</strong> Retained for 7 years to comply with financial record-keeping requirements</LI>
              </UL>
              <P>When your data is no longer needed, we will securely delete or anonymise it.</P>

              <H2>6. Your Rights</H2>
              <P>Depending on your location, you may have the following rights regarding your personal data:</P>
              <UL>
                <LI><strong>Right to access:</strong> Request a copy of the personal data we hold about you</LI>
                <LI><strong>Right to rectification:</strong> Request correction of inaccurate or incomplete data</LI>
                <LI><strong>Right to erasure:</strong> Request deletion of your personal data ("right to be forgotten"), subject to certain legal exceptions</LI>
                <LI><strong>Right to restrict processing:</strong> Request that we limit how we use your data</LI>
                <LI><strong>Right to data portability:</strong> Receive your data in a structured, machine-readable format</LI>
                <LI><strong>Right to object:</strong> Object to processing based on legitimate interests</LI>
                <LI><strong>Right to withdraw consent:</strong> Where processing is based on consent, withdraw that consent at any time</LI>
              </UL>
              <P>
                To exercise any of these rights, please contact us at{" "}
                <A href={`mailto:${EMAIL}`}>{EMAIL}</A>. We will respond within 30 days.
                We may need to verify your identity before processing your request.
              </P>

              <H2>7. Cookies</H2>
              <P>We use cookies and similar tracking technologies to operate our website. Specifically:</P>
              <UL>
                <LI><strong>Essential cookies:</strong> Required for authentication and to keep you logged in. These cannot be disabled without breaking core site functionality.</LI>
                <LI><strong>Session tokens:</strong> Stored to maintain your login session securely across pages</LI>
              </UL>
              <P>
                We do not currently use advertising or analytics cookies from third-party advertising
                networks. You can control cookie settings through your browser, but disabling essential
                cookies will prevent you from logging in or completing orders.
              </P>

              <H2>8. Data Security</H2>
              <P>
                We implement appropriate technical and organisational security measures to protect your
                personal information against unauthorised access, alteration, disclosure, or destruction.
                These measures include:
              </P>
              <UL>
                <LI>HTTPS encryption for all data transmitted between your browser and our servers</LI>
                <LI>Row-level security on our database, ensuring users can only access their own data</LI>
                <LI>Hashed passwords — we never store your password in plain text</LI>
                <LI>Restricted admin access controlled by server-side role verification</LI>
                <LI>Regular security reviews of our code and infrastructure</LI>
              </UL>
              <P>
                However, no method of transmission over the internet or method of electronic storage is
                100% secure. While we strive to use commercially acceptable means to protect your personal
                data, we cannot guarantee its absolute security.
              </P>

              <H2>9. International Data Transfers</H2>
              <P>
                Our services are operated primarily in South Africa. If you are accessing our services
                from outside South Africa, your information may be transferred to, stored, and processed
                in countries where our service providers operate (including the United States and the
                European Union). By using our services, you consent to this transfer.
              </P>
              <P>
                Where we transfer data to countries outside your jurisdiction, we ensure appropriate
                safeguards are in place in accordance with applicable data protection laws.
              </P>

              <H2>10. Children's Privacy</H2>
              <P>
                Our services are not directed to individuals under the age of 18. We do not knowingly
                collect personal data from children. If you are a parent or guardian and believe your
                child has provided us with personal data, please contact us at{" "}
                <A href={`mailto:${EMAIL}`}>{EMAIL}</A> and we will delete such information promptly.
              </P>

              <H2>11. Third-Party Links</H2>
              <P>
                Our website may contain links to third-party websites. We are not responsible for the
                privacy practices or content of those sites. We encourage you to review the privacy
                policies of any third-party sites you visit.
              </P>

              <H2>12. Changes to This Privacy Policy</H2>
              <P>
                We may update this Privacy Policy from time to time. The updated version will be indicated
                by the "Last updated" date at the top of this page. We encourage you to review this
                policy periodically. If we make material changes, we will notify you by email or by
                posting a prominent notice on our website before the changes take effect.
              </P>

              <H2>13. Contact Us</H2>
              <P>
                If you have any questions, concerns, or requests regarding this Privacy Policy or how we
                handle your personal data, please contact us:
              </P>
              <UL>
                <LI><strong>Email:</strong> <A href={`mailto:${EMAIL}`}>{EMAIL}</A></LI>
                <LI><strong>Phone / WhatsApp:</strong> {PHONE}</LI>
                <LI><strong>Website:</strong> <A href={`${SITE_URL}/contact`}>{SITE_URL}/contact</A></LI>
              </UL>
              <P>We aim to respond to all inquiries within 2–4 business hours.</P>

            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
