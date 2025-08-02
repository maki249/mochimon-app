import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, doc, collection,  getDoc, setDoc, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
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
let currentUser = null;

const save = document.getElementById('save');

const editIcon = document.querySelector('.title-with-icon');
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

// URL から TempId を取得
const params  = new URLSearchParams(window.location.search);
const TempId = params.get("TempId");
const TempName = params.get("TempName");

// ユーザーの認証状態が変わるたびにcurrentUserにセット
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    console.log("auth state changed:", user);
    let type = "default";
    try{
      // テンプレートリストの取得
      if(TempId){
        const getItem = await getDoc(doc(db, user.uid, TempId));
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
      }else{
        type = "origin";
        title.textContent = TempName;
      }
    }catch(error){
        console.log(error);
    }

    save.addEventListener('click', async () => {
      const newTempItem = document.getElementsByClassName('item');
      const item = []
        
      for(const ItemName of newTempItem){
        const itemDict = {
          name: ItemName.textContent,
          isChecked: false
        }
        item.push(itemDict);
      }
      if(TempId){
        await setDoc(doc(db, user.uid, TempId), {
          tag: "templateList",
          title: title.textContent,
          item: item,
          type: type
        });
      }else if(TempName){
        await addDoc(collection(db, user.uid), {
          tag: "templateList",
          title: title.textContent,
          item: item,
          type: type
        });
      }


      alert("登録成功: ");
      window.location.href = 'Template.html';
    });
        
    saveBtn.addEventListener('click', async () => {
      const newName = input.value.trim();
      if (newName !== "") {
        title.textContent = newName;
        modal.style.display = 'none';
      }else{
        const item = await getDoc(doc(db, user.uid, TempId));
        if(item.data().type === "default"){
          alert("テンプレートリストのタイトルを入力してください");
        }else{
          if(confirm("テンプレートリストを削除します")){
            await deleteDoc(doc(db, user.uid, TempId));
            window.location.href = "Template.html";
          }
        }
      }
    });
});

editIcon.addEventListener('click', () => {
  input.value = title.textContent; // 現在の名前をセット
  modal.style.display = 'flex';
});

cancelBtn.addEventListener('click', () => {
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
  icon.addEventListener('click', () => {
    if(confirm('"' + name + '"をテンプレートリストから削除します')){
      li.remove();
    }
  })

  iconArea.appendChild(icon);
  li.appendChild(iconArea);
  
  return li;
}