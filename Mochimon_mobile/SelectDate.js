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
let userId, eventId;
if(urlParams.get('eventId').includes('?')){
  userId  = urlParams.get('eventId').split('?')[0];
  eventId = urlParams.get('eventId').split('?')[1];
}else{
  eventId = urlParams.get('eventId');
}

if (!eventId) {
  console.error("eventId が指定されていません");
}

// ── チェックリストを読み込んで表示 ─────────────────────────────
async function loadChecklistItems(userId, eventId) {
  // Firestore のパス構造: users/{uid}/checklists/{eventId}
  const docRef  = doc(db, userId, eventId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
      const eventData = docSnap.data();
      const header = document.getElementById('eventHeader');
      const startDate = eventData.startDate.toDate(); 
      const endDate = eventData.endDate.toDate();
      const formattedDate = `${startDate.getFullYear()}年${startDate.getMonth() + 1}月${startDate.getDate()}日`;
      const formattedendDate = `${endDate.getFullYear()}年${endDate.getMonth() + 1}月${endDate.getDate()}日`;
      if(formattedDate != formattedendDate){
            header.innerHTML = `${formattedDate}~${formattedendDate}<br>${eventData.eventName}`;
      }
      else{
            header.innerHTML = `${formattedDate}<br>${eventData.eventName}`;
      }
    
  }

  const data     = docSnap.data();
  const itemList = data.itemList || [];
  const checklist = document.querySelector('.checklist');
  checklist.innerHTML = '';  // 一旦クリア

  await Promise.all(itemList.map(async itemText => {
    const docRef  = doc(db, userId, itemText);
    const item = await getDoc(docRef);

    const li = document.createElement('li');
    li.innerHTML = `
      <div class="item">
        <input type="checkbox"> ${item.data().name}
      </div>
      <span class="icon"><i class="fa-solid fa-cart-shopping"></i></span>
    `;
    checklist.appendChild(li);
  }));

  setupEvents();
  updateProgress();
}

function addToShoppingList(date, eventName, item) {
  const shoppingData = JSON.parse(localStorage.getItem('shoppingList')) || [];

  shoppingData.push({
    date,
    eventName,
    item
  });

  localStorage.setItem('shoppingList', JSON.stringify(shoppingData));
}


function removeFromShoppingList(date, eventName, item) {
  let shoppingData = JSON.parse(localStorage.getItem('shoppingList')) || [];

  // 指定アイテムを削除
  shoppingData = shoppingData.filter(entry => !(entry.date === date && entry.eventName === eventName && entry.item === item));

  // 残った同じイベントのデータがあるかチェック
  const remainingItems = shoppingData.filter(entry => entry.date === date && entry.eventName === eventName);

  // localStorage 上書き保存
  if (remainingItems.length === 0) {
    // このイベントのカードも削除される（Shopping.html 側で）
    console.log(`🧹 イベント「${eventName}」の日付「${date}」はすべて削除されました`);
  }

  localStorage.setItem('shoppingList', JSON.stringify(shoppingData));
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
      console.log('🛒 icon clicked');
      const isAdded = icon.classList.contains('fa-circle-check');
      const itemText = icon.closest('li').innerText.trim();
      // イベント情報を取得
      const header = document.getElementById('eventHeader').innerText.split('\n');
      const eventDate = header[0];   // "日付"
      const eventName = header[1];   // "タイトル"

      if (isAdded) {
        icon.classList.replace('fa-circle-check', 'fa-cart-shopping');
        
        icon.parentElement.classList.remove('added');
        removeFromShoppingList(eventDate, eventName, itemText);
      } else {

        icon.classList.replace('fa-cart-shopping', 'fa-circle-check');
        icon.parentElement.classList.add('added');
        addToShoppingList(eventDate, eventName, itemText);
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
    if(!userId){
      userId = user.uid;
    }
    await loadChecklistItems(userId, eventId);
  });
});