<?php

namespace App\Controllers;

use App\Models\UserModel;

class AuthController extends BaseController
{
    public function login()
    {
        return view('auth/login', ['title' => 'Login']);
    }

    public function attemptLogin()
    {
        $email = (string) $this->request->getPost('email');
        $password = (string) $this->request->getPost('password');

        $user = (new UserModel())->where('email', $email)->first();

        if (! $user || ! password_verify($password, $user['password_hash'])) {
            return redirect()->back()->withInput()->with('error', 'Invalid credentials.');
        }

        session()->set([
            'userId' => (int) $user['id'],
            'role' => $user['role'],
            'email' => $user['email'],
            'isAuthenticated' => true,
        ]);

        return redirect()->to('/dashboard');
    }

    public function logout()
    {
        session()->destroy();
        return redirect()->to('/auth/login')->with('message', 'You have been logged out.');
    }
}
