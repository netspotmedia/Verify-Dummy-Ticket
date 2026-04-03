<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;

class DocumentUploadController extends BaseController
{
    public function store()
    {
        $file = $this->request->getFile('document');
        if (! $file || ! $file->isValid()) {
            return $this->response->setStatusCode(422)->setJSON(['ok' => false, 'message' => 'Invalid upload']);
        }

        $allowedMime = ['application/pdf', 'image/jpeg', 'image/png'];
        if (! in_array($file->getMimeType(), $allowedMime, true)) {
            return $this->response->setStatusCode(415)->setJSON(['ok' => false, 'message' => 'Unsupported file type']);
        }

        $newName = $file->getRandomName();
        $file->move(WRITEPATH . 'uploads/order-docs', $newName);

        return $this->response->setJSON([
            'ok' => true,
            'path' => 'uploads/order-docs/' . $newName,
            'original_name' => $file->getClientName(),
        ]);
    }
}
