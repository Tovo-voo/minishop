// 購物車的 數量增減、單項商品總和、全項商品總和、購物車圖標數量 的ajax(即時更新，不刷新頁面)
document.querySelectorAll('.plus, .minus').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();

        fetch(this.getAttribute('href'))
            .then(res => res.json())
            .then(data => {
                console.log(data); // 🔍 debug 用

                // quantity
                const qtyEl = this.parentElement.querySelector('.quantity');
                if (qtyEl) qtyEl.innerText = data.quantity;

                // cart icon
                const cartCountEl = document.querySelector('#cart-count');
                if (cartCountEl) cartCountEl.innerText = data.cart_count;

                // subtotal
                const subtotalEl = this.closest('tr')?.querySelector('.subtotal');
                if (subtotalEl) subtotalEl.innerText = data.subtotal;

                // total
                const totalEl = document.querySelector('#cart-total');
                if (totalEl) totalEl.innerText = data.total;
            });
    });
});

// document.querySelectorAll('.minus').forEach(btn => {
//     btn.addEventListener('click', function (e) {
//         e.preventDefault();

//         fetch(this.getAttribute('href'))
//             .then(res => res.json())
//             .then(data => {
//                 console.log(data); // 🔍 debug 用

//                 // quantity
//                 const qtyEl = this.parentElement.querySelector('.quantity');
//                 if (qtyEl) qtyEl.innerText = data.quantity;

//                 // cart icon
//                 const cartCountEl = document.querySelector('#cart-count');
//                 if (cartCountEl) cartCountEl.innerText = data.cart_count;

//                 // subtotal
//                 const subtotalEl = this.closest('tr')?.querySelector('.subtotal');
//                 if (subtotalEl) subtotalEl.innerText = data.subtotal;

//                 // total
//                 const totalEl = document.querySelector('#cart-total');
//                 if (totalEl) totalEl.innerText = data.total;
//             });
//     });
// });
