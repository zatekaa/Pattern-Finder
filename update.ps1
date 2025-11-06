# Скрипт для быстрого обновления кода на GitHub
# Используйте этот скрипт каждый раз когда меняете код

Write-Host "🔄 Обновление кода на GitHub..." -ForegroundColor Green
Write-Host ""

# Проверка изменений
$status = git status --short

if ($status) {
    Write-Host "📝 Найдены изменения:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    
    # Запрос описания изменений
    $message = Read-Host "Опишите изменения (или нажмите Enter для 'Update')"
    
    if ([string]::IsNullOrWhiteSpace($message)) {
        $message = "Update"
    }
    
    # Добавление, коммит и пуш
    Write-Host ""
    Write-Host "📦 Добавляю файлы..." -ForegroundColor Yellow
    git add .
    
    Write-Host "💾 Создаю коммит..." -ForegroundColor Yellow
    git commit -m "$message"
    
    Write-Host "🚀 Загружаю на GitHub..." -ForegroundColor Yellow
    git push
    
    Write-Host ""
    Write-Host "✅ КОД ОБНОВЛЕН!" -ForegroundColor Green
    Write-Host "🌐 Netlify автоматически задеплоит изменения через 1-2 минуты" -ForegroundColor Cyan
    Write-Host "📍 Проверьте: https://murod77.netlify.app" -ForegroundColor Cyan
} else {
    Write-Host "ℹ️ Нет изменений для загрузки" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Нажмите Enter для выхода..."
Read-Host
