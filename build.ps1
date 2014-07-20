Param(
    [string]$binDirPath
)

$tempZipFileName = [System.IO.Path]::Combine($binDirPath, "..\typedocs.zip")
$finalZipFileName = [System.IO.Path]::Combine($binDirPath, "typedocs.zip")

if ([System.IO.File]::Exists($tempZipFileName))
{
    [System.IO.File]::Delete($tempZipFileName)
}

if ([System.IO.File]::Exists($finalZipFileName))
{
    [System.IO.File]::Delete($finalZipFileName)
}

[Reflection.Assembly]::LoadWithPartialName("System.IO.Compression.FileSystem")
$compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal
[System.IO.Compression.ZipFile]::CreateFromDirectory($binDirPath, $tempZipFileName, $compressionLevel, $false)

[System.IO.File]::Move($tempZipFileName, $finalZipFileName)
