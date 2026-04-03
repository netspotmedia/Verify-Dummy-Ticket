<?php

namespace App\Controllers;

class HomeController extends BaseController
{
    public function index()
    {
        return view('home/index', ['title' => 'Verify Dummy Ticket', 'landing' => true]);
    }

    public function services()
    {
        return view('home/services', ['title' => 'Services']);
    }

    public function contact()
    {
        return view('home/contact', ['title' => 'Contact']);
    }
}
