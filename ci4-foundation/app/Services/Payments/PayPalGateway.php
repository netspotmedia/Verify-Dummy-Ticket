<?php

namespace App\Services\Payments;

use Config\Payment;
use InvalidArgumentException;
use RuntimeException;

class PayPalGateway implements PaymentGatewayInterface
{
    public function createCheckout(array $payload): array
    {
        $config = config(Payment::class);
        $currency = strtoupper((string) ($payload['currency'] ?? 'USD'));

        if ($currency !== 'USD') {
            throw new InvalidArgumentException('PayPal gateway is configured for USD only.');
        }

        if ($config->paypalClientId === '' || $config->paypalClientSecret === '') {
            throw new RuntimeException('PayPal client credentials are not configured.');
        }

        $baseUrl = ENVIRONMENT === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

        $oauth = (new HttpPaymentClient())->postWithBasicAuth(
            $baseUrl . '/v1/oauth2/token',
            ['grant_type' => 'client_credentials'],
            $config->paypalClientId,
            $config->paypalClientSecret
        );

        $accessToken = (string) ($oauth['access_token'] ?? '');
        if ($accessToken === '') {
            throw new RuntimeException('Unable to obtain PayPal access token.');
        }

        $order = (new HttpPaymentClient())->postJson(
            $baseUrl . '/v2/checkout/orders',
            [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'reference_id' => (string) ($payload['order_number'] ?? ''),
                    'amount' => [
                        'currency_code' => 'USD',
                        'value' => number_format((float) ($payload['amount'] ?? 0), 2, '.', ''),
                    ],
                ]],
            ],
            [
                'Authorization' => 'Bearer ' . $accessToken,
            ]
        );

        $approvalUrl = '';
        foreach ((array) ($order['links'] ?? []) as $link) {
            if (($link['rel'] ?? '') === 'approve') {
                $approvalUrl = (string) ($link['href'] ?? '');
                break;
            }
        }

        if ($approvalUrl === '') {
            throw new RuntimeException('PayPal approval URL missing from response.');
        }

        return [
            'provider' => 'paypal',
            'currency' => 'USD',
            'checkout_url' => $approvalUrl,
            'reference' => (string) ($order['id'] ?? ''),
            'status' => 'initiated',
        ];
    }

    public function verifyWebhook(array $payload, ?string $signature = null): bool
    {
        return ! empty($signature) && isset($payload['event_type']);
    }
}
