<?php
require '../vendor/autoload.php';

use Ubersite\DatabaseManager;

/**
 * This script imports users from accounts.txt.
 * It should be in a format just like that of /etc/passwd
 */

if (PHP_SAPI != "cli") {
  echo "<div style='font-family: Consolas, \"Liberation Sans\", courier, monospace'>";
  echo "This script must be run via the command line.";
  exit;
}

$dbh = DatabaseManager::get();

$query = "INSERT INTO users (Username, Name, Role, Password) VALUES (?, ?, 'camper', NULL)";
$stmt = $dbh->prepare($query);

$data = explode("\n", trim(file_get_contents("accounts.txt")));

foreach ($data as $line) {
  if (strlen($line) === 0) {
    continue;
  }
  $info = explode(":", $line);
  $username = $info[0];
  $name = $info[4];
  $stmt->execute([$username, $name]);
}

echo "All done\n";
