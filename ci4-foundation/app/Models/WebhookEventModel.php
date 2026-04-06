<?php

namespace App\Models;

use CodeIgniter\Model;

class WebhookEventModel extends Model
{
    protected $table = 'webhook_events';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'provider', 'event_id', 'idempotency_key', 'payload_json', 'processed', 'processed_at',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = '';
}
