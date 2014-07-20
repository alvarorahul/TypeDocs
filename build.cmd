
:INITIALIZE
SET MSBUILDPATH="%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\MSBuild.exe"
SET BINDIR="%~dp0bin"

IF NOT EXIST %MSBuildPath% GOTO ERRORNOMSBUILD

:BUILD

IF NOT EXIST %BINDIR% MD %BINDIR%

%MSBUILDPATH% "%~dp0TypeDocs.sln"

powershell .\build.ps1 %BINDIR%

GOTO EXIT

:ERRORNOMSBUILD
@echo "Unable to find the path for MsBuild.exe at %MSBUILDPATH%"

:EXIT
