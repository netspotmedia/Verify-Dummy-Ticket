<?php

namespace App\Services\Payments;

use Config\Payment;

class PaymentGatewayFactory
{
    public static function make(?string $provider = null): PaymentGatewayInterface
    {
        $config = config(Payment::class);
        $selected = strtolower($provider ?? $config->defaultProvider);

        switch ($selected) {
            case 'stripe':
                return new StripeGateway();
            case 'dummy':
            default:
                return new DummyGateway();
        }
    }
}
