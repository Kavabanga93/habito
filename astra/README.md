# ✦ ASTRO / ASTRALIS — Project Hub

> Единое место для всей документации, лора и продакшн-материалов вселенной **ASTRO**.
> Любая сессия Claude Code (Cowork или CLI) должна начинать отсюда, чтобы получить контекст проекта.

---

## 1. Что это за проект

**ASTRO** — это cannabis-бренд в США (CA, NY и др.), построенный вокруг оригинальной
sci-fi вселенной **Astralis**. Бренд уже продаётся ~6 месяцев. Каждая покупка даёт
случайную физическую коллекционную карту (всего 100 карт). Сквозное сообщение сезона:

> **«Collect your House. The game is coming.»**

Механика-мотор: **Покупка → Карта → Коллекция Дома → подготовка к ИГРЕ** (карточная игра, дата пока не зафиксирована).

- Сайт: **astrouniverses.com** (официальный, публичный источник; страница About — astrouniverses.com/about)
  - ⚠️ Сайт закрыт от автоматического доступа (403 / bot-protection) — Claude не может прочитать его напрямую. Если нужен текст с сайта, скопируй его в чат вручную.
- Платформы: Instagram (Reels — основной охват) + Telegram (комьюнити/дропы); TikTok как зеркало
  - Instagram: **@enter.astroverse** — instagram.com/enter.astroverse (закрыт от автодоступа, читать вручную)
- Текущий сезон: **Season of the Archive** (relaunch, не launch)

---

## 2. Вселенная в двух абзацах

В далёком космосе существует **Пустота (the Void)**, и только в ней добывают **Astro** —
редчайшую субстанцию галактики. За контроль над ней борются **Пять Домов**, каждый —
не нация и не раса, а *философия отношения к Astro*. У каждого Дома есть **Светлая сторона**
(публичная, благородная) и **Теневая сторона** (скрытая, истинная). Мораль — спектр серого
(в традиции Game of Thrones и Dune).

За их войной надвигается большая угроза — **Архитекторы (The Architects)**, древние создатели
Astro, медленно возвращающиеся. Только Орден Офус (Ophus) что-то подозревает. Это финальный
антагонист всей саги.

### Пять Домов (кратко)

| Дом | Латинское имя | Архетип | Цвета | Отношение к Пустоте | Девиз (Свет) |
|-----|---------------|---------|-------|---------------------|--------------|
| **Federation of Solar Systems** | Federatio Solaris | Stark + Atreides + Star Trek | Sky Azure / Navy | Изучают и регулируют | SCIENTIA · CONCORDIA · PROGRESSIO |
| **House Vorkhan** | Domus Vorkhan | Lannister + Harkonnen + Khorne | Crimson / Blood | Захватывают силой | PUGNA · HONOR · IMPERIUM |
| **Mercanti Veris** | Mercanti Veris | Hanseatic League + Spacing Guild | Gold / Bronze | Контролируют логистику | LUCRO · FIDES · ITINERA |
| **The Vergent** | Ordo Vergens | Bene Gesserit + Avatar + Annihilation | Verdant / Moss | Культивируют Astro | CONIVNCTIO · EVOLVTIO · UNITAS |
| **The Ophus Order** | Synodus Ophus | Bene Gesserit + Lovecraft + Dr. Strange | Amethyst / Violet | Слушают Архитекторов | VERITAS · OCCVLTA · TRANSFORMATIO |

Моральный спектр (от симпатичных к напряжённым): Federation → Mercanti / Vergent → Vorkhan → Ophus.

---

## 3. Карты (100 шт.)

Compendium из 100 карт, 4 типа по 25:
- **25 Humans** (космонавты эпохи Astro)
- **25 Aliens** (нечеловеческие силы)
- **25 Planets**
- **25 Ships**

Редкость: 🔴 Legendary · 🟣 Epic · 🔵 Rare · 🟢 Common.
Канон привязывает большинство карт к пяти Домам (≈20 карт = Дом). Полная роспись — в `docs/03_Unified_Canon.md`.

---

## 4. Визуальный стиль (закреплён)

**Cinematic CG Realism** — вид high-end игровой катсцены (Unreal Engine 5 quality). НЕ фотореализм
и НЕ 2D-иллюстрация. Комикс/аниме-стиль v1 — в архиве.

**Style Anchor (в каждый промпт):**
> High-end 3D CG cinematic render, Unreal Engine 5 cinematic, AAA game cutscene quality. [SUBJECT + SCENE]. Realistic 3D-rendered materials and fabric, volumetric lighting, ray-traced reflections, rich physical detail and texture, cinematic depth of field, moody [HOUSE-COLOR] palette. Rendered CG character (not a photograph, not a 2D painting) — dimensional, cinematic, tactile.

- **Face trick:** прятать лица (капюшон + золотое свечение / профиль / маска) — слабое место AI и совпадает с лором.
- **Движок анимации:** Kling 3.0 для спокойных/атмосферных шотов, Seedance 2.0 (genre=action) для движения/экшена.
- **Генерация:** Nano Banana Pro, 9:16, 4 варианта, выбрать лучший.
- Полный гайд + per-house промпты — в `docs/04_Visual_Style_Guide.md`.

---

## 5. Трейлер вселенной

~2:05, вертикальный 9:16, 19 клипов (каждый Дом = сигил → окружение → фигура).
Нарративный скрипт + storyboard + пошаговая сборка в CapCut — в `docs/05_Trailer_Storyboard_CapCut.md`.

---

## 6. Бренд-ассеты

**Логотип ASTRO** (`brand/ASTRO_logo.pdf`) — векторный, две формы:
- **Mark + wordmark:** стрелка-вершина в виде буквы «A» (острый пик со встроенной «волной»/swoosh) над жирным геометрическим словом **ASTRO**.
- **Wordmark only:** одно слово ASTRO (для компактных мест).
- Начертание: тяжёлый, широкий, slab/geometric sans, скруглённые «O». Цвет в исходнике — тёмно-графитовый (near-black) на белом.
- Использование: для end-card трейлера нужен **PNG с прозрачным фоном** — отрендерить из PDF (на сервере нет растеризатора; сделать в Canva/Illustrator/CapCut или прислать PNG).

---

## 7. Структура папки

```
astra/
├── README.md                         ← этот файл (главный индекс / память проекта)
├── brand/                            ← бренд-ассеты
│   └── ASTRO_logo.pdf                — официальный логотип (вектор)
├── docs/                             ← вся документация в Markdown (читаемо для Claude)
│   ├── 01_CODEX_Five_Houses.md       — Лор-библия пяти Домов (Edition II)
│   ├── 02_Strategy.md                — Маркетинговая стратегия v2 (Season of the Archive)
│   ├── 03_Unified_Canon.md           — Единый канон + компендиум 100 карт
│   ├── 04_Visual_Style_Guide.md      — Визуальный стиль v2 (Higgsfield CG realism)
│   └── 05_Trailer_Storyboard_CapCut.md — Трейлер: скрипт + storyboard + сборка
└── source/                           ← оригиналы (PDF / DOCX) как есть
```

---

## 8. Источники истины (приоритет)

1. **Codex (Edition II)** — лор Домов
2. **Unified Canon** — связки, карты, разрешение коллизий (например, «Ophus»)
3. **Strategy v2** — что и зачем публикуем
4. **Visual Style Guide v2** — как это выглядит
5. **Trailer Storyboard** — эталон тона и порядка подачи

При конфликте между документами — выше в списке = главнее. Канон (`03`) разрешает спорные места лора.
