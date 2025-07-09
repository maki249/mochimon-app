// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";
import { getFirestore, addDoc, updateDoc, deleteDoc, collection } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
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
// ユーザーの認証状態が変わるたびにcurrentUserにセット
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    console.log("auth state changed:", user);
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
    window.location.href = 'EventCreate.html';
});
// 保存ボタン
document.querySelector('.save-button').addEventListener('click', async () => {
    const checklistItems = document.querySelectorAll('#checklist li');
    const items = Array.from(checklistItems).map(li => {
        return {
            name: li.querySelector('span').textContent,
            checked: li.querySelector('input[type="checkbox"]').checked
        };
    });
    for(const a of items){
        console.log(a.name,a.checked);
    }

    try{
        //データ登録
        while(!currentUser);
        
        console.log(currentUser.uid)
        for(const item of items){
            const docRef = await addDoc(collection(db, currentUser.uid), {
                tag: "item",
                unlisted: false,
                name: item.name,
                isChecked: item.checked
            });
        }
        
        alert("登録成功: ");
        window.location.href = 'EventCreate.html';
    } catch(error){
        alert("登録に失敗しました: " + error.message);
        console.error("エラー", error);
    }
});
// テンプレ画面へ遷移
document.getElementById('use-template-btn').addEventListener('click', () => {
  window.location.href = 'UseTemplate.html';
});
