# commit-eastlane

Закоммить все изменения в коде проекта (app, components, src и другие файлы приложения — без .cursor, .vscode) и выполнить push в origin main, чтобы задеплоить обновления на eastlane.ru (Vercel).

Действия:
1. Проверить `git status`.
2. Добавить в коммит только файлы проекта: `app/`, `components/`, `src/`, конфиги (например `next.config.ts`, `tailwind.config.ts`, `middleware.ts` и т.п.). Не добавлять `.cursor/`, `.vscode/`.
3. Сделать коммит с осмысленным сообщением по изменениям (на русском или английском).
4. Выполнить `git push origin main`.

После пуша напомнить, что Vercel сам задеплоит сайт в течение 1–2 минут.
