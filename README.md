# Impression King

Jacob Williams’s creator gallery: voices, beats, trailers, about and service inquiries.

Buildless HTML/CSS/JavaScript. GitHub Pages serves the repository root at https://impressionking.com. Run `python3 -m http.server 8847` for a local preview.

`showcase.js/css` owns the single-screen gallery and persistent mailto form; `media-player.js` embeds original TikToks; `player-signals.js` validates events and recovers playback from progress; `crown-motion.js/css` owns the hidden logo interaction. The new orange-hoodie character set is under `assets/character`.

The crown does not activate automatically. The first header-logo click unlocks it; 100 logo clicks reaches silver. Refresh resets it. Other site interactions contribute after unlocking.

Inquiries open the visitor’s email app addressed to jacob@impressionking.com. They are not sent by a backend. Catalog data is still fifteen curated samples; full automatic history sync awaits a metadata provider. Theme tuning is available with `?tools=1`; it stores only appearance in that browser.

Brand marks use Framed for interaction, Open for standalone use and Round for favicons/web app icons. Generated character artwork is illustrative, not proof of actual recording gear. Private planning answers and workshop files are excluded.

Verification: `node tests/site.browser.cjs`, `node tests/media.browser.cjs`, `node tests/crown.browser.cjs` (Playwright from Joe’s local runtime). Media transport test uses a controlled iframe fixture; real provider behavior remains subject to TikTok.
