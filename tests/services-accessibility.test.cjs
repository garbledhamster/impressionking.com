const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('/Users/jrice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.SITE_URL||'http://127.0.0.1:8879';let browser;
before(async()=>browser=await chromium.launch());after(async()=>browser.close());
async function open(viewport){const p=await browser.newPage({viewport,reducedMotion:'reduce'});await p.goto(base+'/?section=services');await p.locator('.sc-panel').waitFor();return p;}
async function assertVisibleFocus(locator){assert(await locator.evaluate(e=>e===document.activeElement),'control keeps focus');const r=await locator.evaluate(e=>{const r=e.getBoundingClientRect();if(r.top<0||r.left<0||r.bottom>innerHeight+1||r.right>innerWidth+1)return false;for(let a=e.parentElement;a;a=a.parentElement){const s=getComputedStyle(a),b=a.getBoundingClientRect();if(/auto|scroll|hidden|clip/.test(s.overflowY)&&(r.top<b.top-1||r.bottom>b.bottom+1))return false;}return true;});assert(r,'focused control is fully visible within its scrolling ancestors');}
async function tabTo(p,selector){for(let i=0;i<70;i++){if(await p.locator(selector).first().evaluate(e=>e===document.activeElement))return;await p.keyboard.press('Tab');}throw Error('keyboard cannot reach '+selector);}
test('short and zoom-sized Services keep keyboard choices and step headings visible',async()=>{
for(const viewport of[{width:844,height:390},{width:320,height:237}]){const p=await open(viewport);try{
await p.keyboard.press('Tab');await p.keyboard.press('Enter');await tabTo(p,'[data-select="voices"]');await assertVisibleFocus(p.locator('[data-select="voices"]'));await p.keyboard.press('Enter');await assertVisibleFocus(p.locator('[data-select="voices"]'));
await tabTo(p,'.sc-guide-actions .sc-primary');await assertVisibleFocus(p.locator('.sc-guide-actions .sc-primary'));await p.keyboard.press('Enter');await assertVisibleFocus(p.locator('.sc-step-title'));await tabTo(p,'[data-direction="Cinematic"]');await assertVisibleFocus(p.locator('[data-direction="Cinematic"]'));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
}finally{await p.close();}}});
test('preview and edit return the request heading to view after form scrolling',async()=>{const p=await open({width:320,height:568});try{
await p.locator('#g-tab-contact').click();await p.locator('#sc-name').fill('Visitor');await p.locator('#sc-email').fill('visitor@example.com');await p.locator('#sc-brief').fill('A custom narration.');await p.locator('#sc-cart-form button[type=submit]').click();await assertVisibleFocus(p.locator('#sc-cart-title'));
await p.locator('[data-edit-cart]').click();await assertVisibleFocus(p.locator('#sc-cart-title'));await p.keyboard.press('Escape');assert(await p.locator('#g-tab-contact').evaluate(e=>e===document.activeElement));
}finally{await p.close();}});
test('cart changes expose a persistent status inside the active modal',async()=>{const p=await open({width:390,height:844});try{
await p.locator('#g-tab-contact').click();const status=p.locator('.sc-cart-status[role="status"]');assert.equal(await status.count(),1,'modal owns its status');await status.evaluate(e=>e.dataset.testPersistence='same');await p.locator('[data-cart-add=voices]').click();assert.match(await status.textContent(),/Voice work added/);await p.locator('[aria-label="Remove Voice work"]').click();assert.match(await status.textContent(),/Voice work removed/);assert.equal(await status.getAttribute('data-test-persistence'),'same');
}finally{await p.close();}});
test('200 percent service text wraps without clipping the step navigation',async()=>{const p=await open({width:320,height:568});try{
const css=await p.evaluate(()=>['.sc-steps button','.sc-steps button>span','.sc-cart-button','.sc-count','.sc-step-title','.sc-step-intro','.sc-build-services button','.sc-page-bottom p','.sc-primary'].map(s=>s+'{font-size:'+parseFloat(getComputedStyle(document.querySelector(s)).fontSize)*2+'px!important}').join('\n'));await p.addStyleTag({content:css});assert(await p.locator('.sc-heading').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'enlarged steps and Cart wrap within the header');await p.keyboard.press('Tab');await p.keyboard.press('Enter');await tabTo(p,'[data-select="voices"]');await assertVisibleFocus(p.locator('[data-select="voices"]'));
}finally{await p.close();}});
