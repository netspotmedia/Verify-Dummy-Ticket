<?php

declare(strict_types=1);

$repoRoot = dirname(__DIR__);
$routesFile = $repoRoot . '/app/Config/Routes.php';
$viewsPath = $repoRoot . '/app/Views';

$routes = [
    'GET' => [],
    'POST' => [],
];

$prefixStack = [''];
$lines = file($routesFile, FILE_IGNORE_NEW_LINES) ?: [];

foreach ($lines as $line) {
    if (preg_match('/\$routes->group\(\'([^\']+)\'/', $line, $m) === 1) {
        $current = end($prefixStack) ?: '';
        $prefixStack[] = rtrim($current, '/') . '/' . trim($m[1], '/');
        continue;
    }

    if (strpos($line, '});') !== false && count($prefixStack) > 1) {
        array_pop($prefixStack);
        continue;
    }

    if (preg_match('/\$routes->(get|post)\(\'([^\']+)\'/', $line, $m) === 1) {
        $method = strtoupper($m[1]);
        $path = '/' . ltrim($m[2], '/');
        $prefix = end($prefixStack) ?: '';
        $fullPath = rtrim($prefix, '/') . $path;
        $routes[$method][] = preg_replace('#//+#', '/', $fullPath);
    }
}

$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($viewsPath));
$errors = [];

foreach ($iterator as $file) {
    if (! $file->isFile() || $file->getExtension() !== 'php') {
        continue;
    }

    $content = file_get_contents($file->getPathname()) ?: '';
    preg_match_all('/<form[^>]*method="(get|post)"[^>]*action="([^"]+)"/i', $content, $matches, PREG_SET_ORDER);

    foreach ($matches as $match) {
        $method = strtoupper($match[1]);
        $action = $match[2];

        if (! str_starts_with($action, '/')) {
            continue;
        }

        if (str_contains($action, '<?=') || str_contains($action, '(:')) {
            continue;
        }

        $actionNormalized = rtrim($action, '/');
        if ($actionNormalized === '') {
            $actionNormalized = '/';
        }

        $routeNormalized = array_map(static fn ($r) => rtrim($r, '/') ?: '/', $routes[$method]);

        if (! in_array($actionNormalized, $routeNormalized, true)) {
            $errors[] = sprintf('%s: %s %s not found in Routes.php', str_replace($repoRoot . '/', '', $file->getPathname()), $method, $action);
        }
    }
}

if ($errors !== []) {
    fwrite(STDERR, "Route/form validation failed:\n");
    foreach ($errors as $error) {
        fwrite(STDERR, ' - ' . $error . "\n");
    }
    exit(1);
}

echo "Route/form validation passed.\n";
