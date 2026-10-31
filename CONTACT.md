# Contact delivery

The form submits to Formspree with `fetch` and handles the result inside the Contact drawer. It does not navigate, open a mail app or open another tab.

## Connect it

Create a Formspree form with notifications addressed to **jacob@impressionking.com**. Finish the recipient verification/configuration in Formspree. Copy the public form ID from its endpoint, for example the `abcdefgh` in `https://formspree.io/f/abcdefgh`.

Set that value in `contact-config.js`:

```js
window.ImpressionKingContact=Object.freeze({formId:'abcdefgh'});
```

Deploy the changed configuration. This ID is public. Do not put an account API key or secret in the website. Make sure the form's spam/captcha settings support AJAX and allow the site's domain. The integration includes the `_gotcha` honeypot.

Until the ID is configured, Send shows an honest “Not connected yet” result and makes no provider request. Visitors can return to the form and copy their draft.

## Behavior

- Topics cover hiring, voice work, beats, trailers, creator collaboration and saying hi. A chosen sample accompanies the message.
- A request sends the name, reply email (`email`), topic (`service`), message, sample and subject. Formspree controls the actual recipient.
- Sending disables repeat submissions. A successful provider acknowledgment shows “Message sent.” It does not prove inbox delivery or that Jacob read it.
- Validation, rate limits, offline/network failures and a 20-second timeout show local feedback. Drafts remain in memory. There are no automatic retries.
- Returning from a successful result leaves the text available; an unchanged already-accepted message is not submitted a second time. Refresh clears this in-memory guard and draft.
- Form, keyboard and feedback layouts keep the site's drawer, typography, purple/Saiyan accents and reduced-motion behavior.

## Verification

Run `node tests/contact-submit.browser.cjs` with the local static preview running. `SITE_URL` can select another preview or the public site. The test intercepts Formspree requests and supplies a test-only configuration: it sends no real messages. It covers missing configuration, success, field rejection, rate limits, network failure, duplicate clicks and no navigation/popups. The active configured endpoint still needs one supervised end-to-end delivery check after setup.

References: [Formspree AJAX submission](https://formspree.io/blog/formspree-ajax/), [Reply-To field](https://help.formspree.io/articles/building-your-form/email-reply-to-address), [Honeypot](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering).
