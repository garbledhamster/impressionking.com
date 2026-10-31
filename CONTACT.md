# Contact and service requests

The selected E1 Services page collects voiceover, voice and music requests in an in-memory cart. Each item retains its direction, project type and optional sample reference. Visitors can update, remove or clear items, then open Cart or Contact to enter their name, email and project details.

The current action is **Preview request**, which renders a message on the site. It sends nothing, books nothing and takes no payment. Reload clears cart and contact drafts. The content focuses on commissioning Jacob’s creative work.

`services-model.js` owns service options and cart snapshots. `services.js` owns the builder and combined contact panel. The gallery delegates Services rendering and Contact opening through `CreatorServices`.

The older Formspree preparation in `contact-config.js` and `contact-submit.js` remains a guarded fallback in source. The new panel does not call it, even when its public form ID is populated. Supplying an ID does not activate the E1 request preview. An ordering/delivery provider and commercial terms must be selected separately before connecting real messages or payments.

Checks: `node --test tests/services-model.test.cjs` and `SITE_URL=http://127.0.0.1:8847 node tests/services.browser.cjs` after starting the preview server. The browser check includes provider configuration but verifies zero network writes, retained drafts and literal rendering of supplied text.
