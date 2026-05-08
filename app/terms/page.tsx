import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata = {
  title: "Terms of Service – Verify Dummy Tickets",
  description: "Terms and conditions governing use of the Verify Dummy Tickets service.",
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

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Terms of Service</h1>
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
                Please read these Terms of Service ("Terms", "Agreement") carefully before using the
                website located at <A href={SITE_URL}>{SITE_URL}</A> or any services offered by{" "}
                {COMPANY} ("we", "us", "our", or "the Company"). By accessing or using our services,
                you confirm that you have read, understood, and agree to be bound by these Terms. If
                you do not agree, do not use our services.
              </P>

              <H2>1. Nature of Our Service</H2>

              <H3>1.1 What We Provide</H3>
              <P>{COMPANY} provides <strong>dummy (placeholder) travel documents</strong> including:</P>
              <UL>
                <LI>Flight reservation itineraries with PNR (Passenger Name Record) codes</LI>
                <LI>Hotel booking confirmation letters</LI>
                <LI>Travel medical insurance documents</LI>
              </UL>
              <P>
                These documents are generated for the sole purpose of supporting <strong>visa applications,
                consulate interviews, and travel planning</strong> where proof of onward travel or
                accommodation is required before finalising actual bookings.
              </P>

              <H3>1.2 Important Disclaimer — Not Real Bookings</H3>
              <div className="mb-6 rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
                <p className="mb-2 font-semibold text-slate-900">⚠️ Critical Notice</p>
                <p className="text-sm leading-relaxed text-slate-700">
                  The documents provided by {COMPANY} are <strong>dummy/placeholder documents only</strong>.
                  They are <strong>not real airline bookings, hotel reservations, or insurance policies</strong>.
                  They <strong>cannot and must not be used</strong> to board an aircraft, check into a hotel,
                  or make any actual insurance claim. Once your visa is approved, you must make genuine
                  travel arrangements directly with airlines, hotels, and insurance providers.
                </p>
              </div>
              <P>
                By placing an order, you confirm that you understand and accept this distinction. You
                acknowledge that {COMPANY} is providing a document-generation service, not an actual
                travel booking service.
              </P>

              <H2>2. Eligibility</H2>
              <P>To use our services, you must:</P>
              <UL>
                <LI>Be at least 18 years of age</LI>
                <LI>Have the legal capacity to enter into a binding agreement</LI>
                <LI>Not be prohibited from using the services under applicable law</LI>
                <LI>Provide accurate and truthful information when placing an order</LI>
              </UL>
              <P>
                If you are placing an order on behalf of another person, you represent that you have
                their explicit consent to do so and that all information provided is accurate.
              </P>

              <H2>3. Acceptable Use</H2>

              <H3>3.1 Permitted Uses</H3>
              <P>You may use our documents only for:</P>
              <UL>
                <LI>Visa and travel permit applications to embassies or consulates</LI>
                <LI>Consulate or immigration interviews where proof of travel intent is required</LI>
                <LI>Travel planning purposes (to plan your itinerary before confirming actual bookings)</LI>
              </UL>

              <H3>3.2 Prohibited Uses</H3>
              <P>You must not use our documents or services to:</P>
              <UL>
                <LI>Board or attempt to board any aircraft or vessel</LI>
                <LI>Check into or attempt to check into any hotel or accommodation</LI>
                <LI>Make or attempt to make any insurance claim</LI>
                <LI>Commit fraud, misrepresentation, or any other illegal act</LI>
                <LI>Deceive immigration authorities beyond their intended lawful use for visa applications</LI>
                <LI>Resell, redistribute, or commercialise our documents without written permission</LI>
                <LI>Impersonate any person or entity, or falsely state or misrepresent your identity</LI>
                <LI>Use our services to violate any applicable local, national, or international law</LI>
                <LI>Attempt to reverse-engineer, copy, or reproduce our document templates</LI>
                <LI>Use automated tools (bots, scrapers) to access our website or services</LI>
              </UL>
              <P>
                Violation of these prohibited uses may result in immediate termination of your account
                and order, without refund, and may be reported to the relevant authorities.
              </P>

              <H2>4. Orders and Pricing</H2>

              <H3>4.1 Order Placement</H3>
              <P>
                By submitting an order, you make an offer to purchase our document-generation services.
                An order is confirmed when you receive a written confirmation email from us. We reserve
                the right to refuse or cancel any order at our sole discretion.
              </P>

              <H3>4.2 Pricing</H3>
              <P>
                All prices displayed on our website are in US Dollars (USD) or Nigerian Naira (NGN)
                as indicated. Prices include all applicable service fees. We reserve the right to change
                our prices at any time; however, the price charged will be the price displayed at the
                time you complete your order.
              </P>

              <H3>4.3 Payment</H3>
              <P>
                We accept payments via PayPal and Paystack. Payment must be completed in full before
                documents are generated and delivered. All payment processing is handled by our
                third-party payment providers and is subject to their terms and conditions.
              </P>

              <H3>4.4 Delivery</H3>
              <P>Document delivery timeframes are as follows (from confirmed payment):</P>
              <UL>
                <LI><strong>Normal delivery:</strong> Within 24 hours</LI>
                <LI><strong>Fast delivery:</strong> Within 12 hours</LI>
                <LI><strong>Express delivery:</strong> Within 6 hours</LI>
              </UL>
              <P>
                Delivery times are estimates and not guaranteed. Delays may occur due to high demand,
                inaccurate information provided by the customer, or circumstances beyond our control.
                We are not liable for any losses arising from delayed delivery.
              </P>

              <H2>5. Refund and Cancellation Policy</H2>

              <H3>5.1 Refund Eligibility</H3>
              <P>
                Due to the digital nature of our service, refunds are available only under the following
                circumstances:
              </P>
              <UL>
                <LI>We were unable to deliver your documents within <strong>48 hours</strong> of confirmed payment (for Normal delivery)</LI>
                <LI>We were unable to deliver your documents within <strong>24 hours</strong> of confirmed payment (for Fast or Express delivery)</LI>
                <LI>The documents delivered contained <strong>significant errors caused by us</strong> (not by inaccurate information you provided)</LI>
                <LI>You cancel your order within <strong>1 hour</strong> of placement, before documents have been generated</LI>
              </UL>

              <H3>5.2 Non-Refundable Circumstances</H3>
              <P>Refunds will <strong>not</strong> be issued if:</P>
              <UL>
                <LI>Documents were delivered on time and accurately reflect the information you provided</LI>
                <LI>Your visa application was refused (visa outcomes are outside our control)</LI>
                <LI>You provided incorrect or incomplete traveller information</LI>
                <LI>You changed your mind after documents were generated</LI>
                <LI>You have violated these Terms of Service</LI>
              </UL>

              <H3>5.3 Refund Process</H3>
              <P>
                To request a refund, contact us at <A href={`mailto:${EMAIL}`}>{EMAIL}</A> within
                7 days of your order date. Include your order number and reason for the request.
                Approved refunds will be processed to your original payment method within 5–10 business days.
              </P>

              <H2>6. Customer Responsibilities</H2>
              <P>You are solely responsible for:</P>
              <UL>
                <LI>Providing accurate, complete, and truthful information when placing your order</LI>
                <LI>Ensuring the information in your documents matches your actual passport and travel details</LI>
                <LI>Reviewing your documents promptly upon delivery and notifying us of any errors within 24 hours</LI>
                <LI>Understanding the visa requirements of the country you are applying to</LI>
                <LI>Making actual travel arrangements (flights, hotels, insurance) once your visa is approved</LI>
                <LI>Complying with all applicable laws in your jurisdiction regarding visa applications</LI>
              </UL>

              <H2>7. Intellectual Property</H2>
              <P>
                All content on our website — including text, graphics, logos, images, and software — is
                the property of {COMPANY} or its licensors and is protected by applicable intellectual
                property laws. You may not reproduce, distribute, modify, or create derivative works
                without our prior written consent.
              </P>
              <P>
                The documents we generate for you are licensed for your personal, single-use visa
                application only. You may not resell, share, or distribute these documents to third parties.
              </P>

              <H2>8. Disclaimer of Warranties</H2>
              <P>
                Our services are provided <strong>"as is"</strong> and <strong>"as available"</strong>,
                without warranty of any kind, express or implied. To the fullest extent permitted by law,
                we disclaim all warranties, including but not limited to:
              </P>
              <UL>
                <LI>Warranties of merchantability, fitness for a particular purpose, or non-infringement</LI>
                <LI>Warranties that our services will be uninterrupted, error-free, or free of viruses</LI>
                <LI>Warranties regarding the outcome of any visa application</LI>
                <LI>Warranties that our documents will be accepted by any embassy, consulate, or immigration authority</LI>
              </UL>
              <P>
                Visa decisions are made solely by the relevant government authorities. {COMPANY} makes
                no representation or guarantee that use of our documents will result in a successful visa outcome.
              </P>

              <H2>9. Limitation of Liability</H2>
              <P>
                To the maximum extent permitted by applicable law, {COMPANY}, its officers, directors,
                employees, and agents shall not be liable for any:
              </P>
              <UL>
                <LI>Indirect, incidental, special, consequential, or punitive damages</LI>
                <LI>Loss of profits, revenue, data, or business opportunities</LI>
                <LI>Losses arising from visa refusals or immigration decisions</LI>
                <LI>Losses arising from your misuse of our documents</LI>
                <LI>Losses arising from inaccurate information you provided</LI>
                <LI>Losses arising from third-party payment processing issues</LI>
              </UL>
              <P>
                Our total liability to you for any claim arising out of or relating to these Terms or
                our services shall not exceed the amount you paid us for the order giving rise to the claim.
              </P>

              <H2>10. Indemnification</H2>
              <P>
                You agree to defend, indemnify, and hold harmless {COMPANY} and its officers, directors,
                employees, and agents from and against any claims, damages, losses, liabilities, costs,
                and expenses (including reasonable legal fees) arising out of or relating to:
              </P>
              <UL>
                <LI>Your use or misuse of our services or documents</LI>
                <LI>Your violation of these Terms</LI>
                <LI>Your violation of any applicable law or regulation</LI>
                <LI>Any inaccurate information you provided to us</LI>
                <LI>Any third-party claim arising from your actions</LI>
              </UL>

              <H2>11. Account Termination</H2>
              <P>
                We reserve the right to suspend or terminate your account and access to our services at
                our sole discretion, without notice, for any of the following reasons:
              </P>
              <UL>
                <LI>Violation of these Terms of Service</LI>
                <LI>Suspected fraudulent, abusive, or illegal activity</LI>
                <LI>Providing false or misleading information</LI>
                <LI>Conduct that we reasonably believe is harmful to other users, third parties, or us</LI>
              </UL>
              <P>
                Upon termination, your right to access and use our services will immediately cease.
                Termination does not entitle you to a refund unless the termination was caused solely by our error.
              </P>

              <H2>12. Privacy</H2>
              <P>
                Your use of our services is also governed by our{" "}
                <A href="/privacy">Privacy Policy</A>, which is incorporated into these Terms by reference.
                By using our services, you consent to the collection and use of your data as described
                in the Privacy Policy.
              </P>

              <H2>13. Governing Law and Dispute Resolution</H2>
              <P>
                These Terms shall be governed by and construed in accordance with the laws of the
                Republic of South Africa, without regard to its conflict of law provisions.
              </P>
              <P>
                Any dispute arising out of or relating to these Terms or our services shall first be
                resolved through good-faith negotiation. If the dispute cannot be resolved within 30 days,
                it shall be submitted to the jurisdiction of the courts of South Africa.
              </P>

              <H2>14. Changes to These Terms</H2>
              <P>
                We reserve the right to modify these Terms at any time. Changes will be effective
                immediately upon posting on our website. The "Last updated" date at the top of this page
                will reflect when changes were made. Your continued use of our services after any changes
                constitutes acceptance of the new Terms.
              </P>
              <P>
                If we make material changes, we will notify you by email or by posting a prominent
                notice on our website.
              </P>

              <H2>15. Severability</H2>
              <P>
                If any provision of these Terms is found to be invalid, illegal, or unenforceable by a
                court of competent jurisdiction, that provision shall be modified to the minimum extent
                necessary to make it enforceable, and the remaining provisions shall continue in full force and effect.
              </P>

              <H2>16. Entire Agreement</H2>
              <P>
                These Terms, together with our Privacy Policy, constitute the entire agreement between
                you and {COMPANY} with respect to your use of our services, and supersede all prior
                agreements, understandings, and representations.
              </P>

              <H2>17. Contact Us</H2>
              <P>
                If you have any questions about these Terms of Service, please contact us:
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
