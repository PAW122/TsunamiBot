Get-ChildItem -Path 'C:\Users\oem\OneDrive\Dokumenty\GitHub\TsunamiBot' -Recurse -Include *.ts, *.js, *.json, -Exclude node_modules | ForEach-Object {
    if (-not $_.PSIsContainer) {
        try {
            Get-Content $_.FullName -ErrorAction Stop
            $parentFolder = $_.DirectoryName
            while ($parentFolder -notmatch 'node_modules') {
                $parentFolder = Split-Path $parentFolder -Parent
            }
            if ($parentFolder -eq $null) {
                Write-Host "Odczytywany plik: $($_.FullName)"
            }
        } 
        catch {
            Write-Warning "Błąd odczytu pliku: $($_.FullName)"
        }
    } 
    elseif ($_.FullName -notlike '*node_modules*') {
        Write-Host "Odczytywany folder: $($_.FullName)"
    }
} | Measure-Object -Line