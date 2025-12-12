@echo off
echo ========================================
echo   Deploy para Firebase Hosting
echo ========================================
echo.
echo Verificando autenticacao...
call firebase.cmd projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Voce precisa fazer login primeiro!
    echo.
    echo Execute o arquivo login-firebase.bat primeiro
    echo OU abra o CMD e execute: firebase login
    echo.
    pause
    exit /b 1
)
echo.
echo Login OK! Fazendo build...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo Erro no build!
    pause
    exit /b 1
)
echo.
echo Build concluido! Fazendo deploy...
call firebase.cmd deploy --only hosting
if %errorlevel% neq 0 (
    echo.
    echo Erro no deploy!
    pause
    exit /b 1
)
echo.
echo ========================================
echo   Deploy concluido com sucesso!
echo ========================================
pause
