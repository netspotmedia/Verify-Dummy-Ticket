<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>
<h2>Order Wizard</h2>
<p>This page is the CI4 server-rendered replacement for the current multi-step flow.</p>
<form method="post" action="/order/review" class="card card-body">
    <div class="row g-3">
        <div class="col-md-6"><input class="form-control" name="customer_name" placeholder="Customer Name"></div>
        <div class="col-md-6"><input class="form-control" name="customer_email" placeholder="Customer Email"></div>
        <div class="col-12"><button class="btn btn-primary">Continue to Review</button></div>
    </div>
</form>
<?= $this->endSection() ?>
