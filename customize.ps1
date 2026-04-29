$phpPath = "c:\Tapas\LetsThinkPositive\Website\WIP\wp-theme\letsthinkpositive\index.php"
$php = Get-Content -Path $phpPath -Raw -Encoding UTF8

# Replace about-photo
$php = $php -replace '(?s)<div class="about-photo">.*?</div>', '<div class="about-photo" style="overflow:hidden;"><img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/images/tapas.jpg" alt="Tapas Pattanaik" style="width:100%;height:100%;object-fit:cover;"></div>'

# Replace video-thumbs
$iframeHTML = '<iframe src="https://www.youtube.com/embed/VIDEO_ID" allowfullscreen style="width:100%; aspect-ratio:16/9; border:none; border-radius:14px; margin-bottom:16px;"></iframe>'
$php = $php -replace '(?s)<div class="video-thumb"[^>]*><div class="play-btn">▶</div></div>', $iframeHTML

Set-Content -Path $phpPath -Value $php -Encoding UTF8
Write-Host "Customizations Applied"
