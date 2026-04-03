<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class Payment extends BaseConfig
{
    public string $defaultProvider = 'paystack';

    public bool $verifyWebhookSignature = true;

    public string $stripeSecretKey = '';

    public string $stripePublishableKey = '';

    public string $paystackSecretKey = '';

    public string $paystackPublicKey = '';

    public string $paypalClientId = '';

    public string $paypalClientSecret = '';

    /** @var array<string,string> */
    public array $providerSecrets = [
        'dummy' => 'replace-in-env',
        'stripe' => 'replace-with-stripe-webhook-secret',
        'paystack' => 'replace-with-paystack-webhook-secret',
        'paypal' => 'replace-with-paypal-webhook-id-or-secret',
    ];
}
