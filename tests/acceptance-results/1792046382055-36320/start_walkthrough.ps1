$ErrorActionPreference = 'Stop'
$env:AKAD_DB_NAME = 'akad_verify_plan_1792046564392_28220'
$env:AKAD_DB_HOST = 'localhost'
$env:AKAD_ENV = 'test'
Write-Host "SYNTHETIC ONLY: $env:AKAD_DB_NAME. Close this process to stop the walkthrough server."
rtk proxy C:/xampp/php/php.exe -S 127.0.0.1:8035 -t C:/Users/acer/Desktop/Rental-Ops-Manager
