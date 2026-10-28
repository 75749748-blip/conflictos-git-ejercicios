param(
  [string]$Title,
  [string]$Out,
  [int]$X = 60,
  [int]$Y = 60
)
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public class WinShot {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
  [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr hwnd, int attr, out RECT value, int size);
  public struct RECT { public int Left, Top, Right, Bottom; }
}
"@
$found = [IntPtr]::Zero
$foundTitle = ''
$cb = [WinShot+EnumWindowsProc]{
  param($h, $l)
  if ([WinShot]::IsWindowVisible($h)) {
    $sb = New-Object System.Text.StringBuilder 512
    [WinShot]::GetWindowText($h, $sb, $sb.Capacity) | Out-Null
    $t = $sb.ToString()
    if ($t -and $t.Contains($Title)) { $script:found = $h; $script:foundTitle = $t; return $false }
  }
  return $true
}
[WinShot]::EnumWindows($cb, [IntPtr]::Zero) | Out-Null
if ($found -eq [IntPtr]::Zero) { throw "No window: $Title" }

[WinShot]::ShowWindow($found, 9) | Out-Null
$r = New-Object WinShot+RECT
[WinShot]::GetWindowRect($found, [ref]$r) | Out-Null
$w = $r.Right - $r.Left
$h = $r.Bottom - $r.Top
[WinShot]::MoveWindow($found, $X, $Y, $w, $h, $true) | Out-Null
[WinShot]::BringWindowToTop($found) | Out-Null
[WinShot]::SetForegroundWindow($found) | Out-Null
Start-Sleep -Milliseconds 900

# DWMWA_EXTENDED_FRAME_BOUNDS = 9: visible frame without the drop shadow.
$dwm = New-Object WinShot+RECT
$ok = [WinShot]::DwmGetWindowAttribute($found, 9, [ref]$dwm, [System.Runtime.InteropServices.Marshal]::SizeOf($dwm))
if ($ok -eq 0 -and ($dwm.Right - $dwm.Left) -gt 100) { $r = $dwm } else { [WinShot]::GetWindowRect($found, [ref]$r) | Out-Null }

$w = $r.Right - $r.Left
$h = $r.Bottom - $r.Top
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($r.Left, $r.Top, 0, 0, $bmp.Size)
# Recorta solo el borde y la barra de desplazamiento de la ventana.
$cropL = 1; $cropR = 14; $cropB = 6
$rect = New-Object System.Drawing.Rectangle($cropL, 0, ($w - $cropL - $cropR), ($h - $cropB))
$bmp2 = $bmp.Clone($rect, $bmp.PixelFormat)
$bmp2.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp2.Dispose()
$g.Dispose()
$bmp.Dispose()
Write-Host "captured $Out ${w}x${h} at $($r.Left),$($r.Top) title=$foundTitle"
