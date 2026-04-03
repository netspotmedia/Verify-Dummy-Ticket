<?php

namespace App\Filters;

use App\Models\RequestRateLimitModel;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class RateLimitFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $scope = $arguments[0] ?? 'global';
        $limit = isset($arguments[1]) ? (int) $arguments[1] : 60;
        $windowSeconds = isset($arguments[2]) ? (int) $arguments[2] : 60;

        $identifier = $request->getIPAddress() . '|' . $scope;
        $windowStartTs = floor(time() / $windowSeconds) * $windowSeconds;
        $windowStart = date('Y-m-d H:i:s', $windowStartTs);

        $model = new RequestRateLimitModel();
        $record = $model->where('scope', $scope)
            ->where('identifier', $identifier)
            ->where('window_start', $windowStart)
            ->first();

        if (! $record) {
            $model->insert([
                'scope' => $scope,
                'identifier' => $identifier,
                'window_start' => $windowStart,
                'request_count' => 1,
            ]);

            return;
        }

        $count = (int) $record['request_count'];
        if ($count >= $limit) {
            return service('response')->setStatusCode(429)->setJSON([
                'ok' => false,
                'message' => 'Too many requests. Please retry later.',
            ]);
        }

        $model->update((int) $record['id'], ['request_count' => $count + 1]);
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // No-op
    }
}
