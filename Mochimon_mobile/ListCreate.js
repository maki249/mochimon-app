// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyChPt5NDvgd4okxbUQalZtrS7w6Tm30fgg",
  authDomain: "mochimon-base.firebaseapp.com",
  projectId: "mochimon-base",
  storageBucket: "mochimon-base.firebasestorage.app",
  messagingSenderId: "5202457046",
  appId: "1:5202457046:web:7233c6b556a7d260803477",
  measurementId: "G-GPT541EW6S"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
const params = new URLSearchParams(window.location.search);
const eventId = params.get("eventId");
const date = params.get("date");

let movePageFlag = 0;

function updateEmptyMessage() {
  const checklist = document.getElementById('checklist');
  const emptyMessage = document.getElementById('empty-message');
  emptyMessage.style.display = checklist.children.length === 0 ? 'block' : 'none';
}

function loadChecklistItems() {
  if (!currentUser) {
    console.log("ユーザー未認証なので読み込みを待つ");
    return;
  }

  const items = JSON.parse(localStorage.getItem('item')) || [];

  const checklist = document.getElementById('checklist');
  checklist.innerHTML = ''; // 一旦リストを空に

  items.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${item}</span>
      <i class="fas fa-trash delete-icon"></i>
    `;
    checklist.appendChild(li);
  });

  updateEmptyMessage();
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  console.log("auth state changed:", user);
  if (user) loadChecklistItems();
});

// 持ち物追加モーダル表示
document.getElementById('open-add-item-modal').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.add('active');
});

// 持ち物追加処理
document.getElementById('add-item-btn').addEventListener('click', () => {
  const title = document.getElementById('item-title').value.trim();
  if (!title) {
    alert('持ち物名を入力してください');
    return;
  }

  const li = document.createElement('li');
  li.innerHTML = `
    <span>${title}</span>
    <i class="fas fa-trash delete-icon"></i>
  `;
  document.getElementById('checklist').appendChild(li);
  document.getElementById('item-title').value = '';
  document.getElementById('modal-overlay').classList.remove('active');
  updateEmptyMessage();
});

// モーダルを閉じる
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') {
    document.getElementById('modal-overlay').classList.remove('active');
  }
});

// 持ち物削除処理
document.getElementById('checklist').addEventListener('click', function (e) {
  if (e.target.classList.contains('delete-icon')) {
    const li = e.target.closest('li');
    if (li) {
      li.remove();
      updateEmptyMessage();
    }
  }
});

// 保存処理
document.querySelector('.save-button').addEventListener('click', async () => {
  const checklistItems = document.querySelectorAll('#checklist li span');
  const items = Array.from(checklistItems).map(item => item.textContent);

  try {
    while (!currentUser); // 認証待機（非推奨だが現行維持）

    if (eventId) {
      const eventRef = doc(db, currentUser.uid, eventId);
      await updateDoc(eventRef, {
        itemList: items
      });
    } else {
      localStorage.setItem('item', JSON.stringify(items));
    }

    alert("保存成功！");
    movePageFlag = 1;

    if (eventId) {
      window.location.href = `EventEdit.html?eventId=${eventId}`;
    } else {
      window.location.href = `EventCreate.html?date=${date}`;
    }

  } catch (error) {
    alert("保存に失敗しました: " + error.message);
    console.error("保存エラー", error);
  }
});

// キャンセルボタン処理
document.querySelector('.cancel-button').addEventListener('click', () => {
  if (eventId) {
    window.location.href = `EventEdit.html?eventId=${eventId}`;
  } else {
    window.location.href = `EventCreate.html?date=${date}`;
  }
});

// テンプレート画面へ
document.getElementById('use-template-btn').addEventListener('click', () => {
  movePageFlag = 2;
  if (eventId) {
    window.location.href = `UseTemplate.html?eventId=${eventId}`;
  } else {
    window.location.href = `UseTemplate.html?date=${date}`;
  }
});

// ページ遷移前に持ち物一時保存（テンプレへ移動時など）
window.addEventListener("beforeunload", function (e) {
  if (movePageFlag === 0) {
    e.preventDefault();
    e.returnValue = '';
  } else {
    const checklistItems = document.querySelectorAll('#checklist li span');
    const items = Array.from(checklistItems).map(item => item.textContent);
    localStorage.setItem('item', JSON.stringify(items));

    if (movePageFlag === 2) {
      localStorage.setItem('eventId', eventId || '');
      localStorage.setItem('date', date || '');
    }
  }
});

// 初期空チェック
updateEmptyMessage();
