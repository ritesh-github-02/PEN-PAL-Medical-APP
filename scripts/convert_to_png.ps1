Add-Type -AssemblyName System.Drawing
Get-ChildItem scripts/pdf_spec_pages/*.bmp | ForEach-Object {
    $bmp = [System.Drawing.Bitmap]::FromFile($_.FullName)
    $pngPath = $_.FullName -replace '\.bmp$', '.png'
    $bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Converted $($pngPath)"
}
