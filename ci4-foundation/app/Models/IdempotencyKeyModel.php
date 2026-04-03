<?php

namespace App\Models;

use CodeIgniter\Model;

class IdempotencyKeyModel extends Model
{
    protected $table = 'idempotency_keys';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'idempotency_key', 'scope', 'request_hash', 'response_json', 'status_code', 'expires_at',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = '';
}
