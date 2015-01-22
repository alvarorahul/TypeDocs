
:INITIALIZE
SET MSBUILDPATH="%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\MSBuild.exe"
IF EXIST "%PROGRAMFILES(x86)%\MsBuild\12.0" SET MSBUILDPATH="%PROGRAMFILES(x86)%\MsBuild\12.0\bin\MSBuild.exe"
IF EXIST "%PROGRAMFILES(x86)%\MsBuild\14.0" SET MSBUILDPATH="%PROGRAMFILES(x86)%\MsBuild\14.0\bin\MSBuild.exe"

ECHO %MSBUILDPATH%

SET BINDIR="%~dp0bin"

IF NOT EXIST %MSBuildPath% GOTO ERRORNOMSBUILD

:BUILD

IF NOT EXIST %BINDIR% MD %BINDIR%

copy "%~dp0README.md" "%~dp0bin\README.md"

%MSBUILDPATH% "%~dp0TypeDocs.sln" %*

powershell -ExecutionPolicy Unrestricted .\build.ps1 %BINDIR%

GOTO EXIT

:ERRORNOMSBUILD
@echo "Unable to find the path for MsBuild.exe at %MSBUILDPATH%"

:EXIT
