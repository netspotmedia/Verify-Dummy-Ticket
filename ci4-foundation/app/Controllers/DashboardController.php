<?php

namespace App\Controllers;

use App\Models\OrderModel;
use App\Models\PaymentModel;
use App\Models\TicketModel;

class DashboardController extends BaseController
{
    public function index()
    {
        $userId = (int) session()->get('userId');

        $orderModel = new OrderModel();
        $ticketModel = new TicketModel();

        $orders = $orderModel->where('user_id', $userId)->orderBy('updated_at', 'DESC')->findAll(10);
        $tickets = $ticketModel->where('user_id', $userId)->orderBy('updated_at', 'DESC')->findAll(5);

        $metrics = [
            'active_orders' => (int) $orderModel->where('user_id', $userId)->whereIn('status', ['pending', 'processing'])->countAllResults(),
            'pending_payment' => (int) $orderModel->where('user_id', $userId)->where('payment_status', 'pending')->countAllResults(),
            'completed' => (int) $orderModel->where('user_id', $userId)->where('status', 'completed')->countAllResults(),
            'open_tickets' => (int) $ticketModel->where('user_id', $userId)->whereIn('status', ['open', 'pending'])->countAllResults(),
        ];

        return view('dashboard/index', [
            'title' => 'Dashboard',
            'dashboard' => true,
            'orders' => $orders,
            'tickets' => $tickets,
            'metrics' => $metrics,
        ]);
    }

    public function orders()
    {
        $userId = (int) session()->get('userId');
        $items = (new OrderModel())->where('user_id', $userId)->orderBy('created_at', 'DESC')->findAll(50);

        return $this->response->setJSON(['ok' => true, 'items' => $items]);
    }

    public function tickets()
    {
        $userId = (int) session()->get('userId');
        $items = (new TicketModel())->where('user_id', $userId)->orderBy('created_at', 'DESC')->findAll(50);

        return $this->response->setJSON(['ok' => true, 'items' => $items]);
    }

    public function createTicket()
    {
        $userId = (int) session()->get('userId');
        $subject = trim((string) $this->request->getPost('subject'));

        if ($subject === '') {
            return redirect()->back()->with('error', 'Ticket subject is required.');
        }

        $ticketNumber = 'SUP-' . date('Ymd') . '-' . strtoupper(substr(sha1((string) microtime(true)), 0, 6));

        $id = (new TicketModel())->insert([
            'ticket_number' => $ticketNumber,
            'user_id' => $userId,
            'order_id' => $this->request->getPost('order_id') ? (int) $this->request->getPost('order_id') : null,
            'subject' => $subject,
            'status' => 'open',
            'priority' => (string) ($this->request->getPost('priority') ?: 'normal'),
            'last_message_at' => date('Y-m-d H:i:s'),
            'closed_at' => null,
        ]);

        if ($this->request->isAJAX()) {
            return $this->response->setJSON(['ok' => true, 'ticket_id' => $id, 'ticket_number' => $ticketNumber]);
        }

        return redirect()->to('/dashboard')->with('message', 'Support ticket created successfully.');
    }
}
