<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class Payment extends BaseConfig
{
    public string $defaultProvider = 'dummy';

    /** @var array<string,string> */
    public array $providerSecrets = [
        'dummy' => 'replace-in-env',
    ];

    public bool $verifyWebhookSignature = true;
}
