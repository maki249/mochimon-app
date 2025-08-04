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

// URLから eventId と userId を取得
const urlParams = new URLSearchParams(window.location.search);
let userId = null;
let eventId = urlParams.get('eventId') || null;

// eventId に userId?eventId の形式が混入している場合の対応（もしあれば）
if (eventId && eventId.includes('?')) {
  // 例: userId?eventId=xxxx → 分割して userId と eventId に分ける
  const parts = eventId.split('?');
  userId = parts[0];
  eventId = parts[1] || null;
}

// グローバルにアイテムリスト保持（checkbox状態の管理用）
let itemList = [];

// Firestoreからチェックリストを取得して表示
async function loadChecklistItems(userId, eventId) {
  if (!userId || !eventId) {
    console.error("userId または eventId が未定義です");
    return;
  }

  try {
    // イベント情報ドキュメント取得
    const eventDocRef = doc(db, userId, eventId);
    const eventDocSnap = await getDoc(eventDocRef);

    if (!eventDocSnap.exists()) {
      console.error("指定されたイベントのデータが存在しません");
      return;
    }

    const eventData = eventDocSnap.data();
    // チェックリスト初期化
    const checklist = document.querySelector('.checklist');
    checklist.innerHTML = '';

    // 買い物リスト取得（items配列）
    const shoppingDocRef = doc(db, userId, `shoppingList_${eventId}`);
    const shoppingDocSnap = await getDoc(shoppingDocRef);
    const shoppingItems = shoppingDocSnap.exists() ? (shoppingDocSnap.data().items || []) : [];

    
    // ヘッダー表示更新
    const header = document.getElementById('eventHeader');
    if (eventData.startDate && eventData.endDate) {
      const startDate = eventData.startDate.toDate();
      const endDate = eventData.endDate.toDate();
      const formattedStartDate = `${startDate.getFullYear()}年${startDate.getMonth()+1}月${startDate.getDate()}日`;
      const formattedEndDate = `${endDate.getFullYear()}年${endDate.getMonth()+1}月${endDate.getDate()}日`;
      if (formattedStartDate !== formattedEndDate) {
        header.innerHTML = `${formattedStartDate} ～ <br>${formattedEndDate}<br>${eventData.eventName || ''}`;
      } else {
        header.innerHTML = `${formattedStartDate}<br>${eventData.eventName || ''}`;
      }
    } else {
      header.textContent = eventData.eventName || '';
    }
    // アイテムリスト（eventDataから取得）
    itemList = eventData.itemArray || [];

    // 表示生成
    itemList.forEach((item, index) => {
      // itemがオブジェクトなら name と checked を取得、文字列なら名前だけ扱う
      const name = (typeof item === "string") ? item : (item.name || "不明なアイテム");
      const checked = (typeof item === "object" && 'isChecked' in item) ? item.isChecked : false;
      const isInShoppingList = shoppingItems.some(i => i.name === name);

      // li要素作成
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="item">
          <input type="checkbox" data-index="${index}" ${checked ? 'checked' : ''}>
          <span>${name}</span>
        </div>
        <span class="icon ${isInShoppingList ? 'added' : ''}">
          <i class="fa-solid ${isInShoppingList ? 'fa-circle-check' : 'fa-cart-shopping'}"></i>
        </span>
      `;
      checklist.appendChild(li);
    });

    // イベントリスナー登録
    setupEvents(userId, eventId);

    // プログレスバー更新
    updateProgress();

  } catch (error) {
    console.error("チェックリスト読み込み中にエラーが発生しました:", error);
  }
}

function setupEvents(userId, eventId) {
  const checklist = document.querySelector('.checklist');
  const checkboxes = checklist.querySelectorAll('input[type="checkbox"]');
  const icons = checklist.querySelectorAll('.icon i');

  // チェックボックスの変更イベント
  checkboxes.forEach(cb => {
    cb.addEventListener("change", async () => {
      const index = parseInt(cb.dataset.index);
      if (isNaN(index)) return;

      // itemListの該当アイテムのchecked状態を更新
      itemList[index] = {
        ...(typeof itemList[index] === "string" ? { name: itemList[index] } : itemList[index]),
        isChecked: cb.checked
      };
      
      updateProgress();

      // Firestoreのドキュメント参照作成
      const shoppingDocRef = doc(db, userId, eventId);

      try {
        // 現在のドキュメントを取得し、他データも保持しつつitemsのみ更新
        const docSnap = await getDoc(shoppingDocRef);
        const data = docSnap.exists() ? docSnap.data() : {};

        await setDoc(shoppingDocRef, {
          ...data,
          itemArray: itemList
        });

        console.log("チェック状態を保存:", itemList[index].name, cb.checked);
      } catch (error) {
        console.error("チェック状態保存中にエラー:", error);
      }
    });
  });

  // アイコン（買い物カート）のクリックイベント
  icons.forEach(icon => {
    icon.addEventListener('click', async () => {
      const li = icon.closest('li');
      if (!li) return;

      const itemName = li.querySelector('.item span').textContent.trim();
      if (!userId || !eventId) {
        console.error("ユーザーIDまたはイベントIDがありません。");
        return;
      }

      const shoppingDocRef = doc(db, userId, `shoppingList_${eventId}`);
      try {
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
          // 削除処理
          icon.classList.replace('fa-circle-check', 'fa-cart-shopping');
          icon.parentElement.classList.remove('added');

          shoppingData.items = shoppingData.items.filter(item => item.name !== itemName);

          if (shoppingData.items.length === 0) {
            await deleteDoc(shoppingDocRef);
            console.log("全アイテムが削除されたため買い物リストを削除しました");
          } else {
            await setDoc(shoppingDocRef, shoppingData);
            console.log("アイテムを削除し、買い物リストを更新しました");
          }
        } else {
          // 追加処理
          icon.classList.replace('fa-cart-shopping', 'fa-circle-check');
          icon.parentElement.classList.add('added');

          if (!shoppingData.items.some(item => item.name === itemName)) {
            shoppingData.items.push({ name: itemName, isChecked: false });
          }
          await setDoc(shoppingDocRef, shoppingData);
          console.log("アイテムを買い物リストに追加しました:", itemName);
        }

      } catch (error) {
        console.error("買い物リスト更新時にエラー:", error);
      }
    });
  });
}

function updateProgress() {
  const checklist = document.querySelector('.checklist');
  if (!checklist) return;

  const items = Array.from(checklist.querySelectorAll('li'));
  const checkedCount = items.filter(li => li.querySelector('input[type="checkbox"]').checked).length;
  const totalCount = items.length;
  const percent = totalCount === 0 ? 0 : Math.round((checkedCount / totalCount) * 100);

  const progressText = document.getElementById('progress');
  const progressBar = document.querySelector('.progress-bar-fill');

  if (progressText) progressText.textContent = `${percent}%`;
  if (progressBar) progressBar.style.width = `${percent}%`;

  // 未チェックを上にして並び替え
  const unchecked = items.filter(li => !li.querySelector('input[type="checkbox"]').checked);
  const checked = items.filter(li => li.querySelector('input[type="checkbox"]').checked);

  checklist.innerHTML = '';
  [...unchecked, ...checked].forEach(li => checklist.appendChild(li));
}

// 認証状態監視後、チェックリストをロード
document.addEventListener('DOMContentLoaded', () => {
  let homeOrShare = false;
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
      homeOrShare = true;
      userId = user.uid;
    }
    await loadChecklistItems(userId, eventId);
  });
  
  document.getElementById('return').addEventListener('click', () => {
    if(homeOrShare){
      window.location.href = 'home.html';
    }else{
      window.location.href = 'share.html';
    }
  })
});
