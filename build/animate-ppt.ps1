param(
  [string]$Pptx = 'C:\Users\gambo\Documents\Git-Conflictos\Conflictos-Git-Presentacion.pptx',
  [string]$Pdf  = 'C:\Users\gambo\Documents\Git-Conflictos\Conflictos-Git-Presentacion.pdf'
)
$ErrorActionPreference = 'Stop'
$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = -1
$pres = $pp.Presentations.Open($Pptx, $false, $false, $true)
$animCount = 0
$transCount = 0
foreach ($slide in $pres.Slides) {
  try {
    $slide.SlideShowTransition.EntryEffect = 1793
    $slide.SlideShowTransition.Duration = 0.7
    $transCount++
  } catch { Write-Host "TRANS FAIL slide $($slide.SlideIndex): $($_.Exception.Message)" }
  foreach ($shape in $slide.Shapes) {
    if ($shape.Name -like 'a*') {
      try {
        $eff = $slide.TimeLine.MainSequence.AddEffect($shape, 10, 2, 1)
        if ($eff) { $eff.Timing.Duration = 0.45 }
        $animCount++
      } catch {
        Write-Host "ANIM FAIL slide $($slide.SlideIndex) shape $($shape.Name): $($_.Exception.Message)"
      }
    }
  }
}
$pres.Save()
$pres.SaveAs($Pdf, 32)
$pres.Close()
$pp.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($pres) | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($pp) | Out-Null
Write-Host "OK slides=$($pres.Slides.Count) animations=$animCount transitions=$transCount"
Write-Host "PDF=$Pdf"