# Fix All Date Errors in SNP Project
# Run this PowerShell script to fix 2024 → 2025 date references

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SNP Date Fix Script" -ForegroundColor Cyan
Write-Host "Fixing 2024 → 2025 date references" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Files to update
$filesToFix = @(
    "README.md",
    "BTC-FI-Application\SNP_Pitch_Deck.md",
    "BTC-FI-Application\Financial_Model.md",
    "BTC-FI-Application\Roadmap_2025-2027.md",
    "BTC-FI-Application\Technical_Overview.md",
    "SUBMISSION.md",
    "TESTNET-DEPLOYMENT-GUIDE.md",
    "QUICK-DEPLOY.md",
    "YOUR-DEPLOYMENT.md",
    "IMPLEMENTATION-COMPLETE.md"
)

# Date replacements
$replacements = @(
    @{Old = "November 2024"; New = "November 2025"; Context = "sBTC launch date"},
    @{Old = "Nov 2024"; New = "Nov 2025"; Context = "sBTC launch date"},
    @{Old = "Q4 2024"; New = "Q4 2025"; Context = "Quarter reference"},
    @{Old = "Q1 2025"; New = "Q1 2026"; Context = "Future quarter reference"},
    @{Old = "Q2 2025"; New = "Q2 2026"; Context = "Future quarter reference"},
    @{Old = "Q3 2025"; New = "Q3 2026"; Context = "Future quarter reference"},
    @{Old = "Q4 2025"; New = "Q4 2026"; Context = "Future quarter reference"},
    @{Old = "December 2024"; New = "December 2025"; Context = "Current month"},
    @{Old = "January 2025"; New = "January 2026"; Context = "Next month"},
    @{Old = "2024 elections"; New = "2024 elections"; Context = "Historical - DO NOT CHANGE"},
    @{Old = "since 2024"; New = "since 2024"; Context = "Historical - DO NOT CHANGE"}
)

$totalChanges = 0
$filesChanged = 0

foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        Write-Host "Checking: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
        if (-not $content) {
            Write-Host "  ⚠ Could not read file" -ForegroundColor Red
            continue
        }
        
        $originalContent = $content
        $fileChanges = 0
        
        foreach ($replacement in $replacements) {
            $old = $replacement.Old
            $new = $replacement.New
            $context = $replacement.Context
            
            # Skip historical references
            if ($old -eq $new) { continue }
            
            $matches = ([regex]::Matches($content, [regex]::Escape($old))).Count
            
            if ($matches -gt 0) {
                $content = $content -replace [regex]::Escape($old), $new
                $fileChanges += $matches
                Write-Host "  ✓ Replaced '$old' → '$new' ($matches occurrences)" -ForegroundColor Green
            }
        }
        
        if ($fileChanges -gt 0) {
            Set-Content -Path $file -Value $content -NoNewline
            $totalChanges += $fileChanges
            $filesChanged++
            Write-Host "  📝 Saved: $fileChanges changes" -ForegroundColor Cyan
        } else {
            Write-Host "  ✓ No changes needed" -ForegroundColor Gray
        }
        Write-Host ""
    } else {
        Write-Host "  ⚠ File not found: $file" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Files processed: $($filesToFix.Count)" -ForegroundColor White
Write-Host "  Files changed: $filesChanged" -ForegroundColor Green
Write-Host "  Total replacements: $totalChanges" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check for any remaining 2024 references that might be problematic
Write-Host "Scanning for remaining 2024 references..." -ForegroundColor Yellow
$remainingRefs = @()

foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
        if ($content -match "\b2024\b") {
            $lines = ($content -split "`n")
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match "\b2024\b") {
                    $remainingRefs += @{
                        File = $file
                        Line = $i + 1
                        Content = $lines[$i].Trim()
                    }
                }
            }
        }
    }
}

if ($remainingRefs.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠ Found $($remainingRefs.Count) remaining 2024 references to review manually:" -ForegroundColor Yellow
    foreach ($ref in $remainingRefs) {
        Write-Host ""
        Write-Host "  File: $($ref.File)" -ForegroundColor White
        Write-Host "  Line $($ref.Line): $($ref.Content)" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "These may be historical references that should NOT be changed." -ForegroundColor Yellow
} else {
    Write-Host "✓ No remaining 2024 references found!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Date fix complete! ✨" -ForegroundColor Green
Write-Host ""
