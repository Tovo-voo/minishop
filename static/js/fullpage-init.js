// static/js/fullpage-init.js - 初始化 fullPage.js

document.addEventListener("DOMContentLoaded", function () {
  // ✅ 檢查是否存在 #fullpage 元素
  const fullpageContainer = document.getElementById('fullpage');
  
  if (!fullpageContainer) {
    console.log('⚠️ 沒有 #fullpage 容器，跳過 fullPage.js 初始化');
    return;  // ✅ 如果沒有，直接結束，不執行後面的程式碼
  }

  // ✅ 有 #fullpage 才初始化
  console.log('✅ 初始化 fullPage.js');
  new fullpage('#fullpage', {
    autoScrolling: true,
    scrollHorizontally: false,
    navigation: true,
    navigationPosition: 'right',
    showActiveTooltip: true,
    scrollingSpeed: 700,
    responsiveWidth: 900,
    licenseKey: 'gplv3-license'
  });
});


// ✅ 自動偵測背景亮度（也要加檢查）
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll('.section');
  
  // ✅ 如果沒有 .section 元素，就跳過
  if (sections.length === 0) {
    console.log('⚠️ 沒有 .section 元素，跳過背景亮度偵測');
    return;
  }

  console.log('✅ 偵測背景亮度');
  sections.forEach(section => {
    const theme = section.dataset.theme;
    
    if (theme === 'dark') {
      section.style.color = '#fff';
    } else if (theme === 'light') {
      section.style.color = '#000';
    } else {
      // 預設偵測背景色
      let bgColor = window.getComputedStyle(section).backgroundColor;
      
      if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
        section.style.color = 'white';
        return;
      }
      
      const rgb = bgColor.match(/\d+/g);
      if (rgb) {
        const [r, g, b] = rgb.map(Number);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        section.style.color = brightness > 150 ? '#000' : '#fff';
      }
    }
  });
});