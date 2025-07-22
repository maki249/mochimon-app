import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let currentUser = null;

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

// URL から eventId を取得
const params  = new URLSearchParams(window.location.search);
const eventId = params.get("TempId");

// ユーザーの認証状態が変わるたびにcurrentUserにセット
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    console.log("auth state changed:", user);
    
    try{
      // テンプレートリストの取得
      const getItem = await getDoc(doc(db, user.uid, eventId));
      
      // テンプレートリストタイトルの表示
      title.textContent = getItem.data().title;

      // テンプレートリストの設計
      const itemTagList = [];
      for(const item of getItem.data().item){
        const li = createItem(item.name);

        itemTagList.push(li);
      }

      // テンプレートリストの表示
      for(const itemTag of itemTagList){
        checklist.appendChild(itemTag);
      }
    }catch(error){
        console.log(error);
    }
});

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

  const li = createItem(newItem);
  checklist.appendChild(li);

  addModalOverlay.classList.remove('active');
});

// 新しい<li>要素(アイテム)を作成
function createItem(name){
  const li = document.createElement('li');
  
  const itemBox = document.createElement('div');
  itemBox.setAttribute('class', 'item');

  const checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.disabled = true;

  itemBox.appendChild(checkbox);
  itemBox.appendChild(document.createTextNode(name));
  li.appendChild(itemBox);
  
  const iconArea = document.createElement('span');
  iconArea.setAttribute('class', 'icon');

  const icon = document.createElement('i');
  icon.setAttribute('class', 'fa-solid fa-trash-can');

  iconArea.appendChild(icon);
  li.appendChild(iconArea);
  
  return li;
}