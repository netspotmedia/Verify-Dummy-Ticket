<?php

namespace App\Models;

use CodeIgniter\Model;

class RequestRateLimitModel extends Model
{
    protected $table = 'request_rate_limits';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'scope', 'identifier', 'window_start', 'request_count',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}
