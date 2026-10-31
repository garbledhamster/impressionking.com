const { chromium } = require('/Users/jrice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const mobile of [false, true]) {
      const page = await browser.newPage({viewport: mobile ? {width:390,height:844} : {width:1440,height:950}, hasTouch:mobile, isMobile:mobile});
      const url = process.env.SITE_URL || 'http://127.0.0.1:8847';
      const count = () => page.locator('.crown-svg').getAttribute('data-clicks');
      const activate = locator => mobile ? locator.tap() : locator.click();
      for (const selector of ['.g-brand-copy strong', '.g-brand-copy>span', '.g-welcome .g-character']) {
        await page.goto(url); await page.waitForSelector('.crown-svg');
        assert.equal(await count(),'0');
        await activate(page.locator(selector));
        assert.equal(await count(),'1',`${selector} starts power exactly once`);
        await activate(page.locator(selector));
        assert.equal(await count(),'2',`${selector} levels up exactly once`);
      }
      for (const section of ['voices','beats','trailers','about','services']) {
        await page.goto(`${url.replace(/\/$/,'/').split('?')[0]}?section=${section}`); await page.waitForSelector('.crown-svg');
        const avatars=page.locator('[data-active] .g-character');
        for (let i=0;i<await avatars.count();i++) {
          const before=Number(await count());
          await activate(avatars.nth(i));
          assert.equal(Number(await count()),before+1,`${section} avatar activates once`);
        }
        const avatar=avatars.first(); await avatar.focus();
        const before=Number(await count());
        await page.keyboard.press('Enter'); assert.equal(Number(await count()),before+1,`${section} Enter`);
        await page.keyboard.press('Space'); assert.equal(Number(await count()),before+2,`${section} Space`);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      }
      await page.goto(url); await page.waitForSelector('.crown-svg');
      await page.locator('.brand').focus(); await page.keyboard.press('Enter'); assert.equal(await count(),'1');
      await page.keyboard.press('Space'); assert.equal(await count(),'2');
      await page.evaluate(()=>{for(let i=0;i<105;i++)document.querySelector('[data-active] .g-character').click()});
      assert.equal(await count(),'100'); assert.equal(await page.locator('.crown-svg').getAttribute('data-stage'),'silver3');
      await page.reload();await page.waitForSelector('.crown-svg');assert.equal(await count(),'0');
      results.push({mobile,names:true,allAvatarPoses:true,keyboard:true,oneIncrementPerActivation:true,capAndReset:true});
      await page.close();
    }
    console.log(JSON.stringify(results));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
