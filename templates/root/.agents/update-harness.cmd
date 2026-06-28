@echo off
setlocal

if "%HARNESS_PACKAGE%"=="" set "HARNESS_PACKAGE=github:ihorleleka/harness"

npx %HARNESS_PACKAGE% update "%~dp0.." %*
