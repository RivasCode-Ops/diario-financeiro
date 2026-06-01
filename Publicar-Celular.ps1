# Diário Financeiro — servidor na rede local (celular na mesma Wi-Fi)
$Root = (Resolve-Path $PSScriptRoot).Path
$Port = 8790

Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Write-Host ""
Write-Host "========================================"
Write-Host "  DIARIO FINANCEIRO — CELULAR"
Write-Host "========================================"
Write-Host ""

$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
  Write-Host "ERRO: Python nao encontrado."
  Write-Host "Instale: https://www.python.org/downloads/"
  Read-Host "Enter"
  exit 1
}

try {
  New-NetFirewallRule -DisplayName "Diario Financeiro $Port" -Direction Inbound `
    -Protocol TCP -LocalPort $Port -Action Allow -ErrorAction Stop | Out-Null
  Write-Host "Firewall: porta $Port liberada."
} catch {
  Write-Host "Firewall: nao alterado (execute como Admin se o celular nao conectar)."
}

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "python"
$psi.Arguments = "-m http.server $Port --bind 0.0.0.0"
$psi.WorkingDirectory = $Root
$psi.WindowStyle = "Normal"
[void][System.Diagnostics.Process]::Start($psi)

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "No CELULAR (mesma Wi-Fi), abra um destes links:"
Write-Host ""
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notmatch '^127\.' -and $_.PrefixOrigin -ne 'WellKnown' } |
  ForEach-Object {
    Write-Host "  --> http://$($_.IPAddress):$Port/" -ForegroundColor Green
  }
Write-Host ""
Write-Host "No PC: http://127.0.0.1:$Port/"
Write-Host ""
Start-Process "http://127.0.0.1:$Port/"
