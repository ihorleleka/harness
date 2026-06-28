@echo off
setlocal

if "%HARNESS_PACKAGE%"=="" set "HARNESS_PACKAGE=github:ihorleleka/harness"

call npx "%HARNESS_PACKAGE%" update "%~dp0.." %*
exit /b %ERRORLEVEL%
