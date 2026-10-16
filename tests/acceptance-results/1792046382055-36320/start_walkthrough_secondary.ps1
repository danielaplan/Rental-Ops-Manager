$ErrorActionPreference = 'Stop'
$env:AKAD_DB_NAME = 'akad_verify_plan_1792046564392_28220'
$env:AKAD_DB_HOST = 'localhost'
$env:AKAD_ENV = 'test'
Write-Host "SYNTHETIC SECOND CLIENT ONLY: $env:AKAD_DB_NAME."
rtk proxy C:/xampp/php/php.exe -S 127.0.0.1:8036 -t C:/Users/acer/Desktop/Rental-Ops-Manager
