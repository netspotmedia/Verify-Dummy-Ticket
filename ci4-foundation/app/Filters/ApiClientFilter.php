<?php

namespace App\Filters;

use App\Models\ApiClientModel;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class ApiClientFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $clientKey = $request->getHeaderLine('X-Client-Key');
        $clientSecret = $request->getHeaderLine('X-Client-Secret');

        if ($clientKey === '' || $clientSecret === '') {
            return service('response')->setStatusCode(401)->setJSON(['ok' => false, 'message' => 'Missing API client credentials']);
        }

        $client = (new ApiClientModel())
            ->where('client_key', $clientKey)
            ->where('is_active', 1)
            ->first();

        if (! $client || ! password_verify($clientSecret, $client['client_secret_hash'])) {
            return service('response')->setStatusCode(401)->setJSON(['ok' => false, 'message' => 'Invalid API client credentials']);
        }

        (new ApiClientModel())->update((int) $client['id'], ['last_used_at' => date('Y-m-d H:i:s')]);
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // No-op
    }
}
