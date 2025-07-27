// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";
import { getFirestore, addDoc, updateDoc, deleteDoc, collection, doc ,getDoc} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyChPt5NDvgd4okxbUQalZtrS7w6Tm30fgg",
    authDomain: "mochimon-base.firebaseapp.com",
    projectId: "mochimon-base",
    storageBucket: "mochimon-base.firebasestorage.app",
    messagingSenderId: "5202457046",
    appId: "1:5202457046:web:7233c6b556a7d260803477",
    measurementId: "G-GPT541EW6S"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
const params = new URLSearchParams(window.location.search);
const eventId = params.get("eventId");


async function loadChecklistItems() {
  if (!currentUser) {
    console.log("ユーザー未認証なので読み込みを待つ");
    return;
  }
  if (!eventId) {
    console.error("eventIdがURLにありません");
    return;
  }
  try {
    const eventRef = doc(db, currentUser.uid, eventId);
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists()) {
      const eventData = eventSnap.data();
      const items = eventData.itemList || [];
      const checklist = document.getElementById('checklist');
      checklist.innerHTML = '';  // 一旦リストを空に

      items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
          <input type="checkbox" ${item.checked ? 'checked' : ''} />
          <span>${item.name}</span>
        `;
        checklist.appendChild(li);
      });
      updateEmptyMessage();
    } else {
      console.log("イベントが見つかりません");
    }
  } catch (error) {
    console.error("チェックリスト読み込みエラー:", error);
  }
}

// ユーザーの認証状態が変わるたびにcurrentUserにセット

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    console.log("auth state changed:", user);
    if (user) {
        loadChecklistItems();  // ここでFirestoreから読み込む
    }
});

document.getElementById('open-add-item-modal').addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.add('active');
});

function updateEmptyMessage() {
    const checklist = document.getElementById('checklist');
    const emptyMessage = document.getElementById('empty-message');
    if (checklist.children.length === 0) {
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
    }
}

// 初期表示
updateEmptyMessage();

// アイテム名入力
document.getElementById('add-item-btn').addEventListener('click', () => {
    const title = document.getElementById('item-title').value.trim();

    if (title) {
        const li = document.createElement('li');
        li.innerHTML = `
      <input type="checkbox" />
      <span>${title}</span>
    `;
        document.getElementById('checklist').appendChild(li);
        document.getElementById('item-title').value = '';
        document.getElementById('modal-overlay').classList.remove('active');
        updateEmptyMessage();
    } else {
        alert('持ち物名を入力してください');
    }
});

// モーダルを閉じる（背景タップで閉じる）
document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') {
        document.getElementById('modal-overlay').classList.remove('active');
    }
});
// キャンセルボタン
document.querySelector('.cancel-button').addEventListener('click', () => {
    window.location.href = `EventEdit.html?eventId=${eventId}`;
});
//保存ボタン
document.querySelector('.save-button').addEventListener('click', async () => {
    const checklistItems = document.querySelectorAll('#checklist li');
    const items = Array.from(checklistItems).map(li => {
        return {
            name: li.querySelector('span').textContent,
            checked: li.querySelector('input[type="checkbox"]').checked
        };
    });

    try {
        while (!currentUser);

        // まず item を単独コレクションに保存（必要なら残す）
        for (const item of items) {
            await addDoc(collection(db, currentUser.uid), {
                tag: "item",
                unlisted: false,
                name: item.name,
                isChecked: item.checked
            });
        }

        // ✅ イベント本体にも itemList を保存
        const eventRef = doc(db, currentUser.uid, eventId);
        await updateDoc(eventRef, {
            itemList: items
        });

        alert("保存成功！");
        window.location.href = `EventEdit.html?eventId=${eventId}`;
    } catch (error) {
        alert("保存に失敗しました: " + error.message);
        console.error("保存エラー", error);
    }
});

// テンプレ画面へ遷移
document.getElementById('use-template-btn').addEventListener('click', () => {
  window.location.href = 'UseTemplate.html';
});
