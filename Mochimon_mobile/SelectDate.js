import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { deleteDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";


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

// ── URL パラメータから eventId と userId を取得（必要なら分割） ───────────────
const urlParams = new URLSearchParams(window.location.search);
let userId = null;
let eventId = null;
const rawEventParam = urlParams.get('eventId');

if (rawEventParam) {
  // eventIdに?が含まれていた場合の分割
  if (rawEventParam.includes('?')) {
    [userId, eventId] = rawEventParam.split('?');
  } else {
    eventId = rawEventParam;
  }
} else {
  console.error("eventId が指定されていません");
}

// ── チェックリストを読み込んで表示 ─────────────────────────────
async function loadChecklistItems(userId, eventId) {
  if (!userId || !eventId) {
    console.error("userId または eventId が未定義です");
    return;
  }

  const docRef  = doc(db, userId, eventId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    console.error("指定されたイベントのデータが存在しません");
    return;
  }

  const eventData = docSnap.data();

  // startDate / endDateの安全確認
  if (!eventData.startDate || !eventData.endDate) {
    console.error("イベントデータに startDate または endDate がありません");
    return;
  }

  const startDate = eventData.startDate.toDate();
  const endDate = eventData.endDate.toDate();
  const formattedDate = `${startDate.getFullYear()}年${startDate.getMonth() + 1}月${startDate.getDate()}日`;
  const formattedEndDate = `${endDate.getFullYear()}年${endDate.getMonth() + 1}月${endDate.getDate()}日`;

  const header = document.getElementById('eventHeader');
  if (formattedDate !== formattedEndDate) {
    header.innerHTML = `${formattedDate}~${formattedEndDate}<br>${eventData.eventName}`;
  } else {
    header.innerHTML = `${formattedDate}<br>${eventData.eventName}`;
  }

  const itemList = eventData.itemList || [];
  const checklist = document.querySelector('.checklist');
  checklist.innerHTML = '';  // 一旦クリア

  await Promise.all(itemList.map(async (itemText) => {
    const itemDocRef  = doc(db, userId, itemText);
    const itemDocSnap = await getDoc(itemDocRef);

    if (!itemDocSnap.exists()) {
      console.warn(`アイテム "${itemText}" のデータが見つかりません`);
      return;
    }

    const li = document.createElement('li');
    li.innerHTML = `
      <div class="item">
        <input type="checkbox"> ${itemDocSnap.data().name}
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

  if (remainingItems.length === 0) {
    console.log(`🧹 イベント「${eventName}」の日付「${date}」はすべて削除されました`);
  }

  localStorage.setItem('shoppingList', JSON.stringify(shoppingData));
}

function getTodayDateString() {
  const date = new Date();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = weekdays[date.getDay()];
  return `${year}年${month}月${day}日（${dayOfWeek}）`;
}

// ── チェックボックス＆アイコンにイベント登録 ───────────────
function setupEvents() {
  // チェックボックス変更で進捗更新
  const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
  checkboxes.forEach(cb => cb.addEventListener('change', updateProgress));

  // アイコンクリックでクラス切り替えとFirestore更新
  const icons = document.querySelectorAll('.icon i');
  icons.forEach(icon => {
    icon.addEventListener('click', async () => {
      const isAdded = icon.classList.contains('fa-circle-check');
      // アイテム名をリスト要素から取得（改行や✓を除去）
      const itemName = icon.closest('li').innerText.trim().replace(/\n/g, '').replace(/^✓/, '');

      if (isAdded) {
        
        icon.classList.replace('fa-circle-check', 'fa-cart-shopping');
        icon.parentElement.classList.remove('added');
        const shoppingDocRef = doc(db, userId, `shoppingList_${eventId}`);
        const docSnap = await getDoc(shoppingDocRef);
        if (docSnap.exists()) {
          let shoppingData = docSnap.data();
          shoppingData.items = shoppingData.items.filter(item => item.name !== itemName);

          if (shoppingData.items.length === 0) {
            await deleteDoc(shoppingDocRef); 
            alert("🧹 全アイテムが削除されたので買い物リストを削除しました");
          } else {
            await setDoc(shoppingDocRef, shoppingData); 
            alert("📝 アイテムを削除し、更新しました");
          }
        }
      } else {
        icon.classList.replace('fa-cart-shopping', 'fa-circle-check');
        icon.parentElement.classList.add('added');

        // Firestoreの買い物リストドキュメントを取得
        const shoppingDocRef = doc(db, userId, `shoppingList_${eventId}`);
        const docSnap = await getDoc(shoppingDocRef);

        let shoppingData = {
          eventName: eventId,
          date: "",
          items: []
        };

        if (docSnap.exists()) {
          shoppingData = docSnap.data();
          shoppingData.items = shoppingData.items.filter(item => item.name !== itemName);

        } else {
          // 初回保存時はイベントのstartDateを利用
          const eventDocRef = doc(db, userId, eventId);
          const eventDocSnap = await getDoc(eventDocRef);
          if (eventDocSnap.exists()) {
            const eventData = eventDocSnap.data();
            if (eventData.startDate) {
              const startDate = eventData.startDate.toDate();
              shoppingData.date = `${startDate.getFullYear()}年${startDate.getMonth() + 1}月${startDate.getDate()}日`;
            }
          }
        }

        // 重複チェックして追加
        if (!shoppingData.items.some(item => item.name === itemName)) {
          shoppingData.items.push({ name: itemName, checked: false });
        }

        await setDoc(shoppingDocRef, shoppingData);
        console.log("保存完了:", itemName);
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

  // 未チェックのアイテムを上に並べる
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
      console.error("eventId が指定されていません");
      return;
    }
    if (!userId) {
      userId = user.uid;
    }
    await loadChecklistItems(userId, eventId);
  });
});
