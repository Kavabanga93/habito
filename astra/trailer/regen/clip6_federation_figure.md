# REGEN — Clip #6 · Federation Figure

**Проблема оригинала:** командир стоит спиной + плоский наезд, **без действия**. На фоне фигур с действием (#9 меч, #15 энергия, #18 руки) выглядит мёртво.

**Фикс:** жест-команда → флот отвечает → motivated-концовка вспышкой с перетёком в красный (бросок в House Vorkhan).

---

## Seedance 2.0 — параметры
- Режим: **image-to-video** (start_image = присланный референс офицера Федерации)
- `model: seedance_2_0` · `genre: action` · `aspect: 9:16` · `resolution: 1080p` · `duration: 6s` · `generate_audio: off`
- Лицо НЕ показывать — герой спиной к камере (так и оставить).

---

## MOTION PROMPT (вставить в Seedance / Seedance Director)

> A noble Federation supreme commander stands on a crystalline command platform, his back to us, overlooking a vast armada of white-and-gold warships with glowing blue crystalline solar sails above a bright homeworld, a spiral galaxy turning overhead, golden god-rays pouring from the distant star. Slow, majestic crane-up from behind his shoulder with subtle parallax depth between the foreground console rails, the figure, and the distant fleet. His long blue-and-gold cape billows in a solar wind. He raises his right arm in a commanding gesture — and the fleet answers: every ship's engines flare brighter in unison and surge forward, a ripple of blue-white light sweeping across the armada. Holographic command consoles glow and update beside him. The distant star then erupts in a brilliant volumetric solar flare, god-rays intensifying and blooming the frame toward radiant white-gold, warm light bleeding to faint ember-red at the very end. Smooth, powerful, deliberate motion; regal cinematic pacing; camera cranes up and slightly in, never a flat zoom. High-end 3D CG cinematic render, Unreal Engine 5, AAA game cutscene quality, ray-traced reflections, volumetric lighting, cinematic depth of field — rendered CG, not a photograph, not a 2D painting.

## AVOID
> face reveal / turning to show face, fast whip zoom, flat dolly push-in, cape warping into artifacts, extra arms or fingers, text, watermark, cartoon / flat 2D look, photorealistic real-person face.

---

## Зачем именно так
- **Жест руки + ответ флота** = эмоциональный «герой-момент», которого не хватало. Это уравнивает #6 с #9/#15/#18.
- **Crane-up + параллакс вместо наезда** = ломает «push-in» монотонность.
- **Концовка: солнечная вспышка → перетёк в красный** = готовый motivated-переход в Vorkhan (#7), без работы в монтаже.
- Спина к камере сохранена — обходим слабое место AI (лица) и держим бренд-правило.

---

## Альтернативы движения (если первый дубль не зайдёт)
1. **Плащ + разворот вполоборота** (без показа лица): ветер раздувает плащ, он чуть поворачивает голову в профиль (силуэт), флот за спиной даёт залп света.
2. **Указующий жест двумя руками**: разводит руки — голограммы вокруг разворачиваются веером, корабли строятся в клин.
3. **Шаг вперёд к краю платформы**: делает шаг, камера чуть проседает снизу-вверх (low-angle), делает его монументальным.

Генерить 3-4 дубля, брать лучший (как в гайде).
