@echo off
echo ===== Pushing changes to Git repository =====

echo Running delete-docker-files.bat first...
call delete-docker-files.bat

echo Adding all files to staging...
git add .

echo Making a commit...
git commit -m "Switch to direct Node.js deployment for Railway"

echo Pushing to remote repository...
git push

echo ===== Done! =====
pause
