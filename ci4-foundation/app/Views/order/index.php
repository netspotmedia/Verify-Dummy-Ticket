<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>
<h2>Order Wizard</h2>
<p>Server-rendered flow aligned to Services → Details → Review → Checkout.</p>

<form method="post" action="/order/review" class="card card-body">
  <div class="row g-3">
    <div class="col-12">
      <label class="form-label fw-semibold">Services</label><br>
      <div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" name="services[]" value="flight" checked><label class="form-check-label">Flight</label></div>
      <div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" name="services[]" value="hotel"><label class="form-check-label">Hotel</label></div>
      <div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" name="services[]" value="insurance"><label class="form-check-label">Insurance</label></div>
    </div>

    <div class="col-md-3"><label class="form-label">Travelers</label><input class="form-control" type="number" name="traveler_count" min="1" value="1"></div>
    <div class="col-md-3"><label class="form-label">Trip Type</label><select name="trip_type" class="form-select"><option value="one_way">One Way</option><option value="return_trip">Return</option><option value="multi_city">Multi City</option></select></div>
    <div class="col-md-3"><label class="form-label">Validity</label><select name="validity" class="form-select"><option value="3d">3 Days</option><option value="7d">7 Days</option><option value="14d">14 Days</option><option value="21d">21 Days</option><option value="30d">30 Days</option></select></div>
    <div class="col-md-3"><label class="form-label">Hotel Type</label><select name="hotel_type" class="form-select"><option value="shared_booking">Shared</option><option value="separate_per_traveler">Separate Per Traveler</option></select></div>

    <div class="col-md-4"><label class="form-label">Insurance Area</label><select name="insurance_area" class="form-select"><option value="schengen">Schengen</option><option value="worldwide_area_1">Worldwide Area 1</option><option value="worldwide_area_2">Worldwide Area 2</option></select></div>
    <div class="col-md-4"><label class="form-label">Insurance Duration</label><select name="insurance_duration" class="form-select"><option value="21d">21 Days</option><option value="3m">3 Months</option><option value="6m">6 Months</option><option value="1y">1 Year</option></select></div>
    <div class="col-md-4"><label class="form-label">Delivery Speed</label><select name="delivery_speed" class="form-select"><option value="normal">Normal</option><option value="fast">Fast</option><option value="express">Express</option></select></div>

    <div class="col-md-4"><label class="form-label">Currency</label><select name="currency" class="form-select"><option value="USD">USD</option><option value="NGN">NGN</option></select></div>
    <div class="col-md-4"><label class="form-label">Payment Provider</label><select name="provider" class="form-select"><option value="paystack">Paystack</option><option value="paypal">PayPal</option><option value="stripe">Stripe</option></select></div>

    <div class="col-md-6"><label class="form-label">Customer Name</label><input class="form-control" name="customer_name" required></div>
    <div class="col-md-6"><label class="form-label">Customer Email</label><input class="form-control" type="email" name="customer_email" required></div>

    <div class="col-12"><button class="btn btn-primary">Continue to Review</button></div>
  </div>
</form>
<?= $this->endSection() ?>
