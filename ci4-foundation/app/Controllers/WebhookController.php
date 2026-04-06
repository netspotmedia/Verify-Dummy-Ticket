<?php

namespace App\Controllers;

class WebhookController extends BaseController
{
    public function payment()
    {
        $payload = $this->request->getJSON(true) ?? [];

        // Persist and validate signature in Part 2.
        return $this->response->setJSON(['received' => true, 'payload' => $payload]);
    }
}
