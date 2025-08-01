// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
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
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
const params = new URLSearchParams(window.location.search);
const eventId = params.get("eventId");
const date = params.get("date");

let movePageFlag = 0;

const itemArray = JSON.parse(localStorage.getItem('item')) || [];

async function loadChecklistItems() {
  if (!currentUser) {
    console.log("ユーザー未認証なので読み込みを待つ");
    return;
  }
  if (date || eventId) {
    const items = itemArray || [];
    const checklist = document.getElementById('checklist');
    checklist.innerHTML = '';  // 一旦リストを空に
    items.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${item}</span>
        <i class="fas fa-trash delete-icon"></i>
      `;
      checklist.appendChild(li);
    });
    updateEmptyMessage();
    return;
  }else {
    console.log("イベントが見つかりません");
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
          <span>${title}</span>
          <i class="fas fa-trash delete-icon"></i>
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
document.querySelector('.cancel-button').addEventListener('click', (e) => {
    if(!eventId){
      window.location.href = `EventCreate.html?date=${date}`; 
    }else{
      window.location.href = `EventEdit.html?eventId=${eventId}`;
    }
});
//保存ボタン
document.querySelector('.save-button').addEventListener('click', async () => {
    const checklistItems = document.querySelectorAll('#checklist li span');
    const items = [];
    for(const item of checklistItems){
      items.push(item.textContent);
    }
    
    try {
        while (!currentUser);

        // item localStrageに保存（必要なら残す）
        for (const item of items) {
            itemArray.push(item);
        }

        alert("保存成功！");
        movePageFlag = 1;

        if(!eventId){
          window.location.href = `EventCreate.html?date=${date}`;
        }else{
          window.location.href = `EventEdit.html?eventId=${eventId}`;
        }
        
    } catch (error) {
        alert("保存に失敗しました: " + error.message);
        console.error("保存エラー", error);
    }

    // Firestore へ保存（eventIdがある場合）
    if (eventId) {
      const eventRef = doc(db, currentUser.uid, eventId);
      await updateDoc(eventRef, {
        itemList: items
      });
    } else {
      // 新規イベント作成前なら localStorage に保存（既存の処理）
      localStorage.setItem('item', JSON.stringify(items));
    }

    alert("保存成功！");
    movePageFlag = 1;

    if (!eventId) {
      window.location.href = `EventCreate.html?date=${date}`;
    } else {
      window.location.href = `EventEdit.html?eventId=${eventId}`;
    }
});


// テンプレ画面へ遷移
document.getElementById('use-template-btn').addEventListener('click', () => {
  movePageFlag = 2;
  if(!eventId){
    window.location.href = `UseTemplate.html?date=${date}`;
  }else{
    window.location.href = `UseTemplate.html?eventId=${eventId}`;
  }
});

document.getElementById('checklist').addEventListener('click', function (e) {
  if (e.target.classList.contains('delete-icon')) {
    const li = e.target.closest('li');
    if (li) {
      li.remove();
      updateEmptyMessage();
    }
  }
});

window.addEventListener("beforeunload", function(e){
  if(movePageFlag === 0){
    e.preventDefault();
  }else{
    this.localStorage.setItem('item', JSON.stringify(itemArray));
    if(movePageFlag === 2){
      this.localStorage.setItem('eventId', eventId);
      this.localStorage.setItem('date', date);
    }
  }
})
