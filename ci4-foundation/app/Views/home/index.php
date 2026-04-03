<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>

<section class="landing-hero py-4 py-lg-5">
    <div class="row g-4 align-items-center">
        <div class="col-lg-7">
            <span class="landing-pill">Fast Booking Verification</span>
            <h1 class="landing-title mt-3 mb-3">Get a verifiable flight reservation in minutes.</h1>
            <p class="landing-subtitle mb-4">
                Generate a temporary PNR itinerary accepted for visa applications, travel planning, and proof-of-onward-travel requirements.
            </p>
            <div class="d-flex flex-wrap gap-2 mb-4">
                <a class="btn btn-primary btn-lg" href="/order">Start My Order</a>
                <a class="btn btn-outline-secondary btn-lg" href="#how-it-works">How it works</a>
            </div>
            <ul class="landing-checks list-unstyled mb-0">
                <li>Instant processing workflow</li>
                <li>Trusted support team</li>
                <li>Secure payment gateway architecture</li>
            </ul>
        </div>
        <div class="col-lg-5">
            <div class="quote-card card border-0 shadow-sm">
                <div class="card-body p-4 p-lg-4">
                    <h2 class="h4 mb-3">Quick request form</h2>
                    <form action="/order" method="get" class="vstack gap-3">
                        <div>
                            <label for="full_name" class="form-label">Full name</label>
                            <input id="full_name" class="form-control" type="text" name="full_name" placeholder="Jane Doe" required>
                        </div>
                        <div>
                            <label for="email" class="form-label">Email address</label>
                            <input id="email" class="form-control" type="email" name="email" placeholder="you@example.com" required>
                        </div>
                        <div class="row g-2">
                            <div class="col-6">
                                <label for="from" class="form-label">From</label>
                                <input id="from" class="form-control" type="text" name="from" placeholder="NYC" required>
                            </div>
                            <div class="col-6">
                                <label for="to" class="form-label">To</label>
                                <input id="to" class="form-control" type="text" name="to" placeholder="LON" required>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-lg w-100">Continue</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="airline-strip py-4">
    <div class="d-flex flex-wrap justify-content-center gap-2">
        <span class="airline-chip">Emirates</span>
        <span class="airline-chip">Qatar Airways</span>
        <span class="airline-chip">Lufthansa</span>
        <span class="airline-chip">Delta</span>
        <span class="airline-chip">KLM</span>
        <span class="airline-chip">Turkish Airlines</span>
    </div>
</section>

<section id="how-it-works" class="py-5">
    <div class="text-center mb-4">
        <h2 class="h3 fw-bold">How it works</h2>
        <p class="text-muted mb-0">Three simple steps from request to delivery.</p>
    </div>
    <div class="row g-3">
        <div class="col-md-4">
            <div class="offer-card h-100 p-4">
                <h3 class="h5">1. Submit details</h3>
                <p class="mb-0 text-muted">Share traveler information and route details through a secure form.</p>
            </div>
        </div>
        <div class="col-md-4">
            <div class="offer-card h-100 p-4">
                <h3 class="h5">2. We process instantly</h3>
                <p class="mb-0 text-muted">Our team and automation engine prepare your verifiable booking reference.</p>
            </div>
        </div>
        <div class="col-md-4">
            <div class="offer-card h-100 p-4">
                <h3 class="h5">3. Receive confirmation</h3>
                <p class="mb-0 text-muted">Get your itinerary and PNR confirmation by email in minutes.</p>
            </div>
        </div>
    </div>
</section>

<section class="guarantee-band py-4 px-4 rounded-4 mb-5">
    <div class="row g-3 align-items-center">
        <div class="col-lg-8">
            <h2 class="h4 mb-1">100% Money-back guarantee</h2>
            <p class="mb-0">If we cannot provide your reservation on time, you receive a full refund.</p>
        </div>
        <div class="col-lg-4 text-lg-end">
            <a class="btn btn-light btn-lg" href="/contact">Talk to support</a>
        </div>
    </div>
</section>

<section class="py-2 pb-5">
    <div class="row g-3">
        <div class="col-md-6 col-lg-4">
            <div class="testimonial-card p-4 h-100">
                <p class="mb-3">“Needed a flight reservation quickly for my visa interview. Delivery was fast and smooth.”</p>
                <strong>— Aisha K.</strong>
            </div>
        </div>
        <div class="col-md-6 col-lg-4">
            <div class="testimonial-card p-4 h-100">
                <p class="mb-3">“Clear process, easy payment, and responsive support when I had a question.”</p>
                <strong>— Daniel M.</strong>
            </div>
        </div>
        <div class="col-md-6 col-lg-4">
            <div class="testimonial-card p-4 h-100">
                <p class="mb-3">“Got my itinerary in under 10 minutes. Would absolutely use again.”</p>
                <strong>— Priya S.</strong>
            </div>
        </div>
    </div>
</section>

<section class="faq-section py-4">
    <h2 class="h3 fw-bold text-center mb-4">Frequently asked questions</h2>
    <div class="accordion" id="landingFaq">
        <div class="accordion-item">
            <h3 class="accordion-header" id="faqOneHeading">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faqOne" aria-expanded="true" aria-controls="faqOne">
                    Is this a real, verifiable reservation?
                </button>
            </h3>
            <div id="faqOne" class="accordion-collapse collapse show" aria-labelledby="faqOneHeading" data-bs-parent="#landingFaq">
                <div class="accordion-body">Yes. We provide a real reservation record with a valid booking reference for verification checks.</div>
            </div>
        </div>
        <div class="accordion-item">
            <h3 class="accordion-header" id="faqTwoHeading">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faqTwo" aria-expanded="false" aria-controls="faqTwo">
                    How long does delivery take?
                </button>
            </h3>
            <div id="faqTwo" class="accordion-collapse collapse" aria-labelledby="faqTwoHeading" data-bs-parent="#landingFaq">
                <div class="accordion-body">Most requests are fulfilled within a few minutes, depending on route complexity and traffic.</div>
            </div>
        </div>
        <div class="accordion-item">
            <h3 class="accordion-header" id="faqThreeHeading">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faqThree" aria-expanded="false" aria-controls="faqThree">
                    What payment methods are supported?
                </button>
            </h3>
            <div id="faqThree" class="accordion-collapse collapse" aria-labelledby="faqThreeHeading" data-bs-parent="#landingFaq">
                <div class="accordion-body">The platform supports multiple payment gateway adapters and can be configured per environment.</div>
            </div>
        </div>
    </div>
</section>

<section class="final-cta text-center py-5 my-4 rounded-4">
    <h2 class="h3 fw-bold mb-2">Ready to secure your reservation?</h2>
    <p class="mb-4">Start your request now and receive your itinerary quickly.</p>
    <a class="btn btn-primary btn-lg" href="/order">Create My Reservation</a>
</section>

<?= $this->endSection() ?>
