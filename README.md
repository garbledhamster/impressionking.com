# Impression King

Jacob Williams’s creator gallery: voices, beats, trailers, about and service inquiries.

Buildless HTML/CSS/JavaScript. GitHub Pages serves the repository root at https://impressionking.com. Run `python3 -m http.server 8847` for a local preview.

`showcase.js/css` owns the single-screen gallery; `services-model.js` owns service selections/cart snapshots, and `services.js/css` owns the selected E1 builder and combined cart/contact preview; `media-player.js` embeds original TikToks; `player-signals.js` validates events and recovers playback from progress; `crown-motion.js/css` owns the hidden logo interaction. The new orange-hoodie character set is under `assets/character`.

The crown does not activate automatically. The first header-logo click unlocks it; 100 logo clicks reaches silver. Refresh resets it. Only the logo/wordmark and Jacob avatars advance the sequence. Interactive accents and CTA energy follow the current level across the site. Red and blue use softer, less saturated colors and reduced glow; neutral text and surfaces stay consistent.

Services is a three-step guide: Service, Direction, Project, with service-specific avatar emblems, descriptions and examples. Choose a service, direction and project, then add or update its cart item. Add to cart stays in the builder. Cart and the banner’s Order Now button open one stable request-preview panel. TikTok sits beside Order Now as a matching CTA; legacy Contact URLs remain compatible. Preview request sends nothing and takes no payment; reload clears drafts. See CONTACT.md for the provider boundary. The catalog has 22 curated/imported public posts; full automatic history still awaits a wider metadata source. Theme tuning is available with `?tools=1`; it stores only appearance in that browser.

Brand marks use Framed for interaction, Open for standalone use and Round for favicons/web app icons. Generated character artwork is illustrative, not proof of actual recording gear. Private planning answers and workshop files are excluded.

Verification: `node tests/site.browser.cjs`, `node tests/media.browser.cjs`, `node tests/crown.browser.cjs` (Playwright from Joe’s local runtime). Media transport test uses a controlled iframe fixture; real provider behavior remains subject to TikTok.

Services verification: `node --test tests/services-model.test.cjs tests/services-guide.test.cjs tests/services-regressions.test.cjs` and `SITE_URL=http://127.0.0.1:8847 node tests/services.browser.cjs`. Prototype comparisons stay in the separate prototype checkout and captured branches.
