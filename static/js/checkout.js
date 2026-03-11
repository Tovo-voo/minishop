// static/js/checkout.js

// ========== 從 taiwanData 生成 districts 和 postalCodes ========== 
const districts = {};
const postalCodes = {};

Object.keys(taiwanData).forEach(city => {
  districts[city] = taiwanData[city].map(item => item.name);
  postalCodes[city] = {};
  taiwanData[city].forEach(item => {
    postalCodes[city][item.name] = item.zip;
  });
});

// ========== 處理配送方式變更 ========== 
function handleDeliveryChange() {
  const delivery711 = document.getElementById('delivery-711');
  const deliveryHome = document.getElementById('delivery-home');
  const payment711 = document.getElementById('payment-711');
  const paymentHome = document.getElementById('payment-home');
  
  if (!delivery711 || !deliveryHome || !payment711 || !paymentHome) {
    console.error('找不到配送或付款方式元素');
    return;
  }
  
  if (delivery711.checked) {
    payment711.style.display = 'block';
    paymentHome.style.display = 'none';
    const paymentCod = document.getElementById('payment-cod');
    if (paymentCod) paymentCod.checked = true;
  } else if (deliveryHome.checked) {
    payment711.style.display = 'none';
    paymentHome.style.display = 'block';
    const paymentCreditHome = document.getElementById('payment-credit-home');
    if (paymentCreditHome) paymentCreditHome.checked = true;
  }
  
  handlePaymentChange();
}

// ========== 處理付款方式變更 ========== 
function handlePaymentChange() {
  const delivery711 = document.getElementById('delivery-711');
  const deliveryHome = document.getElementById('delivery-home');
  const paymentCod = document.getElementById('payment-cod');
  const paymentCredit711 = document.getElementById('payment-credit-711');
  const store711 = document.getElementById('info-711-store');
  const homeAddress = document.getElementById('info-home-address');
  const creditCardSection = document.getElementById('credit-card-section');
  
  if (store711) store711.style.display = 'none';
  if (homeAddress) homeAddress.style.display = 'none';
  if (creditCardSection) creditCardSection.style.display = 'none';
  
  if (delivery711 && delivery711.checked) {
    if (paymentCod && paymentCod.checked) {
      if (store711) store711.style.display = 'block';
    } else if (paymentCredit711 && paymentCredit711.checked) {
      if (store711) store711.style.display = 'block';
      if (creditCardSection) creditCardSection.style.display = 'block';
    }
  } else if (deliveryHome && deliveryHome.checked) {
    if (homeAddress) homeAddress.style.display = 'block';
    if (creditCardSection) creditCardSection.style.display = 'block';
  }
}

// ========== 7-11門市相關函數 ========== 
function open711Map() {
  window.open(
    'https://emap.pcsc.com.tw/ecmap/default.aspx',
    '711Map',
    'width=900,height=700,scrollbars=yes,resizable=yes'
  );
  setTimeout(function() {
    manualInputStore();
  }, 1000);
}

function manualInputStore() {
  const storeName = prompt('請輸入門市名稱：');
  if (storeName) {
    const storeAddress = prompt('請輸入門市地址：');
    if (storeAddress) {
      document.getElementById('store_id').value = 'manual-' + Date.now();
      document.getElementById('store_name').value = storeName;
      document.getElementById('store_address').value = storeAddress;
      document.getElementById('display-store-name').textContent = storeName;
      document.getElementById('display-store-address').textContent = storeAddress;
      document.getElementById('selected-store-info').style.display = 'block';
    }
  }
}

function clearStore() {
  document.getElementById('store_id').value = '';
  document.getElementById('store_name').value = '';
  document.getElementById('store_address').value = '';
  document.getElementById('selected-store-info').style.display = 'none';
}

// ========== Modal 區域選擇 ========== 
function updateModalDistricts() {
  const citySelect = document.getElementById('modal-city');
  const districtSelect = document.getElementById('modal-district');
  
  if (!citySelect || !districtSelect) return;
  
  const selectedCity = citySelect.value;
  districtSelect.innerHTML = '';
  
  if (selectedCity && districts[selectedCity]) {
    districts[selectedCity].forEach((district, index) => {
      const option = document.createElement('option');
      option.value = district;
      option.textContent = district;
      if (index === 0) {
        option.selected = true;
      }
      districtSelect.appendChild(option);
    });
  } else {
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '請選擇';
    districtSelect.appendChild(defaultOption);
  }
}

// ========== 地址Modal相關函數 ========== 
function openAddressModal() {
  document.getElementById('address-modal').classList.add('show');
}


function closeAddressModal() {
  document.getElementById('address-modal').classList.remove('show');
  document.getElementById('address-form').reset();

  // 清除編輯狀態，還原標題
  delete document.getElementById('address-form').dataset.editingId;
  document.querySelector('#address-modal .modal-header h3').textContent = '新增收貨地址';
}

// ========== 儲存地址 (AJAX + 自動填入郵遞區號) ========== 
async function saveAddress() {
  const receiver = document.getElementById('receiver').value;
  const phone = document.getElementById('phone').value;
  const city = document.getElementById('modal-city').value;
  const district = document.getElementById('modal-district').value;
  const street_address = document.getElementById('street_address').value;
  let postal_code = document.getElementById('postal_code').value;

  if (!receiver || !phone || !city || !district || !street_address) {
    alert('請填寫完整資訊');
    return;
  }

  if (!postal_code && postalCodes[city] && postalCodes[city][district]) {
    postal_code = postalCodes[city][district];
    document.getElementById('postal_code').value = postal_code;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  const editingId = document.getElementById('address-form').dataset.editingId;

  // 判斷是新增還是編輯
  const url = editingId
    ? `/orders/address/${editingId}/update/`
    : '/orders/address_create/';

  const formData = new FormData();
  formData.append('receiver', receiver);
  formData.append('phone', phone);
  formData.append('city', city);
  formData.append('district', district);
  formData.append('street_address', street_address);
  formData.append('postal_code', postal_code);
  formData.append('csrfmiddlewaretoken', csrfToken);

  try {
    const response = await fetch(url, { method: 'POST', body: formData });
    const data = await response.json();

    if (data.success) {
      if (editingId) {
        // 更新既有的地址項目
        updateAddressInList(data.address);
      } else {
        // 新增到列表
        addAddressToList(data.address);
      }
      closeAddressModal();
    } else {
      alert('錯誤：' + data.error);
    }
  } catch (error) {
    console.error('詳細錯誤:', error);
    alert('發生錯誤，請稍後再試');
  }
}

// ========== 動態新增地址到列表 ========== 
function addAddressToList(address) {
  console.log('開始新增地址:', address);
  
  const container = document.getElementById('info-home-address');
  if (!container) {
    console.error('找不到 info-home-address 容器');
    location.reload();
    return;
  }
  
  const noAddressNotice = container.querySelector('.address-notice');
  
  if (noAddressNotice) {
    console.log('第一次新增地址，移除提示訊息');
    noAddressNotice.style.display = 'none';
    
    const addressSelection = container.querySelector('.address-selection');
    const addressList = document.createElement('div');
    addressList.className = 'address-list';
    addressList.id = 'address-list';
    addressSelection.appendChild(addressList);
  }
  
  const addressList = document.getElementById('address-list');
  if (!addressList) {
    console.error('找不到 address-list');
    location.reload();
    return;
  }
  
  console.log('找到 address-list:', addressList);
  
  const addressItem = document.createElement('label');
  addressItem.className = 'address-item';
  addressItem.dataset.addressId = address.id;
  
  addressItem.innerHTML = `
    <input type="radio" name="address_id" value="${address.id}" ${address.is_default ? 'checked' : ''}>
    <div class="address-content">
      <div class="address-info">
        <strong>${address.receiver}</strong>
        <span class="phone">${address.phone}</span>
        ${address.is_default ? '<span class="default-badge">預設</span>' : ''}
      </div>
      <div class="address-detail">${address.full_address}</div>
    </div>
    <div class="address-actions">
      ${!address.is_default ? `<button type="button" class="btn-set-default" onclick="event.stopPropagation(); setDefaultAddress(${address.id})">設為預設</button>` : ''}
      <button type="button" class="btn-edit" onclick="event.stopPropagation(); editAddress(${address.id})">編輯</button>
      <button type="button" class="btn-delete" onclick="event.stopPropagation(); deleteAddress(${address.id})">刪除</button>
    </div>
  `;
  
  if (addressList.firstChild) {
    addressList.insertBefore(addressItem, addressList.firstChild);
  } else {
    addressList.appendChild(addressItem);
  }
  
  console.log('地址新增完成！');
}

// ========== 設為預設地址 ==========
async function setDefaultAddress(addressId) {
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  const formData = new FormData();
  formData.append('address_id', addressId);
  formData.append('csrfmiddlewaretoken', csrfToken);

  try {
    const response = await fetch('/orders/address/set-default/', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      // 更新預設徽章
      updateDefaultBadge(addressId);

      // 把新預設地址移到列表第一位
      const addressList = document.getElementById('address-list');
      const targetItem = document.querySelector(`[data-address-id="${addressId}"]`);
      addressList.insertBefore(targetItem, addressList.firstChild);

      // 選中該地址
      targetItem.querySelector('input[type="radio"]').checked = true;

    } else {
      alert('錯誤：' + data.error);
    }
  } catch (error) {
    console.error('錯誤:', error);
    alert('發生錯誤');
  }
}


// ========== 更新預設徽章（共用邏輯） ==========
function updateDefaultBadge(newDefaultId) {
  // 移除所有預設徽章
  document.querySelectorAll('.default-badge').forEach(badge => badge.remove());

  // 每個地址都確保有「設為預設」按鈕，並顯示出來
  document.querySelectorAll('.address-item').forEach(item => {
    const actions = item.querySelector('.address-actions');
    let setDefaultBtn = item.querySelector('.btn-set-default');

    // 如果沒有「設為預設」按鈕，動態建立一個
    if (!setDefaultBtn) {
      const id = item.dataset.addressId;
      setDefaultBtn = document.createElement('button');
      setDefaultBtn.type = 'button';
      setDefaultBtn.className = 'btn-set-default';
      setDefaultBtn.textContent = '設為預設';
      setDefaultBtn.setAttribute('onclick', `event.stopPropagation(); setDefaultAddress(${id})`);
      actions.insertBefore(setDefaultBtn, actions.firstChild); // 插到最前面
    }

    setDefaultBtn.style.display = '';
  });

  // 在新的預設地址加上徽章，並隱藏其「設為預設」按鈕
  const targetItem = document.querySelector(`[data-address-id="${newDefaultId}"]`);
  if (!targetItem) return;

  const addressInfo = targetItem.querySelector('.address-info');
  const badge = document.createElement('span');
  badge.className = 'default-badge';
  badge.textContent = '預設';
  addressInfo.appendChild(badge);

  const setDefaultBtn = targetItem.querySelector('.btn-set-default');
  if (setDefaultBtn) setDefaultBtn.style.display = 'none';
}

// ========== 編輯地址 ========== 
async function editAddress(addressId) {
  try {
    const response = await fetch(`/orders/address/${addressId}/detail/`);
    const data = await response.json();

    if (data.success) {
      document.getElementById('receiver').value = data.address.receiver;
      document.getElementById('phone').value = data.address.phone;
      document.getElementById('modal-city').value = data.address.city;
      updateModalDistricts();
      document.getElementById('modal-district').value = data.address.district;
      document.getElementById('street_address').value = data.address.street_address;
      document.getElementById('postal_code').value = data.address.postal_code;

      // 記錄正在編輯的 ID
      document.getElementById('address-form').dataset.editingId = addressId;

      // 改標題
      document.querySelector('#address-modal .modal-header h3').textContent = '編輯收貨地址';

      openAddressModal();
    }
  } catch (error) {
    console.error('錯誤:', error);
    alert('無法載入地址資料');
  }
}


// ========== 編輯地址後更新 ==========
function updateAddressInList(address) {
  const addressItem = document.querySelector(`[data-address-id="${address.id}"]`);
  if (!addressItem) return;

  addressItem.querySelector('.address-info strong').textContent = address.receiver;
  addressItem.querySelector('.address-info .phone').textContent = address.phone;
  addressItem.querySelector('.address-detail').textContent = address.full_address;
}



// ========== 自訂確認框(再次確認刪除的訊息框) ==========
function showConfirm(message) {
  return new Promise((resolve) => {
    // 建立確認框
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999;
    `;

    overlay.innerHTML = `
      <div style="
        background: #fff;
        padding: 32px;
        width: 400px;
        border-radius: 2px;
        text-align: center;
      ">
        <h4 style="font-size:16px; margin-bottom: 16px;">溫馨提醒</h4>
        <p style="margin-bottom: 28px; color: #333;">${message}</p>
        <div style="display: flex; gap: 12px;">
          <button id="confirm-ok" style="
            flex: 1; padding: 14px;
            background: #000; color: #fff;
            border: none; cursor: pointer; font-size: 15px;
          ">確定</button>
          <button id="confirm-cancel" style="
            flex: 1; padding: 14px;
            background: #fff; color: #000;
            border: 1px solid #ccc; cursor: pointer; font-size: 15px;
          ">取消</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#confirm-ok').addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(true);
    });

    overlay.querySelector('#confirm-cancel').addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(false);
    });
  });
}


// ========== 刪除地址 ==========
async function deleteAddress(addressId) {
  // 用自訂確認框取代 confirm()
  const confirmed = await showConfirm('是否刪除地址？');
  if (!confirmed) return;

  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  const formData = new FormData();
  formData.append('csrfmiddlewaretoken', csrfToken);

  try {
    const response = await fetch(`/orders/address/${addressId}/delete/`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      // 移除該地址項目
      const addressItem = document.querySelector(`[data-address-id="${addressId}"]`);
      addressItem.remove();

      // 如果後端回傳新的預設地址 id，更新前端顯示
      if (data.new_default_id) {
        updateDefaultBadge(data.new_default_id);
      }
    } else {
      alert('錯誤：' + data.error);
    }
  } catch (error) {
    console.error('錯誤:', error);
    alert('發生錯誤');
  }
}


// ========== 切換更多地址 ========== 
function toggleMoreAddresses() {
  const addressList = document.getElementById('address-list');
  const toggleText = document.getElementById('toggle-text');
  const toggleArrow = document.getElementById('toggle-arrow');

  if (addressList.classList.contains('show-all')) {
    addressList.classList.remove('show-all');
    toggleText.textContent = '更多地址';
    toggleArrow.textContent = '∨';
  } else {
    addressList.classList.add('show-all');
    toggleText.textContent = '收起';
    toggleArrow.textContent = '∧';
  }
}
// ========== 頁面載入時執行 ========== 
document.addEventListener('DOMContentLoaded', function() {
  handleDeliveryChange();
});