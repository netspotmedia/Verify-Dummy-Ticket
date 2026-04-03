<?php

namespace App\Services\Payments;

use Config\Payment;
use RuntimeException;

class StripeGateway implements PaymentGatewayInterface
{
    public function createCheckout(array $payload): array
    {
        $config = config(Payment::class);

        if ($config->stripeSecretKey === '') {
            throw new RuntimeException('Stripe secret key is not configured.');
        }

        $response = (new HttpPaymentClient())->postForm(
            'https://api.stripe.com/v1/payment_intents',
            [
                'amount' => (int) round(((float) ($payload['amount'] ?? 0)) * 100),
                'currency' => strtolower((string) ($payload['currency'] ?? 'usd')),
                'description' => 'Order ' . (string) ($payload['order_number'] ?? ''),
                'metadata[order_number]' => (string) ($payload['order_number'] ?? ''),
                'receipt_email' => (string) ($payload['email'] ?? ''),
                'automatic_payment_methods[enabled]' => 'true',
            ],
            [
                'Authorization' => 'Bearer ' . $config->stripeSecretKey,
            ]
        );

        $intentId = (string) ($response['id'] ?? '');
        $clientSecret = (string) ($response['client_secret'] ?? '');

        if ($intentId === '' || $clientSecret === '') {
            throw new RuntimeException('Unexpected Stripe response format.');
        }

        return [
            'provider' => 'stripe',
            'payment_intent' => $intentId,
            'client_secret' => $clientSecret,
            'checkout_url' => '',
            'status' => 'initiated',
        ];
    }

    public function verifyWebhook(array $payload, ?string $signature = null): bool
    {
        return ! empty($signature) && isset($payload['type']);
    }
}
