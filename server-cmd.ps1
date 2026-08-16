# Helper to run commands on server via plink
param([string]$Command)

$p = New-Object System.Diagnostics.Process
$p.StartInfo.FileName = "C:\Program Files\PuTTY\plink.exe"
$escaped = $Command -replace '"', '\"'
$p.StartInfo.Arguments = "-ssh -pw `"Vehicle`$2026`" -hostkey `"ssh-ed25519 255 SHA256:rSwb3nXMH3L7JNE8xrK3VcCxuI4D+TvA6RhZGPdtmbY`" ArticGroup@102.37.128.81 `"$escaped`""
$p.StartInfo.UseShellExecute = $false
$p.StartInfo.RedirectStandardOutput = $true
$p.StartInfo.RedirectStandardError = $true
$p.StartInfo.RedirectStandardInput = $true
$p.Start() | Out-Null
Start-Sleep -Seconds 2
$p.StandardInput.WriteLine("")
Start-Sleep -Milliseconds 500
$p.StandardInput.Close()
$out = $p.StandardOutput.ReadToEnd()
$p.WaitForExit(60000)
Write-Host $out
