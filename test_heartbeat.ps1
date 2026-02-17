$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $env:VITE_SUPABASE_ANON_KEY"
    "apikey" = "$env:VITE_SUPABASE_ANON_KEY"
}

$body = @{
    table_id = "T01"
    battery = 95
} | ConvertTo-Json

$url = "https://ohkrzxcmueodijbhxxgx.functions.supabase.co/device-heartbeat"

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "✅ Status Code: 200 OK"
    Write-Host "Response:"
    Write-Host ($response | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "❌ Request Failed"
    Write-Host "Status Code:" $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response Body: $responseBody"
}
