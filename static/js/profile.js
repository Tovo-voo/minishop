// 從 taiwanData 生成對照表
const districts = {};
const postalCodes = {};
for (const [city, districtList] of Object.entries(taiwanData)) {
districts[city] = districtList.map(d => d.name);
postalCodes[city] = {};
districtList.forEach(d => { postalCodes[city][d.name] = d.zip; });
}

const citySelect = document.getElementById('profile-city');
const districtSelect = document.getElementById('profile-district');

// 填入縣市選項
Object.keys(taiwanData).forEach(city => {
const opt = document.createElement('option');
opt.value = city;
opt.textContent = city;
if (city === savedCity) opt.selected = true;
citySelect.appendChild(opt);
});

// 更新鄉鎮市區
function updateDistricts(selectedDistrict = '') {
districtSelect.innerHTML = '<option value="">請選擇鄉鎮市區</option>';
const city = citySelect.value;
if (city && districts[city]) {
    districts[city].forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    if (d === selectedDistrict) opt.selected = true;
    districtSelect.appendChild(opt);
    });
}
}

// 初始化鄉鎮市區
updateDistricts(savedDistrict);

citySelect.addEventListener('change', () => updateDistricts());

// 儲存
async function saveProfile() {
const formData = new FormData(document.getElementById('profile-form'));

// 組合生日
const year = formData.get('birth_year');
const month = formData.get('birth_month');
const day = formData.get('birth_day');
if (year && month && day) {
    formData.set('birthday', `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`);
}

// 自動填入郵遞區號
const city = formData.get('city');
const district = formData.get('district');
if (city && district && postalCodes[city] && postalCodes[city][district]) {
    formData.set('postal_code', postalCodes[city][district]);
}

const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

const response = await fetch("/accounts/profile_info/", {
    method: 'POST',
    headers: { 'X-CSRFToken': csrfToken },
    body: formData,
});

const data = await response.json();
const msgBox = document.getElementById('profile-message');

if (data.success) {
    msgBox.textContent = '個人資料已儲存！';
    msgBox.className = 'profile-alert profile-alert-success';
    msgBox.style.display = 'block';
} else {
    msgBox.textContent = '儲存失敗，請確認資料是否完整。';
    msgBox.className = 'profile-alert profile-alert-error';
    msgBox.style.display = 'block';
}

setTimeout(() => { msgBox.style.display = 'none'; }, 3000);
}

function resetForm() {
document.getElementById('profile-form').reset();
updateDistricts(savedDistrict);
}