# SNP Testnet Deployment Verification Script
# Run this after all 34 transactions confirm

Write-Host "=== SNP Testnet Deployment Verification ===" -ForegroundColor Cyan

$deployer = "ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA"
$baseUrl = "https://api.testnet.hiro.so"

# Expected 17 contracts (including governance)
$contracts = @(
    "governance",
    "vault-stx-v2",
    "vault-conservative", 
    "vault-growth",
    "strategy-manager-v2",
    "strategy-alex-stx-usda",
    "strategy-arkadiko-vault",
    "strategy-bitflow-v1",
    "strategy-granite-v1",
    "strategy-hermetica-v1",
    "strategy-sbtc-v1",
    "strategy-stable-pool",
    "strategy-stackingdao-v1",
    "strategy-stackswap-v1",
    "strategy-stx-stacking",
    "strategy-velar-farm",
    "strategy-zest-v1"
)

Write-Host ""
Write-Host "[1/4] Checking Contract Deployments..." -ForegroundColor Yellow

$deployed = @()
$failed = @()

foreach ($contract in $contracts) {
    $url = "$baseUrl/v2/contracts/interface/$deployer/$contract"
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
        if ($response) {
            Write-Host "  OK $contract" -ForegroundColor Green
            $deployed += $contract
        }
    } catch {
        Write-Host "  FAIL $contract - NOT DEPLOYED" -ForegroundColor Red
        $failed += $contract
    }
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "[2/4] Deployment Summary" -ForegroundColor Yellow
if ($deployed.Count -eq 17) {
    Write-Host "  Deployed: $($deployed.Count)/17" -ForegroundColor Green
} else {
    Write-Host "  Deployed: $($deployed.Count)/17" -ForegroundColor Yellow
}
if ($failed.Count -gt 0) {
    Write-Host "  Failed: $($failed -join ', ')" -ForegroundColor Red
}

Write-Host ""
Write-Host "[3/4] Checking Transaction Confirmations..." -ForegroundColor Yellow
$txUrl = "$baseUrl/extended/v1/address/$deployer/transactions?limit=34"
try {
    $txs = Invoke-RestMethod -Uri $txUrl -Method Get
    $pending = $txs.results | Where-Object {$_.tx_status -eq "pending"}
    $success = $txs.results | Where-Object {$_.tx_status -eq "success"}
    
    Write-Host "  Success: $($success.Count)" -ForegroundColor Green
    Write-Host "  Pending: $($pending.Count)" -ForegroundColor Yellow
    
    if ($pending.Count -gt 0) {
        Write-Host ""
        Write-Host "  Waiting for confirmations..." -ForegroundColor Yellow
        $explorerUrl = "https://explorer.hiro.so/address/$deployer" + "?chain=testnet"
        Write-Host "  Check: $explorerUrl"
    }
} catch {
    Write-Host "  FAIL Failed to check transactions" -ForegroundColor Red
}

Write-Host ""
Write-Host "[4/4] Next Steps" -ForegroundColor Yellow
if ($deployed.Count -eq 17 -and $pending.Count -eq 0) {
    Write-Host "  ALL CONTRACTS DEPLOYED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Run integration tests:"
    Write-Host "    npm test" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Save contract addresses:"
    Write-Host "    .\scripts\save-testnet-addresses.ps1" -ForegroundColor Cyan
} else {
    Write-Host "  Wait for all confirmations, then re-run this script" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Verification Complete ===" -ForegroundColor Cyan
