# Скрипт для настройки Git и GitHub
# Запустите этот скрипт ПОСЛЕ установки Git

Write-Host "🚀 Настройка Git репозитория для MurodTrader..." -ForegroundColor Green
Write-Host ""

# Проверка Git
try {
    $gitVersion = git --version
    Write-Host "✅ Git установлен: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git не установлен!" -ForegroundColor Red
    Write-Host "Скачайте Git с https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📝 Введите данные для GitHub:" -ForegroundColor Cyan
Write-Host ""

# Запрос данных
$userName = Read-Host "Ваше имя (для Git)"
$userEmail = Read-Host "Ваш email (для Git)"
$githubUsername = Read-Host "Ваш GitHub username"

Write-Host ""
Write-Host "⚙️ Настраиваю Git..." -ForegroundColor Yellow

# Настройка Git
git config --global user.name "$userName"
git config --global user.email "$userEmail"

Write-Host "✅ Git настроен!" -ForegroundColor Green
Write-Host ""

# Инициализация репозитория
Write-Host "📦 Инициализирую Git репозиторий..." -ForegroundColor Yellow

git init
git add .
git commit -m "Initial commit - MurodTrader AI Pattern Finder with 750 assets"
git branch -M main

Write-Host "✅ Локальный репозиторий создан!" -ForegroundColor Green
Write-Host ""

# Подключение к GitHub
Write-Host "🔗 Подключаю к GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "ВАЖНО: Создайте репозиторий на GitHub:" -ForegroundColor Cyan
Write-Host "1. Откройте https://github.com/new" -ForegroundColor White
Write-Host "2. Название: murodtrader-app" -ForegroundColor White
Write-Host "3. Public" -ForegroundColor White
Write-Host "4. НЕ добавляйте README и .gitignore" -ForegroundColor White
Write-Host "5. Нажмите Create repository" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Репозиторий создан на GitHub? (y/n)"

if ($continue -eq "y") {
    $repoUrl = "https://github.com/$githubUsername/murodtrader-app.git"
    
    git remote add origin $repoUrl
    
    Write-Host ""
    Write-Host "🚀 Загружаю код на GitHub..." -ForegroundColor Yellow
    
    git push -u origin main
    
    Write-Host ""
    Write-Host "✅ КОД ЗАГРУЖЕН НА GITHUB!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Ваш репозиторий: https://github.com/$githubUsername/murodtrader-app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔗 Теперь подключите к Netlify:" -ForegroundColor Yellow
    Write-Host "1. Откройте https://app.netlify.com/sites/murod77/settings" -ForegroundColor White
    Write-Host "2. Build & deploy → Continuous deployment" -ForegroundColor White
    Write-Host "3. Link repository → GitHub → murodtrader-app" -ForegroundColor White
    Write-Host ""
    Write-Host "✨ После этого любые изменения будут деплоиться автоматически!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⏸️ Создайте репозиторий на GitHub и запустите скрипт снова" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Нажмите Enter для выхода..."
Read-Host
