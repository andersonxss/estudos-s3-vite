param(
  [Parameter(Mandatory = $true)]
  [string]$Bucket,

  [string]$Profile = "",

  [string]$Region = ""
)

$ErrorActionPreference = "Stop"
$distPath = Join-Path $PSScriptRoot "..\dist"
$distPath = Resolve-Path -LiteralPath $distPath -ErrorAction Stop

$awsArgs = @()

if ($Profile) {
  $awsArgs += @("--profile", $Profile)
}

if ($Region) {
  $awsArgs += @("--region", $Region)
}

aws s3 sync $distPath "s3://$Bucket" --delete --exclude "index.html" --cache-control "public,max-age=31536000,immutable" @awsArgs
aws s3 cp (Join-Path $distPath "index.html") "s3://$Bucket/index.html" --cache-control "no-cache" --content-type "text/html" @awsArgs
