# Save Testnet Contract Addresses

$deployer = "ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA"
$contracts = @(
    "governance", "vault-stx-v2", "vault-conservative", "vault-growth",
    "strategy-manager-v2", "strategy-alex-stx-usda", "strategy-arkadiko-vault",
    "strategy-bitflow-v1", "strategy-granite-v1", "strategy-hermetica-v1",
    "strategy-sbtc-v1", "strategy-stable-pool", "strategy-stackingdao-v1",
    "strategy-stackswap-v1", "strategy-stx-stacking", "strategy-velar-farm",
    "strategy-zest-v1"
)

$addresses = @{}
foreach ($contract in $contracts) {
    $addresses[$contract] = "$deployer.$contract"
}

# Save as JSON
$addresses | ConvertTo-Json | Out-File "deployments\testnet-addresses.json"

# Save as ENV format
$envContent = "# SNP Testnet Contract Addresses`n"
foreach ($key in $addresses.Keys) {
    $envKey = $key.ToUpper().Replace("-", "_")
    $envContent += "VITE_${envKey}_ADDRESS=$($addresses[$key])`n"
}
$envContent | Out-File "frontend\.env.testnet"

Write-Host "✅ Addresses saved:" -ForegroundColor Green
Write-Host "   - deployments\testnet-addresses.json"
Write-Host "   - frontend\.env.testnet"
