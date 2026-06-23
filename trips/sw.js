const CACHE='trips-v1';
const ASSETS=['./','index.html','icon-512.png','manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;if(new URL(r.url).origin!==self.location.origin)return;
  e.respondWith(fetch(r).then(x=>{if(x.ok){const cp=x.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return x;}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));});
