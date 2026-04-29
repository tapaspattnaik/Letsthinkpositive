$html = Get-Content -Path "c:\Tapas\LetsThinkPositive\Website\WIP\index.html" -Raw -Encoding UTF8
$html = $html -replace "(?is)<footer class=`"footer`">.*?</footer>", ""

$startMarker = 'id="page-home"'

$parts = $html -split "<div\s+$startMarker\s+class=`"page`">"
if ($parts.Length -gt 1) {
    $contentPart = $parts[1]
    
    $subParts = $contentPart -split "</div><!-- /page-contact -->"
    
    $pages = "<div id=`"page-home`" class=`"page`">" + $subParts[0] + "</div><!-- /page-contact -->"
    
    $phpPath = "c:\Tapas\LetsThinkPositive\Website\WIP\wp-theme\letsthinkpositive\index.php"
    $php = Get-Content -Path $phpPath -Raw -Encoding UTF8
    
    $phpPattern = "(?s)<div id=`"site-content`">.*?</div>\s*<\?php\s*get_footer\(\);\s*\?>"
    $replacement = "<div id=`"site-content`">`n$pages`n</div>`n`n<?php`nget_footer();`n?>"
    
    $newPhp = [regex]::Replace($php, $phpPattern, $replacement)
    Set-Content -Path $phpPath -Value $newPhp -Encoding UTF8
    Write-Host "Success"
} else {
    Write-Host "Split failed"
}
