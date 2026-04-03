<?php

namespace App\Controllers;

class DashboardController extends BaseController
{
    public function index()
    {
        return view('dashboard/index', ['title' => 'Dashboard', 'dashboard' => true]);
    }

    public function orders()
    {
        return $this->response->setJSON(['ok' => true, 'items' => []]);
    }

    public function tickets()
    {
        return $this->response->setJSON(['ok' => true, 'items' => []]);
    }

    public function createTicket()
    {
        return $this->response->setJSON(['ok' => true, 'message' => 'Ticket created']);
    }
}
