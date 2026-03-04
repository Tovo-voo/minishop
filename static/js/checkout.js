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
  
  // 自動填入郵遞區號
  if (!postal_code && postalCodes[city] && postalCodes[city][district]) {
    postal_code = postalCodes[city][district];
    document.getElementById('postal_code').value = postal_code;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  const createUrl = '/orders/address_create/';
  
  const formData = new FormData();
  formData.append('receiver', receiver);
  formData.append('phone', phone);
  formData.append('city', city);
  formData.append('district', district);
  formData.append('street_address', street_address);
  formData.append('postal_code', postal_code);
  formData.append('csrfmiddlewaretoken', csrfToken);
  
  try {
    const response = await fetch(createUrl, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (data.success) {
      // 動態新增到列表
      addAddressToList(data.address);
      
      // 關閉 Modal
      closeAddressModal();
      
      // 顯示成功訊息
      alert('地址新增成功！');
    } else {
      alert('錯誤：' + data.error);
    }
  } catch (error) {
    console.error('詳細錯誤:', error);
    alert('發生錯誤,請稍後再試');
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


// ========== 頁面載入時執行 ========== 
document.addEventListener('DOMContentLoaded', function() {
  handleDeliveryChange();
});