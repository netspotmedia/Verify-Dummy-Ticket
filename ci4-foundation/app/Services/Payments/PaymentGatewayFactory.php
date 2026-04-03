<?php

namespace App\Services\Payments;

use Config\Payment;

class PaymentGatewayFactory
{
    public static function make(?string $provider = null): PaymentGatewayInterface
    {
        $config = config(Payment::class);
        $selected = $provider ?? $config->defaultProvider;

        switch ($selected) {
            case 'dummy':
            default:
                return new DummyGateway();
        }
    }
}
