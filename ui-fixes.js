(function(){
 const key="acacia-appearance";
 const root=document.documentElement;
 const saved=localStorage.getItem(key)||localStorage.getItem("saccaia-theme")||"light";
 function apply(mode){root.setAttribute("data-theme",mode);document.querySelectorAll("#theme-toggle,#themeToggle,.theme-toggle").forEach(b=>{b.setAttribute("aria-label",mode==="dark"?"Switch to light mode":"Switch to dark mode");b.setAttribute("title",mode==="dark"?"Switch to light mode":"Switch to dark mode");});}
 apply(saved);
 document.addEventListener("click",e=>{const b=e.target.closest("#theme-toggle,#themeToggle,.theme-toggle");if(!b)return; e.preventDefault();const next=root.getAttribute("data-theme")==="dark"?"light":"dark";localStorage.setItem(key,next);localStorage.setItem("saccaia-theme",next);apply(next);});
})();
