# Contact and service requests

Services leads with Jacob Williams’s voiceovers and narration, alongside the existing character and music choices. The three-step guide collects service, direction, project type and optional sample reference. The request panel retains those choices with a name, email and project brief.

Visitors review the full request before choosing **Send request**. The site sends JSON to Formspree only after that explicit action. This is an inquiry, not a booking or payment. Quote, acceptance and delivery remain a conversation with Jacob.

## Configuration

The public `formId` in `contact-config.js` is `mqpqzqry`, for the Formspree Contact and service inquiries form with verified **admin@impressionking.com** selected as recipient. This file is public: never put account credentials, API keys or passwords in it. The recipient is managed in Formspree, not in the browser payload.

An empty or invalid ID keeps the site in preview-only mode, with no Send button or provider request. A syntactically valid ID does not prove the provider or mailbox is configured. Verify the recipient and an authorized end-to-end test before claiming email delivery works.

The sending state blocks repeat clicks. A confirmed submission cannot be sent again unchanged during the page session. Network failures, timeouts, server errors and malformed success responses are marked unconfirmed, with a warning that a manual retry could duplicate the message. Rejected requests keep the draft too. Success confirms provider acceptance, not inbox delivery. Nothing retries automatically.

Cart, draft and sent-request history stay in memory only and clear on reload. Closing the panel preserves them. No payment details or file uploads are collected.

`services-model.js` owns choices and cart snapshots. `services.js` owns the visible builder, review and delivery. `contact-submit.js` remains the older hidden-form fallback; the current gallery routes contact entry points through `CreatorServices`.

## Local checks

Start `python3 -m http.server 8851 --bind 127.0.0.1`, then run:

- `SITE_URL=http://127.0.0.1:8851 node --test tests/*.test.cjs`
- `SITE_URL=http://127.0.0.1:8851 node tests/services.browser.cjs`
- `python3 -m unittest discover -s tests -p '*_test.py'`

Delivery tests intercept all Formspree requests and use synthetic responses. They never submit real inquiries. Real mailbox delivery needs a separately authorized test.
