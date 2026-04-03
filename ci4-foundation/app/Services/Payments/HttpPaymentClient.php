<?php

namespace App\Services\Payments;

use RuntimeException;

class HttpPaymentClient
{
    /**
     * @param array<string,string> $headers
     * @return array<string,mixed>
     */
    public function postJson(string $url, array $payload, array $headers = []): array
    {
        $mergedHeaders = array_merge(['Content-Type: application/json'], $this->formatHeaders($headers));
        return $this->request('POST', $url, json_encode($payload, JSON_UNESCAPED_UNICODE), $mergedHeaders);
    }

    /**
     * @param array<string,string> $headers
     * @return array<string,mixed>
     */
    public function postForm(string $url, array $payload, array $headers = []): array
    {
        $mergedHeaders = array_merge(['Content-Type: application/x-www-form-urlencoded'], $this->formatHeaders($headers));
        return $this->request('POST', $url, http_build_query($payload), $mergedHeaders);
    }

    /**
     * @param array<string,string> $headers
     * @return array<string,mixed>
     */
    public function postWithBasicAuth(string $url, array $payload, string $username, string $password, array $headers = []): array
    {
        $token = base64_encode($username . ':' . $password);
        $headers['Authorization'] = 'Basic ' . $token;

        return $this->postForm($url, $payload, $headers);
    }

    /**
     * @param array<int,string> $headers
     * @return array<string,mixed>
     */
    private function request(string $method, string $url, string $body, array $headers): array
    {
        $ch = curl_init($url);
        if (! $ch) {
            throw new RuntimeException('Unable to initialize HTTP client.');
        }

        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
        ]);

        $responseBody = curl_exec($ch);
        $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($responseBody === false) {
            throw new RuntimeException('Payment API request failed: ' . $error);
        }

        $decoded = json_decode($responseBody, true);
        if (! is_array($decoded)) {
            throw new RuntimeException('Payment API response was not valid JSON.');
        }

        if ($statusCode >= 400) {
            $message = $decoded['message'] ?? $decoded['error']['message'] ?? ('HTTP ' . $statusCode);
            throw new RuntimeException('Payment API error: ' . (string) $message);
        }

        return $decoded;
    }

    /**
     * @param array<string,string> $headers
     * @return array<int,string>
     */
    private function formatHeaders(array $headers): array
    {
        $formatted = [];
        foreach ($headers as $key => $value) {
            $formatted[] = $key . ': ' . $value;
        }

        return $formatted;
    }
}
