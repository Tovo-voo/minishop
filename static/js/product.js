// product.js - 完全模仿 UNIQLO

document.addEventListener('DOMContentLoaded', function() {
  const subNav = document.getElementById('subNav');
  if (!subNav) {
    console.error('❌ 找不到 subNav 元素');
    return;
  }
  
  let lastScroll = 0;
  let isHidden = false;
  let ticking = false;
  
  const updateSubNav = function() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // ✅ 往下滑 + 不在最頂部（避免頁面載入時誤觸發）
    if (currentScroll > lastScroll && currentScroll > 5) {
      if (!isHidden) {
        subNav.classList.add('hidden');
        isHidden = true;
      }
    } 
    // ✅ 往上滑
    else if (currentScroll < lastScroll) {
      if (isHidden) {
        subNav.classList.remove('hidden');
        isHidden = false;
      }
    }
    
    lastScroll = currentScroll <= 0 ? 0 : currentScroll;
    ticking = false;
  };
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(updateSubNav);
      ticking = true;
    }
  }, { passive: true });
});