@echo off
REM Tek komutla hem frontend hem backend başlatır
start cmd /k "cd sui_dapp && npm run dev"
start cmd /k "cd oauth-server && npm start"
