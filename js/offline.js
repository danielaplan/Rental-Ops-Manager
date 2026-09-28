(() => {
  if(!('serviceWorker' in navigator))return;
  const worker=new URL('../sw.js',document.currentScript.src);
  navigator.serviceWorker.register(worker,{scope:new URL('./',worker).pathname}).then(()=>navigator.serviceWorker.ready).then(()=>{
    window.akadOfflineReady=true;window.dispatchEvent(new CustomEvent('offline-ready'));
  }).catch(error=>{
    console.warn('Offline setup failed:',error);
    const label=document.querySelector('#offlineSetup');if(label)label.textContent='Offline setup failed. Keep the app online and reload to retry.';
  });
})();
