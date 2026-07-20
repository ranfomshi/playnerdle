Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$output = Join-Path $root 'images\social'
New-Item -ItemType Directory -Path $output -Force | Out-Null

$games = @(
  @{ Slug='home'; Name='Quick games. Proper challenges.'; Category='FREE BROWSER GAMES'; Source='background.jpg'; Url='' },
  @{ Slug='werdle'; Name='Werdle'; Category='WORD'; Source='werdle.png' },
  @{ Slug='bludle'; Name='Bludle'; Category='WORD'; Source='bludle.jpg' },
  @{ Slug='codle'; Name='Codle'; Category='WORD'; Source='codle.jpg' },
  @{ Slug='connex'; Name='Connex'; Category='WORD'; Source='connex.png' },
  @{ Slug='wordmash'; Name='Word Mash'; Category='WORD'; Source='background.jpg' },
  @{ Slug='glyph'; Name='Glyph'; Category='WORD'; Source='background.jpg' },
  @{ Slug='borrowedletters'; Name='Borrowed Letters'; Category='WORD'; Source='background.jpg' },
  @{ Slug='shiftyfades'; Name='Shifty Fades'; Category='COLOUR'; Source='shifty.png' },
  @{ Slug='colormatch'; Name='Colour Match'; Category='COLOUR'; Source='cm.jpg' },
  @{ Slug='afterimage'; Name='Afterimage'; Category='COLOUR'; Source='background.jpg' },
  @{ Slug='chromalock'; Name='Chroma Lock'; Category='COLOUR'; Source='background.jpg' },
  @{ Slug='guesshue'; Name='Guess Hue'; Category='COLOUR'; Source='hue.png' },
  @{ Slug='tintuition'; Name='Tintuition'; Category='COLOUR'; Source='tintuition.png' },
  @{ Slug='hunt'; Name='XY Marks the Spot'; Category='LOGIC'; Source='hunt.png' },
  @{ Slug='seequence'; Name='Seequence'; Category='LOGIC'; Source='seequence.jpg' },
  @{ Slug='deadcentre'; Name='Dead Centre'; Category='LOGIC'; Source='background.jpg' },
  @{ Slug='heardle'; Name='Heardle'; Category='AUDIO'; Source='heardle.png' },
  @{ Slug='reaction'; Name='Reaction'; Category='SPEED'; Source='reaction.jpg' },
  @{ Slug='alternate'; Name='Alternate'; Category='SPEED'; Source='alternate.jpg' },
  @{ Slug='trak'; Name='Trak'; Category='SPEED'; Source='trak.png' }
)

function Draw-Card($game) {
  $bitmap = New-Object System.Drawing.Bitmap 1200, 630
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.Clear([System.Drawing.Color]::FromArgb(19, 30, 53))

  $sourcePath = Join-Path (Join-Path $root 'images') $game.Source
  $source = [System.Drawing.Image]::FromFile($sourcePath)
  $scale = [Math]::Max(1200 / $source.Width, 630 / $source.Height)
  $width = [int]($source.Width * $scale)
  $height = [int]($source.Height * $scale)
  $graphics.DrawImage($source, [int]((1200 - $width) / 2), [int]((630 - $height) / 2), $width, $height)
  $source.Dispose()

  $overlay = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(198, 14, 25, 48))
  $graphics.FillRectangle($overlay, 0, 0, 1200, 630)
  $overlay.Dispose()

  $accent = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(226, 89, 105))
  $graphics.FillRectangle($accent, 72, 74, 58, 8)
  $accent.Dispose()

  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(201, 209, 224))
  $coral = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(244, 139, 133))
  $brandFont = New-Object System.Drawing.Font 'Segoe UI', 24, ([System.Drawing.FontStyle]::Bold)
  $categoryFont = New-Object System.Drawing.Font 'Segoe UI', 17, ([System.Drawing.FontStyle]::Bold)
  $nameSize = if ($game.Name.Length -gt 15) { 58 } elseif ($game.Name.Length -gt 10) { 68 } else { 82 }
  $nameFont = New-Object System.Drawing.Font 'Segoe UI', $nameSize, ([System.Drawing.FontStyle]::Bold)
  $tagFont = New-Object System.Drawing.Font 'Segoe UI', 23, ([System.Drawing.FontStyle]::Regular)

  $graphics.DrawString('BLUDLE.', $brandFont, $white, 72, 105)
  $graphics.DrawString($game.Category + ' GAME', $categoryFont, $coral, 74, 180)
  $nameRect = New-Object System.Drawing.RectangleF 68, 225, 1060, 145
  $graphics.DrawString($game.Name, $nameFont, $white, $nameRect)
  $graphics.DrawString('Free to play in your browser - No download', $tagFont, $muted, 74, 480)
  $pathLabel = if ($game.ContainsKey('Url')) { $game.Url } else { $game.Slug + '/' }
  $graphics.DrawString('bludle.com/' + $pathLabel, $brandFont, $white, 74, 535)

  foreach ($resource in @($white, $muted, $coral, $brandFont, $categoryFont, $nameFont, $tagFont)) { $resource.Dispose() }
  $graphics.Dispose()

  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
  $parameters = New-Object System.Drawing.Imaging.EncoderParameters 1
  $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 88L
  $bitmap.Save((Join-Path $output ($game.Slug + '.jpg')), $encoder, $parameters)
  $parameters.Dispose()
  $bitmap.Dispose()
}

foreach ($game in $games) { Draw-Card $game }
Write-Output "Generated $($games.Count) social cards in $output"
