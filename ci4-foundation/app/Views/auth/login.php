<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>
<h2>Login</h2>
<p class="text-muted">Access your order workspace and support center.</p>

<?php if (session()->getFlashdata('error')): ?>
    <div class="alert alert-danger"><?= esc(session()->getFlashdata('error')) ?></div>
<?php endif; ?>
<?php if (session()->getFlashdata('message')): ?>
    <div class="alert alert-success"><?= esc(session()->getFlashdata('message')) ?></div>
<?php endif; ?>

<form method="post" action="/auth/login" class="card card-body" style="max-width:420px;">
    <div class="mb-3">
        <label class="form-label">Email</label>
        <input type="email" class="form-control" name="email" value="<?= esc(old('email', '')) ?>" required>
    </div>
    <div class="mb-3">
        <label class="form-label">Password</label>
        <input type="password" class="form-control" name="password" required>
    </div>
    <button class="btn btn-primary">Sign In</button>
</form>
<?= $this->endSection() ?>
