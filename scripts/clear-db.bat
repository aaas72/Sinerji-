@echo off
echo Running Database Clear Script...
cd server
npx ts-node ../scripts/clear-db.ts
pause
