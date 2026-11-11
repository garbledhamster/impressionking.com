const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('/Users/jrice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.SITE_URL||'http://127.0.0.1:8851';let browser;
before(async()=>browser=await chromium.launch());after(async()=>browser.close());
async function page(viewport={width:1440,height:950}){const p=await browser.newPage({viewport,reducedMotion:'reduce'});await p.goto(base+'/?section=services');await p.locator('.sc-panel').waitFor();return p;}
test('guide advances service, direction, project and preserves choices in order preview',async()=>{const p=await page();try{
assert.equal(await p.locator('.sc-step-title').innerText(),'Pick your service.');
assert.equal(await p.locator('[data-select] .sc-emblem img').count(),3);
await p.locator('[data-select=voices]').click();await p.getByRole('button',{name:'Next',exact:true}).click();
assert.equal(await p.locator('.sc-step-title').innerText(),'Pick your direction.');
await p.locator('[data-direction=Cinematic]').click();assert.match(await p.locator('.sc-explanation').innerText(),/Cinematic|cinematic/);
await p.getByRole('button',{name:'Next',exact:true}).click();assert.equal(await p.locator('.sc-step-title').innerText(),'Pick your project.');
await p.locator('[data-project="Narration"]').click();await p.locator('[data-add]').click();
await p.locator('#g-tab-contact').click();assert.match(await p.locator('#sc-cart-items').innerText(),/Voice work[\s\S]*Cinematic[\s\S]*Narration/);
await p.locator('#sc-name').fill('Visitor');await p.locator('#sc-email').fill('visitor@example.com');await p.locator('#sc-brief').fill('A <script>literal</script> project.');
await p.locator('#sc-cart-form button[type=submit]').click();assert.match(await p.locator('.sc-request-preview pre').innerText(),/Voice work · Cinematic · Narration/);assert.equal(await p.locator('.sc-request-preview script').count(),0);
}finally{await p.close();}});
test('cart frame stays fixed through empty, populated and cleared states',async()=>{for(const viewport of[{width:1440,height:950},{width:390,height:844},{width:320,height:568}]){const p=await page(viewport);try{
await p.locator('#g-tab-contact').click();const empty=await p.locator('.sc-cart').boundingBox();
await p.locator('[data-cart-add=trailers]').click();const full=await p.locator('.sc-cart').boundingBox();
for(const k of['x','y','width','height'])assert(Math.abs(empty[k]-full[k])<2,k+' should remain stable');
const remove=await p.locator('[data-remove]').evaluate(e=>({border:getComputedStyle(e).borderTopWidth,label:e.getAttribute('aria-label')}));assert.equal(remove.border,'0px');assert.match(remove.label,/Remove/);
await p.locator('[data-clear]').click();const clear=await p.locator('.sc-cart').boundingBox();assert(Math.abs(clear.height-empty.height)<2);assert(Math.abs(clear.y-empty.y)<2);
}finally{await p.close();}}});
test('site accents and CTA energy follow identity power; ordinary buttons never advance it',async()=>{const p=await page();try{
assert.equal(await p.locator('.g-header #g-tab-contact').innerText(),'Request a quote');assert.equal(await p.locator('.g-picker #g-tab-contact').count(),0);
assert.equal(await p.locator('.g-header-actions .g-primary').count(),2);assert.equal(await p.locator('.g-header-actions [style*=tiktok]').count(),1);
await p.locator('.crown-svg').waitFor();const accent=await p.evaluate(()=>getComputedStyle(document.body).getPropertyValue('--g-accent'));
await p.locator('.brand').click();const clicks=await p.locator('.crown-svg').getAttribute('data-clicks');const poweredAccent=await p.evaluate(()=>getComputedStyle(document.body).getPropertyValue('--g-accent'));assert.notEqual(poweredAccent,accent);assert.equal(await p.locator('.sc-guide-actions .g-primary .g-action-energy').count(),1);await p.getByRole('button',{name:'Next',exact:true}).click();await p.locator('[data-direction=Playful]').click();
assert.equal(await p.locator('.crown-svg').getAttribute('data-clicks'),clicks);assert.equal(await p.evaluate(()=>getComputedStyle(document.body).getPropertyValue('--g-accent')),poweredAccent);
assert.equal(await p.locator('.g-brand-copy').evaluate(e=>getComputedStyle(e).color),await p.locator('.g-picker button').first().evaluate(e=>getComputedStyle(e).color));
const nav=p.locator('.g-picker button').first(),before=await nav.evaluate(e=>getComputedStyle(e).backgroundColor);await nav.hover();assert.notEqual(await nav.evaluate(e=>getComputedStyle(e).backgroundColor),before);
}finally{await p.close();}});

test('phone banner icon and guide action remain visible',async()=>{const p=await page({width:320,height:568});try{assert(await p.locator('.g-header-actions .g-social .g-icon').isVisible());const action=await p.getByRole('button',{name:'Next',exact:true}).boundingBox(),guide=await p.locator('.sc-guide').boundingBox();assert(action.y+action.height<=guide.y+guide.height+1,'Next stays within the visible callout');await p.locator('[data-select=trailers]').click({timeout:1500});}finally{await p.close();}});

test('red-tier banner hover keeps readable text contrast',async()=>{const p=await page();try{await p.locator('.crown-svg').waitFor();await p.evaluate(()=>{for(let i=0;i<30;i++)document.querySelector('.brand').click()});await p.locator('#g-tab-contact').hover();const ratio=await p.locator('#g-tab-contact').evaluate(e=>{const ctx=document.createElement('canvas').getContext('2d');function lum(color){ctx.fillStyle=color;ctx.fillRect(0,0,1,1);const a=[...ctx.getImageData(0,0,1,1).data].slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return a[0]*.2126+a[1]*.7152+a[2]*.0722}const s=getComputedStyle(e),a=lum(s.color),b=lum(s.backgroundColor);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)});assert(ratio>=4.5,'red hover contrast '+ratio);}finally{await p.close();}});
