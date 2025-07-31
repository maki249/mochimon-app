import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyChPt5NDvgd4okxbUQalZtrS7w6Tm30fgg",
  authDomain: "mochimon-base.firebaseapp.com",
  projectId: "mochimon-base",
  storageBucket: "mochimon-base.firebasestorage.app",
  messagingSenderId: "5202457046",
  appId: "1:5202457046:web:7233c6b556a7d260803477",
  measurementId: "G-GPT541EW6S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// URLからeventIdとuserIdを取得
const urlParams = new URLSearchParams(window.location.search);
let userId = null;
let eventId = urlParams.get('eventId') || null;


// userId と eventId の分割処理（もしuserId?eventId形式の場合）
if (eventId && eventId.includes('?')) {
  [userId, eventId] = eventId.split('?');
}

// Firestoreからチェックリストを取得して表示
async function loadChecklistItems(userId, eventId) {
  if (!userId || !eventId) {
    console.error("userId または eventId が未定義です");
    return;
  }

  const eventDocRef = doc(db, userId, eventId);
  const eventDocSnap = await getDoc(eventDocRef);

  if (!eventDocSnap.exists()) {
    console.error("指定されたイベントのデータが存在しません");
    return;
  }

  const eventData = eventDocSnap.data();

  // 日付表示更新
  const header = document.getElementById('eventHeader');
  if (eventData.startDate && eventData.endDate) {
    const startDate = eventData.startDate.toDate();
    const endDate = eventData.endDate.toDate();
    const formattedStartDate = `${startDate.getFullYear()}年${startDate.getMonth()+1}月${startDate.getDate()}日`;
    const formattedEndDate = `${endDate.getFullYear()}年${endDate.getMonth()+1}月${endDate.getDate()}日`;
    if (formattedStartDate !== formattedEndDate) {
      header.innerHTML = `${formattedStartDate} ～ ${formattedEndDate}<br>${eventData.eventName || ''}`;
    } else {
      header.innerHTML = `${formattedStartDate}<br>${eventData.eventName || ''}`;
    }
  } else {
    header.textContent = eventData.eventName || '';
  }

  // チェックリスト初期化
  const checklist = document.querySelector('.checklist');
  checklist.innerHTML = '';
  const shoppingDocRef = doc(db, userId, `shoppingList_${eventId}`);
  const shoppingDocSnap = await getDoc(shoppingDocRef);
  const shoppingItems = shoppingDocSnap.exists() ? (shoppingDocSnap.data().items || []) : [];
  // itemListは [{name, checked}, ...]の想定に修正（firestoreから配列として取得）
  const itemList = eventData.itemList || [];
  for (const item of itemList) {
    // itemがオブジェクトなら name と checked を取得、文字列なら名前だけ扱う
    const name = (typeof item === "string") ? item : (item.name || "不明なアイテム");
    const checked = (typeof item === "object" && 'checked' in item) ? item.checked : false;
    const isInShoppingList = shoppingItems.some(i => i.name === name);
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="item">
        <input type="checkbox" ${checked ? 'checked' : ''}>
        <span>${name}</span>
      </div>
      <span class="icon ${isInShoppingList ? 'added' : ''}">
      <i class="fa-solid ${isInShoppingList ? 'fa-circle-check' : 'fa-cart-shopping'}"></i>
      </span>
    `;
    checklist.appendChild(li);
  }

  setupEvents(userId, eventId);
  updateProgress();
}

function setupEvents(userId, eventId) {
  const checklist = document.querySelector('.checklist');

  // チェックボックス変更イベント
  checklist.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      updateProgress();
      // チェック状態変更をFirestoreのitemListにも反映させたいならここで保存処理を呼ぶ
    });
  });

  // アイコン（買い物カート）クリックイベント
  checklist.querySelectorAll('.icon i').forEach(icon => {
    icon.addEventListener('click', async () => {
      const li = icon.closest('li');
      const itemName = li.querySelector('.item span').textContent.trim();

      if (!userId || !eventId) {
        alert("ユーザーIDまたはイベントIDがありません。");
        return;
      }

      const shoppingDocRef = doc(db, userId, `shoppingList_${eventId}`);
      const docSnap = await getDoc(shoppingDocRef);
      let shoppingData = { eventName: eventId, date: "", items: [] };

      if (docSnap.exists()) {
        shoppingData = docSnap.data();
      } else {
        // 初回はイベントの開始日をセット
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

      const isAdded = icon.classList.contains('fa-circle-check');
      if (isAdded) {
        // アイテム削除
        icon.classList.replace('fa-circle-check', 'fa-cart-shopping');
        icon.parentElement.classList.remove('added');

        shoppingData.items = shoppingData.items.filter(item => item.name !== itemName);

        if (shoppingData.items.length === 0) {
          await deleteDoc(shoppingDocRef);
          alert("🧹 全アイテムが削除されたので買い物リストを削除しました");
        } else {
          await setDoc(shoppingDocRef, shoppingData);
          alert("📝 アイテムを削除し、更新しました");
        }
      } else {
        // アイテム追加
        icon.classList.replace('fa-cart-shopping', 'fa-circle-check');
        icon.parentElement.classList.add('added');

        if (!shoppingData.items.some(item => item.name === itemName)) {
          shoppingData.items.push({ name: itemName, checked: false });
        }
        await setDoc(shoppingDocRef, shoppingData);
        console.log("保存完了:", itemName);
      }
    });
  });
}

function updateProgress() {
  const checklist = document.querySelector('.checklist');
  const items = Array.from(checklist.querySelectorAll('li'));
  const checkedCount = items.filter(li => li.querySelector('input').checked).length;
  const totalCount = items.length;
  const percent = totalCount === 0 ? 0 : Math.round((checkedCount / totalCount) * 100);

  const progressText = document.getElementById('progress');
  const progressBar = document.querySelector('.progress-bar-fill');

  if (progressText) progressText.textContent = `${percent}%`;
  if (progressBar) progressBar.style.width = `${percent}%`;

  // 未チェックを上にする
  const unchecked = items.filter(li => !li.querySelector('input').checked);
  const checked = items.filter(li => li.querySelector('input').checked);

  checklist.innerHTML = '';
  [...unchecked, ...checked].forEach(li => checklist.appendChild(li));
}

// 認証状態を監視しロード開始
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
