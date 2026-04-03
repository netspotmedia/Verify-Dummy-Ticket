<?php

namespace App\Models;

use CodeIgniter\Model;

class ApiClientModel extends Model
{
    protected $table = 'api_clients';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'client_name', 'client_key', 'client_secret_hash', 'is_active', 'last_used_at',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}
