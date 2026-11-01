# Services and ordering implementation plan

Goal: make commissioning easier through a three-step guide and a stable, prefilled order panel.
Architecture: retain the buildless gallery and validated service/cart model. Services owns guide state and order drafts; showcase owns navigation/header; crown owns identity activation and scoped power colors.
Spec: Joe’s approved Services/cart/hover/identity summary and Order Now/TikTok summary in this chat, followed by his instruction to complete them now.
Constraints: preserve Studio/Ash callout cards, purple page accents, service-specific artwork, keyboard/touch/reduced motion, literal user text, existing drafts and preview-only provider boundary. No new prices, promises, payment or delivery integration.

- [x] Add browser regressions for the guide, stable cart, prefilled selections, header actions, hover and identity-only triggers. Observe failure before implementation.
- [x] Replace Services layout with Service, Direction and Project steps, each with avatar and descriptions/examples. Preserve per-service selections and explicit cart snapshots.
- [x] Keep cart frame and selected-service region stable; distinguish remove from close; retain drafts and safe preview.
- [x] Move Order Now beside the TikTok CTA in the banner; add order/TikTok icons and retain direct contact links as compatibility aliases.
- [x] Scope power colors to logo, wordmark, avatars and the two banner CTAs; identity activation only. Apply consistent purple hover highlights to other buttons.
- [x] Run model, guide, cart, navigation, crown and media regressions across desktop/phone/short viewports. Inspect desktop and mobile together, fix in one batch, confirm.
- [x] Review final diff, install verified source into the usual Mac preview, verify served behavior and update project records.
- [ ] Publish and verify public HTTPS after Joe explicitly authorizes the GitHub destination and this release.

Review focus: empty/populated/cleared frame stability; switching services retains each configuration; changing selections does not silently mutate saved cart; modal draft/focus/keyboard safety; ordinary navigation never increases power.

Execution: inline, authorized by Joe’s request to get the listed work done now. Use a feature branch in the existing separate deployable checkout; preserve the private prototype and all unrelated work.

Progress: initial three guide/cart/banner regressions failed against E1, then passed after implementation. Six model checks passed. Phone inspection reproduced inherited hidden TikTok icon; fix and confirmation pending. The old internal Contact ID remains for compatibility, while visible UI and new URLs use Order Now/order.

Final review: two important findings reproduced: sticky Next overlaid short-phone choices; red-tier CTA hover contrast 3.44:1. Fix: dedicated action row outside independently scrolling guide content, avatar anchored within mobile heading, and light text/icons on red hover. No other important reviewer finding.

Verified: 14 focused tests and all six responsive workflows passed locally; 8 UI regressions and all six responsive workflows passed through the Mac/VPN address. Controlled media and desktop/touch/keyboard identity cap/reset tests passed. Both final review findings are fixed. Private preview installed and running at http://10.200.0.60:8846. Public release verification pending.

Close: private preview installed and verified, project README and Site deployment updated, daily progress saved. Automatic approval review rejected the GitHub create_tree upload, so no remote tree/commit/ref changed. Publication remains held for Joe’s explicit authorization; public site stays on df33d36. Local factual-draft helper initially omitted evidence, then passed with a two-fact batch; all prose was checked against primary evidence.

Publication authorization — November 1: Joe explicitly instructed “update now and get it pushed deployed.” Upload to the existing garbledhamster/impressionking.com repository and deploy impressionking.com are authorized. Public verification is the next step.
