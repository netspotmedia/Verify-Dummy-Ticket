<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class Payment extends BaseConfig
{
    public string $defaultProvider = 'dummy';

    public bool $verifyWebhookSignature = true;

    public string $stripeSecretKey = '';

    public string $stripePublishableKey = '';

    /** @var array<string,string> */
    public array $providerSecrets = [
        'dummy' => 'replace-in-env',
        'stripe' => 'replace-with-stripe-webhook-secret',
    ];
}
