# ✦ ASTRO — HANDOFF (статус на 2026-07-04)

> **Для новой сессии Claude:** прочитай этот файл + `astra/README.md` + `astra/trailer/v2_wow/TREATMENT.md` — это весь контекст. Работа ведётся в ветке `claude/check-highsfield-mcp-8DlsI` репозитория `Kavabanga93/habito`.

## Что за задача сейчас
Делаем **трейлер вселенной ASTRO v2** в стиле синематиков World of Warcraft:
- ≤ **1:55**, вертикаль **9:16**, генерация **Seedance 2.0, 4K** через Higgsfield (MCP подключён).
- Cold open с закадром (история Astro) → представление **5 Домов через героев карт** (БЕЗ сигилов, БЕЗ сплошного нарратива) → Архитекторы → лого.
- Бесшовные motivated-переходы (действие героя гонит склейку).
- Нужен эпический саундтрек (LOTR/WoW-уровень пафоса) + озвучка только в начале.

## Кастинг (закреплён, арт карт получен от клиента)
| Дом | Герой | Карта |
|---|---|---|
| Federation | Captain Orion Blaze | 001 🔴 |
| Vorkhan | Krall Vexx | 029 🟣 |
| Mercanti | Zara Eclipse | 008 🟣 |
| Vergent | Aurora Titan | 003 🔴 |
| Ophus | Queen Sylphara of the Nebulites | 030 🟣 |

## Готово
- ✅ `trailer/v2_wow/TREATMENT.md` — структура 8 блоков (~1:55), переходы, нарратив cold open.
- ✅ 9 Seedance Director JSON-промптов (EN+ZH) в `trailer/v2_wow/prompts/`:
  - `00a_coldopen_void`, `00b_coldopen_astro_crystal` — открытие (text-to-video, референс не нужен)
  - `01_federation_orion_blaze`, `02_vorkhan_krall_vexx`, `03_mercanti_zara_eclipse`, `04_vergent_aurora_titan`, `05_ophus_queen_sylphara` — герой-шоты (**image-to-video, нужен арт карт в Higgsfield**)
  - `06_architects`, `07_logo_endcard` — финал (text-to-video)
- ✅ Аудит старого трейлера v1 (20 шотов) — `trailer/EDIT_PLAN.md` (v1 отложен, клиент решил делать v2).
- ✅ Белое лого ASTRO (PNG, прозрачный фон) клиент прислал в чат — **нужно переслать в новую сессию или залить в Higgsfield** (в репо только PDF: `brand/ASTRO_logo.pdf`).

## Следующие шаги (по порядку)
1. **Залить арт 5 карт в Higgsfield** (`media_upload_widget` в MCP) — у клиента арт на компьютере (он присылал в чат и полные карты, и чистый арт крупным планом).
2. **Сгенерировать 9 шотов** через Higgsfield MCP `generate_video`: model `seedance_2_0`, 9:16, **4K** (герой-шоты — image-to-video от арта карт; Void/Crystal/Architects/Logo — от текста). Промпты уже готовы в `prompts/` (использовать EN-версию).
3. **Саундтрек**: Higgsfield `generate_audio` — эпический оркестровый трек ~2 мин (низкие хоры, нарастание, кульминация на Архитекторах, торжественный финал на лого).
4. **Озвучка cold open** (EN, текст в TREATMENT.md) — голос клиента или AI (ElevenLabs/`create_voice`).
5. **Монтаж**: склейка с motivated-переходами + speed-ramp + whoosh/boom на стыках (ffmpeg тут или CapCut у клиента), белое лого поверх end-card, тайминг ≤1:55.

## Важные факты окружения
- Higgsfield MCP: инструменты `generate_video`, `generate_image`, `generate_audio`, `media_upload_widget`, `job_display` и т.п. MCP **не видит** картинки из чата — файлы для image-to-video должны быть загружены в Higgsfield.
- Сервер **не имеет доступа** к внешним сайтам/CDN (403 Host not in allowlist) — большие файлы клиент передаёт загрузкой в чат (лимит ~30MB) или через Higgsfield.
- ffmpeg на сервере ставится через `pip install imageio-ffmpeg` + симлинк (системного нет).
- Git-хук требует коммит+пуш после каждого шага. Пушить: `git push -u origin claude/check-highsfield-mcp-8DlsI`.

## Клиентские предпочтения (важно)
- Не «half-assed»: качество уровня WoW-синематика, эмоции, бесшовность.
- Плащ/действие-переходы одобрены; сигилы в v2 НЕ показывать; нарратив только в начале.
- Общение на русском; генерация промптов — EN(+ZH для Seedance).
