@echo off
cd /d "%~dp0"
chcp 65001 >nul
title Deploy Firebase - Fiancas2
echo.
echo ========================================
echo   DEPLOY AUTOMATICO - FIREBASE
echo ========================================
echo.
echo [1/3] Fazendo build do projeto...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Erro no build!
    pause
    exit /b 1
)
echo ✅ Build concluído!
echo.
echo [2/3] Verificando autenticacao...
call firebase.cmd projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo   LOGIN NECESSARIO
    echo ========================================
    echo.
    echo Voce precisa fazer login manualmente.
    echo.
    echo INSTRUCOES:
    echo 1. Abra um novo CMD (Windows+R, digite cmd)
    echo 2. Execute: cd "C:\Users\Barboza\OneDrive\Documentos\fiancas2"
    echo 3. Execute: firebase login
    echo 4. Faca login no navegador que abrir
    echo 5. Volte aqui e pressione qualquer tecla
    echo.
    pause
    echo.
    echo Verificando novamente...
    call firebase.cmd projects:list >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Ainda nao autenticado. Tente novamente.
        pause
        exit /b 1
    )
)
echo ✅ Autenticado!
echo.
echo [3/3] Fazendo deploy...
call firebase.cmd deploy --only hosting
if %errorlevel% neq 0 (
    echo ❌ Erro no deploy!
    pause
    exit /b 1
)
echo.
echo ========================================
echo   DEPLOY CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
