@echo off
setlocal

if "%HARNESS_PACKAGE%"=="" set "HARNESS_PACKAGE=github:ihorleleka/harness"
for %%I in ("%~dp0.") do set "HARNESS_AGENTS_DIR=%%~nxI"

call npx "%HARNESS_PACKAGE%" update "%~dp0.." --agents-dir "%HARNESS_AGENTS_DIR%" %*
exit /b %ERRORLEVEL%
