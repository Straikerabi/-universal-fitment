const tenant=document.querySelector('#tenant'),mode=document.querySelector('#mode'),frame=document.querySelector('#embed');
function update(){const path=`embed.html?tenant=${encodeURIComponent(tenant.value)}`;frame.src=path;frame.classList.toggle('compact',mode.value==='compact');document.querySelector('#embedCode').textContent=`<iframe src="${new URL(path,location.href).href}"\n title="Demo-Teilefinder"\n sandbox="allow-scripts allow-same-origin"\n referrerpolicy="no-referrer"></iframe>`;}
tenant.addEventListener('change',update);mode.addEventListener('change',update);update();
