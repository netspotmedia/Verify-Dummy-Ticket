<?php

namespace App\Filters;

use App\Models\IdempotencyKeyModel;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class IdempotencyFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $key = $request->getHeaderLine('Idempotency-Key');
        if ($key === '') {
            return service('response')->setStatusCode(400)->setJSON(['ok' => false, 'message' => 'Idempotency-Key header is required']);
        }

        $scope = implode(':', $arguments ?? ['global']);
        $payload = $request->getJSON(true);
        $requestHash = hash('sha256', json_encode($payload ?? []) ?: '');

        $model = new IdempotencyKeyModel();
        $existing = $model->where('idempotency_key', $key)->where('scope', $scope)->first();

        if (! $existing) {
            $model->insert([
                'idempotency_key' => $key,
                'scope' => $scope,
                'request_hash' => $requestHash,
                'expires_at' => date('Y-m-d H:i:s', time() + 3600),
            ]);

            return;
        }

        if (($existing['request_hash'] ?? '') !== $requestHash) {
            return service('response')->setStatusCode(409)->setJSON(['ok' => false, 'message' => 'Idempotency key reused with different payload']);
        }

        $storedBody = $existing['response_json'] ?? null;
        $storedStatus = (int) ($existing['status_code'] ?? 200);

        if ($storedBody) {
            return service('response')
                ->setStatusCode($storedStatus)
                ->setHeader('X-Idempotent-Replay', '1')
                ->setJSON(json_decode($storedBody, true) ?? ['ok' => true]);
        }

        return service('response')->setStatusCode(202)->setJSON([
            'ok' => false,
            'message' => 'Request already accepted and processing',
        ]);
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        $key = $request->getHeaderLine('Idempotency-Key');
        if ($key === '') {
            return;
        }

        $scope = implode(':', $arguments ?? ['global']);
        (new IdempotencyKeyModel())
            ->where('idempotency_key', $key)
            ->where('scope', $scope)
            ->set([
                'status_code' => $response->getStatusCode(),
                'response_json' => json_encode(json_decode($response->getBody(), true) ?? ['raw' => $response->getBody()]),
            ])
            ->update();
    }
}
