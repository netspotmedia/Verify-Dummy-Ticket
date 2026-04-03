<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class AdminAuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        if (! session()->get('isAuthenticated')) {
            return redirect()->to('/auth/login')->with('error', 'Please log in first.');
        }

        if (! in_array(session()->get('role'), ['admin', 'super_admin'], true)) {
            return redirect()->to('/dashboard')->with('error', 'Admin access required.');
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // No-op
    }
}
