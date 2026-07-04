ASTRO — Visual Style Guide v2
Cinematic CG Realism  ·  Higgsfield production system  ·  the established look of the brand
This guide replaces v1 (the comic / anime version). After testing, the brand's leading visual style is cinematic CG realism — the look of a high-end game cutscene (Unreal Engine quality): real, tactile materials and lighting, but not a photograph of a real person and not a flat 2D painting. It matches the premium positioning and the tone of the Codex. The comic style is retired as the lead; this realistic CG look is now the face of ASTRO.

# 1 · The Style Anchor (use in every image prompt)

This formula goes into every image generation. It was dialed in through testing: it lands between photoreal (too much like a real photographed person) and 2D illustration (too flat/cartoonish). The keywords below hold that middle — a rendered 3D CG character.
High-end 3D CG cinematic render, Unreal Engine 5 cinematic, AAA game cutscene quality. [SUBJECT + SCENE]. Realistic 3D-rendered materials and fabric, volumetric lighting, ray-traced reflections, rich physical detail and texture, cinematic depth of field, moody [HOUSE-COLOR] palette. Rendered CG character (not a photograph, not a 2D painting) — dimensional, cinematic, tactile.
Why each part matters:
Unreal Engine 5 / AAA game cutscene / ray-traced → forces a dimensional 3D render, not a flat drawing.
NOT a photograph → stops it becoming a real photographed human (which broke the stylized feel).
NOT a 2D painting → stops it sliding into flat concept-art / cartoon.
Do NOT use: photorealistic, photographic, hyperrealistic (→ real-person photo); painterly, illustrated, animated film still, anime (→ flat cartoon).

## The face trick (important)

AI's weakest point is realistic human faces. Across every successful frame, the face was hidden by a hood and replaced with a golden glow. Keep this habit: hide or obscure faces wherever possible — hood-shadow, golden glow, profile, back view, helmet, mask. It dodges the main failure point and fits the lore (especially Ophus). When a face must show, keep it small/distant, never a sharp close-up.

# 2 · Per-House Image Prompts

Each house uses the Style Anchor above + its own colors, emblem and aesthetic from the Codex. Below are the house-specific subject blocks to drop into the anchor. Generate on Nano Banana Pro, 9:16, 4 variants, pick the best.
Example — full assembled Ophus prompt (the proven one):
High-end 3D CG cinematic render, Unreal Engine 5 cinematic, AAA game cutscene quality. A mysterious hooded mystic in dark robes with glowing molten-gold filigree, kneeling in meditation in an ancient mossy rune-carved temple, golden light glowing from within the hood, embers and dust drifting through a soft shaft of light. Realistic 3D-rendered materials and fabric, volumetric lighting, ray-traced reflections, rich physical detail and texture, cinematic depth of field, moody amethyst-and-gold palette. Rendered CG character (not a photograph, not a 2D painting) — dimensional, cinematic, tactile.

# 3 · Animation — Which Engine for Which Shot

Tested directly on the same frame. The rule below is proven, not theoretical:

## Kling 3.0 — calm / atmospheric shots

Use for: meditation, drifting particles, light shimmer, gentle fabric movement, slow camera push-in. Anything with little body movement.
Cheaper. Plenty good for atmosphere and static-feeling shots. Set 9:16, sound off, std mode.
Motion prompt (Kling, calm):
Slow, steady cinematic push-in. Fine golden embers and dust drift gently. The glow softly pulses and breathes. Subtle fabric movement. Slow, majestic, serene pacing. No fast movement, no zooms.

## Seedance 2.0 — dynamic / hero shots

Use for: body movement, martial arts, action, walking/rising, combat, key event shots. Holds anatomy in motion noticeably better than Kling.
Supports up to 4K, genre='action' hint, and up to 15 seconds. Costs more credits — worth it where real movement happens.
Proven: the same frame that Kling kept static, Seedance moved through a full martial-arts motion cleanly.
Motion prompt (Seedance, dynamic):
[describe the motion: rises, moves, strikes, turns]. Smooth, powerful, deliberate motion. Cinematic camera tracks the movement. Embers and glow react to the motion. Set genre=action, resolution 1080p or 4k, 9:16.
Rule of thumb: body movement / action → Seedance. Atmosphere / stillness → Kling.

# 4 · Production Workflow

Generate the still on Nano Banana Pro (9:16, 4 variants) using the Style Anchor + house subject block. Pick the best.
Animate it: Kling for calm shots, Seedance (genre=action) for movement. 9:16, sound off.
For action sequences, generate MANY short clips (2–4 sec each, several takes each), keep the best take, and cut them together in CapCut. Polished AI action is edited from short clips, not one long generation.
Assemble in CapCut: clips in order, voiceover, music, captions. Export 1080p, 9:16, 30fps.

# 5 · Consistency Rules

Keep the same Style Anchor in every prompt so all houses read as one universe.
Each house = its own palette (above), but same render style, lighting logic, and detail level.
Hide faces (hood/glow/profile/mask) by default — it protects quality and fits the lore.
Recurring motifs that tie the world together: molten-gold filigree, drifting embers, volumetric shafts of light, mossy ancient stone, glowing runes, the Astro glow.
All existing comic-style artworks (the 20 frames) should be regenerated in this realistic CG style before use — they were placeholders that proved the compositions and shot list.

[TABLE]
House | Palette (say in words) | Subject block (drop into the anchor)
Federation
Federatio Solaris | sky-azure blue + silver, deep navy for shadow | A noble Federation officer or white warship with crystalline solar sails, orbital parade fleet, seven-pointed silver-gold star emblem, clean ordered architecture, distant blue homeworld. Mood: noble, optimistic, NASA-meets-Star-Trek.
Vorkhan
Domus Vorkhan | crimson + obsidian black, copper-gold accents, fiery glow | A warlord in heavy crimson-and-obsidian armor or a warrior army in a volcanic crater, crimson banners on pikes, cracked-obsidian-fist-and-lightning emblem, rising embers and flames, sharp angular forms. Mood: brutal honor, merciless might.
Mercanti
Mercanti Veris | gold + warm bronze, amber glow | A guild trade-master in opulent gold-and-bronze robes, or golden orbital trading stations around a gas giant, eight-pointed compass emblem, luminous trade-routes between stars, ornate astrolabe filigree. Mood: wealth, elegance, pragmatic cunning.
Vergent
Ordo Vergens | verdant emerald green, golden bio-glow, forest-moss shadow | A biomancer in living symbiotic robes or a bioluminescent cosmic garden, colossal living tree with planet-leaves, glowing fruit and spores, spiral-and-eye emblem, organic forms. Mood: living beauty, strange wonder.
Ophus
Synodus Ophus | amethyst purple + silver-gold, deep violet shadow | A hooded augur in dark robes with glowing molten-gold filigree, kneeling in meditation in an ancient mossy rune-carved temple, golden glow from within the hood, embers and shafts of light, inverted-triangle-and-eye emblem. Mood: mysticism, hidden knowledge, foreboding. (This is the reference frame the whole style was dialed in on.)