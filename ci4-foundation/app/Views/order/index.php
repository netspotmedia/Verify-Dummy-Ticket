<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>
<h2>Order Wizard</h2>
<p>Flow: Select services → common info → service details → delivery + review → checkout.</p>

<?php if (session()->getFlashdata('error')): ?>
  <div class="alert alert-danger"><?= esc(session()->getFlashdata('error')) ?></div>
<?php endif; ?>

<form method="post" action="/order/review" class="card card-body">
  <div class="row g-3">
    <div class="col-12">
      <label class="form-label fw-semibold">Services</label><br>
      <div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" name="services[]" value="flight" checked><label class="form-check-label">Flight Reservation</label></div>
      <div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" name="services[]" value="hotel"><label class="form-check-label">Hotel Confirmation</label></div>
      <div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" name="services[]" value="insurance"><label class="form-check-label">Travel Insurance</label></div>
    </div>

    <div class="col-md-3"><label class="form-label">Travelers</label><input class="form-control" type="number" name="traveler_count" min="1" value="1" required></div>
    <div class="col-md-3"><label class="form-label">Country</label><input class="form-control" name="customer_country" value="United States" required></div>
    <div class="col-md-3"><label class="form-label">Country Code</label><input class="form-control" name="customer_country_code" value="US" required></div>
    <div class="col-md-3 d-flex align-items-end"><div class="form-check"><input class="form-check-input" type="checkbox" name="separate_pnr_per_traveler" value="1"><label class="form-check-label">Separate PNR per traveler</label></div></div>

    <div class="col-md-3"><label class="form-label">Trip Type</label><select name="trip_type" class="form-select"><option value="one_way">One Way</option><option value="return_trip">Return</option><option value="multi_city">Multi City</option></select></div>
    <div class="col-md-3"><label class="form-label">Validity</label><select name="validity" class="form-select"><option value="3d">3 Days</option><option value="7d">7 Days</option><option value="14d">14 Days</option><option value="21d">21 Days</option><option value="30d">30 Days</option></select></div>
    <div class="col-md-3"><label class="form-label">Hotel Type</label><select name="hotel_type" class="form-select"><option value="one_for_all">One for all</option><option value="separate_per_traveler">Separate per traveler</option></select></div>
    <div class="col-md-3"><label class="form-label">Delivery Speed</label><select name="delivery_speed" class="form-select"><option value="normal">Normal (24h)</option><option value="fast">Fast (12h)</option><option value="express">Express (6h)</option></select></div>

    <div class="col-md-4"><label class="form-label">Insurance Area</label><select name="insurance_area" class="form-select"><option value="schengen">Schengen</option><option value="worldwide_area_1">Worldwide Area 1</option><option value="worldwide_area_2">Worldwide Area 2</option></select></div>
    <div class="col-md-4"><label class="form-label">Insurance Duration</label><select name="insurance_duration" class="form-select"><option value="21d">Up to 21 Days</option><option value="3m">Up to 3 Months</option><option value="6m">Up to 6 Months</option><option value="1y">Up to 1 Year</option></select></div>
    <div class="col-md-4"><label class="form-label">Gateway</label><select name="provider" class="form-select"><option value="paystack">Paystack</option><option value="paypal">PayPal</option></select></div>

    <div class="col-md-6"><label class="form-label">Customer Name</label><input class="form-control" name="customer_name" required></div>
    <div class="col-md-6"><label class="form-label">Delivery Email</label><input class="form-control" type="email" name="customer_email" required></div>

    <div class="col-12"><label class="form-label">Traveler Names (one per line, e.g. Mr John Doe)</label><textarea class="form-control" name="traveler_names" rows="4" placeholder="Mr John Doe&#10;Mrs Jane Doe"></textarea></div>

    <div class="col-12"><button class="btn btn-primary">Continue to Review</button></div>
  </div>
</form>
<?= $this->endSection() ?>
