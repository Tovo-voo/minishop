$(function () {

    // ============================================================== 
    //Fix header while scroll
    // ==============================================================  
    var wind = $(window);
    wind.on("load", function () {
        if ($('body').hasClass('cart-page')) {
            return;
        }
        var bodyScroll = wind.scrollTop(),
            navbar = $(".topbar");
        if (bodyScroll > 40) {
            navbar.addClass("fixed-header")
        } else {
            navbar.removeClass("fixed-header")
        }
    });
    

    // 這段是「當使用者點擊有data-bs-toggle="dropdown"的項目時，打開對應的dropdown」
    $( 'ul.dropdown-menu [data-bs-toggle="dropdown"]' ).on( 'click', function(event) {
        event.preventDefault();
        event.stopPropagation();

        $( this ).siblings().toggleClass( 'show' );

        if ( !$( this ).next().hasClass( 'show' ) ) {
            $( this ).parents( '.dropdown-menu' ).first().find( '.show' ).removeClass( 'show' );
        }

        $( this ).parents( 'li.nav-item.dropdown.show' ).on( 'hidden.bs.dropdown', function(e) {
            $( '.dropdown-submenu .show' ).removeClass( 'show' );
        });
    });
    
    $(window).scroll(function () {
        // 如果是 cart-page，直接 return，不處理
        if ($('body').hasClass('cart-page')) {
            return;
        }

        if ($(window).scrollTop() >= 200) {
            $('.topbar').addClass('fixed-header');
        } else {
            $('.topbar').removeClass('fixed-header');
        }
    });

    $('.product-item').isotope({
        itemSelector: '.product-desc',
        layoutMode: 'fitRows'
    });

    $('.product-tab ul li a').click(function(){
        $('.product-tab ul li a').removeClass("active");
        $(this).addClass("active");

        var selector = $(this).attr("data-filter");
        $('.product-item').isotope({
            filter: selector
        });

        return false
    });


    // ============================================================== 
    //Featured Property Carousel
    //

    
    $('.featured-property-carousel').owlCarousel({
        loop: true,
        margin: 30,
        nav: false,
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        dots: true,
        autoplay: true,
        center: true,
        responsiveClass: true,
        responsive:{
            0:{
                items:1
            },
            600:{
                items:2
            },
            1000:{
                items:3
            }
        }
    });

    $('.testimonial-carousal').owlCarousel({
        loop: true,
        margin: 30,
        nav: false,
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        dots: true,
        autoplay: false,
        center: true,
        responsiveClass: true,
        autoHeight: false,
        responsive: {
            0: {
                items: 1,
            },
            768: {
                items: 1,
                center: false
            },
            1024: {
                items: 1,
            }
        }
    });

    $('.testimonial-carousal-st2').owlCarousel({
        loop: true,
        margin: 30,
        nav: false,
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        dots: false,
        autoplay: true,
        // center: true,
        responsiveClass: true,
        responsive: {
            0: {
                items: 1,
            },
            768: {
                items: 2,
                center: false
            },
            1024: {
                items: 3,
            }
        }
    });

    $('.v1-banner-carousel').owlCarousel({
        animateOut: 'fadeOut',
        loop: true,
        margin: 30,
        nav: false,
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        dots: false,
        autoplay: true,
        center: true,
        smartSpeed:450,
        responsiveClass: true,
        responsive: {
            0: {
                items: 1,
            },
            768: {
                items: 1,
                center: false
            },
            1024: {
                items: 1,
            }
        }

    });

    $('.v2-banner-carousel').owlCarousel({
        animateOut: 'fadeOut',
        loop: true,
        margin: 30,
        nav: false,
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        dots: false,
        autoplay: true,
        center: true,
        smartSpeed:450,
        responsiveClass: true,
        responsive: {
            0: {
                items: 1,
            },
            768: {
                items: 1,
                center: false
            },
            1024: {
                items: 1,
            }
        }

    });

    $('.property-img-carousal').owlCarousel({
        loop:true,
        margin:3,
        dots: false,
        nav: true,
        navText: [$(".property-prev"), $(".property-next")],
        responsive:{
            0:{
                items:1
            },
            600:{
                items:1
            },
            1000:{
                items:3
            }
        }
    });

});




// 這是控制下拉式選單
// hover程式:「滑鼠移進這個類別 -> 就會展開下拉式選單」 反之移走就會關閉
// 如果點擊類別也會展開，但是只要滑到別的類，就會關閉，它只保留顯示一類的下拉式選單
const dropdowns = document.querySelectorAll('.nav-item.dropdown');

dropdowns.forEach(dropdown => {
  dropdown.addEventListener('mouseenter', function() {
    // 關閉其他 dropdown
    dropdowns.forEach(d => d.classList.remove('show'));
    document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));

    // 打開目前 hover 的 dropdown
    this.classList.add('show');
    const menu = this.querySelector('.dropdown-menu');
    if (menu) menu.classList.add('show');
  });

  dropdown.addEventListener('mouseleave', function() {
    this.classList.remove('show');
    const menu = this.querySelector('.dropdown-menu');
    if (menu) menu.classList.remove('show');
  });
});






//這是add_address.html控制 "新增地址小頁面彈出閉合"
function openAddAddress() {
  document.getElementById('addAddressModal').style.display = 'block';
}
function closeAddAddress() {
  document.getElementById('addAddressModal').style.display = 'none';
}




const form = document.getElementById('addAddressForm');

form.addEventListener('submit', function (e) {
  e.preventDefault(); // ⭐ 關鍵：阻止 form 刷新頁面

  const formData = new FormData(form);

  fetch("{% url 'add_address' %}", {
    method: 'POST',
    headers: {
      'X-CSRFToken': form.querySelector('[name=csrfmiddlewaretoken]').value,
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // 1️⃣ 關閉 modal
      closeAddAddress();

      // 2️⃣ 更新畫面地址（示範）
      document.querySelector('.cart-address-change-wrap').innerText =
        data.receiver + ' ' + data.phone + ' ' + data.address;

      // 3️⃣ （進階）你也可以動態加 radio button
    }
  });
});





(function () {
  // ✅ 後端新增地址的 URL（請確認 url name）
  const ADD_ADDRESS_URL = "{% url 'add_address' %}";

  const modal = document.getElementById('addAddressModal');
  const form  = document.getElementById('addAddressForm');
  const msgEl = document.getElementById('addAddressMsg');
  const btnEl = document.getElementById('addAddressSubmitBtn');

  // 取得 CSRF token（因為我們用 fetch）
  function getCsrfToken() {
    const el = form.querySelector('input[name="csrfmiddlewaretoken"]');
    return el ? el.value : '';
  }

  function setMsg(text, isError=false) {
    msgEl.textContent = text || '';
    msgEl.style.color = isError ? 'crimson' : 'green';
  }

  function setLoading(isLoading) {
    btnEl.disabled = isLoading;
    btnEl.textContent = isLoading ? '儲存中…' : '儲存收貨地址';
  }

  // ✅ 你 checkout 頁面需要有一個容器放地址列表（稍後我給你 checkout 需要加什麼）
  // 這裡先假設容器 id = "addressList"
  function upsertAddressIntoList(data) {
    const list = document.getElementById('addressList');
    if (!list) return;

    // 建立一筆 address item（radio）
    const id = data.address_id;

    // 若已存在，就更新；不存在就新增
    let item = document.getElementById(`addr-item-${id}`);
    const labelText = `${data.receiver} / ${data.phone} / ${data.address}`;

    if (!item) {
      item = document.createElement('label');
      item.id = `addr-item-${id}`;
      item.style.display = 'block';
      item.style.cursor = 'pointer';
      item.style.margin = '6px 0';
      item.innerHTML = `
        <input type="radio" name="shipping_address_id" value="${id}">
        <span class="addr-text"></span>
      `;
      list.prepend(item); // 新增的放最上面
    }

    item.querySelector('.addr-text').textContent = labelText;

    // ✅ 自動選取新地址
    const radio = item.querySelector(`input[type="radio"][value="${id}"]`);
    if (radio) radio.checked = true;

    // 你原本 checkout 有顯示一段 <p>{{ address }}</p> 的話，也可以同步更新那塊
    const display = document.querySelector('.cart-address-change-wrap p');
    if (display) display.textContent = labelText;
  }

  // ✅ 攔截 submit，改用 AJAX
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    setMsg('');

    // 前端基本檢查（required）
    if (!form.checkValidity()) {
      setMsg('請把必填欄位填完。', true);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(form);

      const res = await fetch(ADD_ADDRESS_URL, {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCsrfToken(),
          // 這個 header 不是必須，但有助於你後端做「混合支援」判斷
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData,
      });

      // 不是 2xx 也嘗試解析錯誤
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        const err = data.error || '儲存失敗，請稍後再試。';
        setMsg(err, true);
        setLoading(false);
        return;
      }

      // ✅ 成功：更新列表 + 關閉 modal + 清空表單
      upsertAddressIntoList(data);
      setMsg('儲存成功！');
      form.reset();

      // 稍微等一下讓使用者看到成功訊息（不想等可刪）
      setTimeout(() => {
        closeAddAddress();
        setMsg('');
      }, 200);

    } catch (err) {
      setMsg('網路或伺服器錯誤，請稍後再試。', true);
    } finally {
      setLoading(false);
    }
  });
})();