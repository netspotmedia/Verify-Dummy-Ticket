<?php

namespace App\Services\Payments;

use Config\Payment;
use InvalidArgumentException;

class PayPalGateway implements PaymentGatewayInterface
{
    public function createCheckout(array $payload): array
    {
        $config = config(Payment::class);
        $currency = strtoupper((string) ($payload['currency'] ?? 'USD'));

        if ($currency !== 'USD') {
            throw new InvalidArgumentException('PayPal gateway is configured for USD only.');
        }

        return [
            'provider' => 'paypal',
            'currency' => 'USD',
            'client_id' => $config->paypalClientId,
            'payment_methods' => ['card', 'paypal_account'],
            'checkout_url' => '/paypal/checkout/' . ($payload['order_number'] ?? 'UNKNOWN'),
            'status' => 'initiated',
            'note' => 'Replace with real PayPal Orders API integration.',
        ];
    }

    public function verifyWebhook(array $payload, ?string $signature = null): bool
    {
        return ! empty($signature) && isset($payload['event_type']);
    }
}
