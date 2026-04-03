<?php

namespace App\Services\Payments;

use Config\Payment;

class StripeGateway implements PaymentGatewayInterface
{
    public function createCheckout(array $payload): array
    {
        $config = config(Payment::class);

        return [
            'provider' => 'stripe',
            'publishable_key' => $config->stripePublishableKey,
            'session_id' => 'sess_' . md5((string) microtime(true)),
            'status' => 'initiated',
            'note' => 'Replace with real Stripe SDK call in deployment.',
        ];
    }

    public function verifyWebhook(array $payload, ?string $signature = null): bool
    {
        return ! empty($signature) && isset($payload['type']);
    }
}
