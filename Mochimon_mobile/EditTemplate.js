const editIcon = document.querySelector('.fa-pencil');
const modal = document.getElementById('editModal');
const input = document.getElementById('templateNameInput');
const cancelBtn = document.getElementById('cancelModal');
const saveBtn = document.getElementById('saveModal');
const title = document.querySelector('.title-with-icon h3');

const addEventBtn = document.getElementById('add-event-btn');
const addModalOverlay = document.getElementById('addModalOverlay');
const addItemInput = document.getElementById('addItemInput');
const addItemSaveBtn = document.getElementById('addItemSaveBtn');
const addItemCancelBtn = document.getElementById('addItemCancelBtn');
const checklist = document.querySelector('.checklist');

editIcon.addEventListener('click', () => {
  input.value = title.textContent; // 現在の名前をセット
  modal.style.display = 'flex';
});

cancelBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

saveBtn.addEventListener('click', () => {
  const newName = input.value.trim();
  if (newName !== "") {
    title.textContent = newName;
  }
  modal.style.display = 'none';
});

// モーダル外をクリックして閉じる
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// 「＋」ボタンを押したら追加モーダルを表示
addEventBtn.addEventListener('click', () => {
  addModalOverlay.classList.add('active');
  addItemInput.value = '';
  addItemInput.focus();
});

// キャンセルボタンで閉じる
addItemCancelBtn.addEventListener('click', () => {
  addModalOverlay.classList.remove('active');
});

// モーダル背景クリックで閉じる（任意）
addModalOverlay.addEventListener('click', (e) => {
  if (e.target === addModalOverlay) {
    addModalOverlay.classList.remove('active');
  }
});

// 「追加」ボタンを押したらチェックリストに項目を追加
addItemSaveBtn.addEventListener('click', () => {
  const newItem = addItemInput.value.trim();
  if (newItem === '') {
    alert('持ち物を入力してください。');
    addItemInput.focus();
    return;
  }

  // 新しい<li>要素を作成
  const li = document.createElement('li');

  const itemDiv = document.createElement('div');
  itemDiv.className = 'item';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.disabled = true;

  itemDiv.appendChild(checkbox);
  itemDiv.appendChild(document.createTextNode(' ' + newItem));

  const iconSpan = document.createElement('span');
  iconSpan.className = 'icon';
  iconSpan.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

  li.appendChild(itemDiv);
  li.appendChild(iconSpan);

  checklist.appendChild(li);

  addModalOverlay.classList.remove('active');
});