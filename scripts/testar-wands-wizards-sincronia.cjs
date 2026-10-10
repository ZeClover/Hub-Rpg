const {chromium}=require('/opt/codex/runtimes/cua/lib/node_modules/playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const publico=process.env.WW_PUBLIC==='1';
const origin=publico?'https://hub-rpg-eight.vercel.app':'https://ww.local';
const out=path.resolve(__dirname,'../artifacts/wands-wizards/casas');
(async()=>{
  await fs.mkdir(out,{recursive:true});
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  try{
    for(const width of [390,1280]){
      const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce',recordVideo:{dir:out,size:{width:Math.min(width,1280),height:844}}});
      const page=await context.newPage(),errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await context.route(origin+'/**',async route=>{
        if(publico){
          // Use the system's trusted HTTPS transport; no certificate bypass.
          const raw=execFileSync('python',['-c','import urllib.request,sys,json,base64\nr=urllib.request.urlopen(sys.argv[1]);print(json.dumps({"status":r.status,"contentType":r.headers.get("Content-Type","application/octet-stream"),"body":base64.b64encode(r.read()).decode()}))',route.request().url()],{maxBuffer:8*1024*1024});
          const r=JSON.parse(raw);return route.fulfill({status:r.status,contentType:r.contentType,body:Buffer.from(r.body,'base64')});
        }
        const pathname=new URL(route.request().url()).pathname;
        const contentType=({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png'})[path.extname(pathname)]||'application/octet-stream';
        return route.fulfill({body:await fs.readFile(path.join(__dirname,'../public',pathname)),contentType});
      });
      await page.goto(origin+'/wands-wizards.html?v=troca-sincronizada');
      await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Demonstração'));
      await page.waitForLoadState('networkidle');
      await page.locator('#guiado').click();
      for(const casa of ['grifinoria','sonserina','corvinal','lufalufa']){
        await page.locator('#passo .house-choice[data-casa='+casa+']').click();
        const amostras=await page.evaluate(async()=>{
          await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
          const root=document.documentElement,crest=document.querySelector('#guia-brasao .crest-image:not(.crest-outgoing)'),wave=document.querySelector('#guia > .enchantment-wave');
          const color=root.getAnimations().find(a=>a.transitionProperty==='--house-primary');
          const animations=[color,crest.getAnimations()[0],wave.getAnimations()[0],... ['--bg','--surface','--input'].map(k=>root.getAnimations().find(a=>a.transitionProperty===k))];
          if(animations.some(a=>!a))return null;
          const clocks=animations.map(a=>({start:a.startTime,duration:a.effect.getTiming().duration,easing:a.effect.getTiming().easing==='linear'?a.effect.getKeyframes()[0].easing:a.effect.getTiming().easing}));
          const colors=color.effect.getKeyframes().map(k=>k['--house-primary']);
          animations.forEach(a=>a.pause());
          const frames=[225,900,1575].map(time=>{
            animations.forEach(a=>a.currentTime=time);
            return {time,color:getComputedStyle(root).getPropertyValue('--house-primary').trim(),background:getComputedStyle(root).getPropertyValue('--bg').trim(),crest:Number(getComputedStyle(crest).opacity),line:Number(getComputedStyle(wave).opacity),x:new DOMMatrix(getComputedStyle(wave).transform).m41};
          });
          return {clocks,colors,frames};
        });
        assert.ok(amostras,'cores, brasão e linha precisam estar animados juntos');
        assert.ok(Math.max(...amostras.clocks.map(a=>a.start))-Math.min(...amostras.clocks.map(a=>a.start))<1,'todos devem começar no mesmo quadro');
        assert.deepEqual(amostras.clocks.map(a=>a.duration),[1800,1800,1800,1800,1800,1800]);
        assert.equal(new Set(amostras.clocks.map(a=>a.easing)).size,1);
        for(const frame of amostras.frames){
          assert.ok(frame.crest>0&&frame.crest<1,'brasão ainda deve estar mudando durante o percurso');
          assert.ok(frame.line>.3,'linha deve estar visível durante a transformação');
        }
        assert.equal(new Set(amostras.frames.map(f=>f.background)).size,3,'o fundo estrutural precisa interpolar durante todo o percurso');assert.notEqual(amostras.frames[1].color,amostras.colors[0]);
        assert.notEqual(amostras.frames[1].color,amostras.colors.at(-1));
        assert.ok(amostras.frames[0].x<0&&Math.abs(amostras.frames[1].x)<1&&amostras.frames[2].x>0);
        if(casa==='sonserina'){
          await page.evaluate(()=>{for(const a of document.getAnimations())if(a.playState==='paused')a.currentTime=900;});
          await page.locator('#guia').screenshot({path:path.join(out,`sincronia-${publico?'publicada':'local'}-${width}.png`)});
        }
        await page.evaluate(()=>{for(const a of document.getAnimations())if(a.playState==='paused')a.play();});
        await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
      }
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      // A rapid reversal must restart all three effects together without stale crests.
      await page.evaluate(()=>{for(const casa of ['corvinal','sonserina','corvinal']){const s=document.querySelector('#passo [data-campo=casa]');s.value=casa;s.dispatchEvent(new Event('change'));}});
      assert.equal(await page.locator('html').getAttribute('data-casa'),'corvinal');
      assert.equal(await page.locator('#guia-brasao .crest-outgoing').count(),1);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('html').getAttribute('data-casa'),'neutra');
      assert.deepEqual(errors,[]);
      const video=page.video();await page.close();await context.close();
      await video.saveAs(path.join(out,`sincronia-${publico?'publicada':'local'}-${width}.webm`));
    }
    console.log('PASS sincronização: mesma duração, curva e quadro inicial; cores e brasões ainda em transformação durante a linha; quatro Casas, celular/desktop, trocas rápidas, cancelamento e sem overflow.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
