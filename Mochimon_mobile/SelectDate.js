import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyChPt5NDvgd4okxbUQalZtrS7w6Tm30fgg",
    authDomain: "mochimon-base.firebaseapp.com",
    projectId: "mochimon-base",
    storageBucket: "mochimon-base.firebasestorage.app",
    messagingSenderId: "5202457046",
    appId: "1:5202457046:web:7233c6b556a7d260803477",
    measurementId: "G-GPT541EW6S"
};



const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// ── URL パラメータから eventId を取得 ────────────────────────
const urlParams = new URLSearchParams(window.location.search);
const eventId   = urlParams.get('eventId');
if (!eventId) {
  console.error("eventId が指定されていません");
}

// ── チェックリストを読み込んで表示 ─────────────────────────────
async function loadChecklistItems(user, eventId) {
  // Firestore のパス構造: users/{uid}/checklists/{eventId}
  const docRef  = doc(db, user.uid, eventId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
      const eventData = docSnap.data();
      

      const header = document.getElementById('eventHeader');
      const startDate = eventData.startDate.toDate(); 
      const formattedDate = `${startDate.getFullYear()}年${startDate.getMonth() + 1}月${startDate.getDate()}日`;
      header.innerHTML = `${formattedDate}<br>${eventData.eventName}`;
  }

  const data     = docSnap.data();
  const itemList = data.itemList || [];

  const checklist = document.querySelector('.checklist');
  checklist.innerHTML = '';  // 一旦クリア

  itemList.forEach(async itemText =>  {
    const docRef  = doc(db, user.uid, itemText);
    const item = await getDoc(docRef);
    
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="item">
        <input type="checkbox"> ${item.data().name}
      </div>
      <span class="icon"><i class="fa-solid fa-cart-shopping"></i></span>
    `;
    //console.log(item);
    checklist.appendChild(li);
  });

  setupEvents();
  updateProgress();
}

// ── チェックボックス＆アイコンにイベント登録 ───────────────
function setupEvents() {
  // チェックボックス変更で進捗更新
  const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
  checkboxes.forEach(cb => cb.addEventListener('change', updateProgress));

  // アイコンクリックでクラス切り替え
  const icons = document.querySelectorAll('.icon i');
  icons.forEach(icon => {
    icon.addEventListener('click', () => {
      const isAdded = icon.classList.contains('fa-circle-check');
      if (isAdded) {
        icon.classList.replace('fa-circle-check', 'fa-cart-shopping');
        icon.parentElement.classList.remove('added');
      } else {
        icon.classList.replace('fa-cart-shopping', 'fa-circle-check');
        icon.parentElement.classList.add('added');
      }
    });
  });
}

// ── 進捗バー更新 ───────────────────────────────────────────
function updateProgress() {
  const checklist = document.querySelector('.checklist');
  const items     = Array.from(checklist.querySelectorAll('li'));

  const checkedCount   = items.filter(li => li.querySelector('input').checked).length;
  const totalCount     = items.length;
  const percent        = totalCount === 0 ? 0 : Math.round((checkedCount / totalCount) * 100);

  document.getElementById('progress').textContent       = `${percent}%`;
  document.querySelector('.progress-bar-fill').style.width = `${percent}%`;
  
  // 並び替え（未チェック→チェック済み）
  const unchecked = items.filter(li => !li.querySelector('input').checked);
  const checked   = items.filter(li => li.querySelector('input').checked);
  checklist.innerHTML = '';
  [...unchecked, ...checked].forEach(li => checklist.appendChild(li));
}

// ── DOM読み込み後、認証状態を監視してデータ取得 ───────────────
document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.error("ログインしているユーザーがいません。");
      return;
    }
    if (!eventId) {
      // 既に上でログ出し済みですが念のため
      console.error("eventId が指定されていません");
      return;
    }
    await loadChecklistItems(user, eventId);
  });
});