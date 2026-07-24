<?php
echo "HTTPS: " . ($_SERVER['HTTPS'] ?? 'off') . "\n";
echo "X-Forwarded-Proto: " . ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? 'none') . "\n";
echo "Request URI: " . ($_SERVER['REQUEST_URI'] ?? '') . "\n";
