# secret_updater.ps1
param(
    [Parameter(Mandatory=$true)][string]$EnvFile,  # e.g., .env.staging
    [Parameter(Mandatory=$true)][string]$Repo      # e.g., org/repo
)

# Check if gh CLI is available
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) is not installed or not in PATH."
    exit 1
}

# Check if logged in
$loggedIn = $true
try {
    gh auth status | Out-Null
} catch {
    $loggedIn = $false
}

if (-not $loggedIn) {
    Write-Host "You are not logged in to GitHub CLI. Running 'gh auth login'..."
    # Force interactive login and wait
    & gh auth login
    # Pause until the login finishes
    while ($true) {
        Start-Sleep -Seconds 2
        try {
            gh auth status | Out-Null
            break
        } catch {
            Write-Host "Waiting for login to complete..."
        }
    }
    Write-Host "Login successful."
}


# Read .env and set repo-level secrets
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }

    $splitIndex = $line.IndexOf("=")
    if ($splitIndex -lt 0) { return }

    $key = $line.Substring(0, $splitIndex).Trim()
    $value = $line.Substring($splitIndex + 1).Trim()

    Write-Host "Setting repo-level secret $key..."
    gh secret set $key --repo $Repo --body "$value"
}
