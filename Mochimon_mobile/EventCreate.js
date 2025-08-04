// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, addDoc, updateDoc, deleteDoc, collection, doc, getDocs, where, query, deleteField, Timestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
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
// URL から date を取得
const params  = new URLSearchParams(window.location.search);
const date = params.get("date");

const dataStorageJSON = localStorage.getItem(date);
const dataStorage = new Map(JSON.parse(dataStorageJSON));
console.log(dataStorage);
const itemArray = JSON.parse(localStorage.getItem('item'));
console.log(itemArray);

const overlay = document.getElementById('layer');


// --- 持ち物リスト描画 ---
function renderItemList(currentItemList) {
  const checklist = document.getElementById("checklist");
  if (!checklist) return; // DOMが無ければ終了

  checklist.innerHTML = "";

  if (!currentItemList || currentItemList.length === 0) {
    checklist.innerHTML = "<li>持ち物リストが空です</li>";
    return;
  }

  currentItemList.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class='mochimon'>${item.name}</span>
    `;
    checklist.appendChild(li);
  });
}

// 保存した情報の自動設定
window.onload = function(){
    const startDate = document.getElementById('start-date-box');
    startDate.value = date;
    
    if(dataStorage.size > 0){
        document.getElementById('event-title').value = dataStorage.get("title");

        document.getElementById('all-day-toggle').checked = dataStorage.get("allDay");
        document.getElementById('end-date-box').value = dataStorage.get("endDate");
        if(dataStorage.get("allDay")){
            document.getElementById('start-time-box').style.display = 'none';
            document.getElementById('end-time-box').style.display = 'none';
        }

        
        const notifyArray = document.getElementsByClassName('form-row');
        for(const notify of notifyArray){
            if(dataStorage.get("notifyList").includes(notify.id)){
                notify.classList.toggle('selected');
            }
        }
        const currentItemList = [];
        const itemArray = JSON.parse(localStorage.getItem('item')) || [];
        if(itemArray.length > 0){
            currentItemList.length = 0;
            itemArray.forEach(item =>{
            currentItemList.push({
                    name: item,
                    isChecked: false
                });
            })
        }
        renderItemList(currentItemList);
        /*const itemList = document.createElement('div');
        itemList.setAttribute('class', 'form-section');
        itemList.textContent = "持ち物";
        const itemButton = document.getElementById('add-item-button');
        itemButton.after(itemList);
        if(itemArray){
            for(const item of itemArray){
                const form = document.createElement('div');
                form.setAttribute('class', 'form-row');
                const li = document.createElement('li');
                const span = document.createElement('span');
                span.textContent = item;
                span.setAttribute('class', 'mochimon');
                itemList.appendChild(form);
                form.appendChild(li);
                li.appendChild(span);
            }
        }*/
    }
    overlay.style.display = 'flex';
}

// ユーザーの認証状態が変わるたびにcurrentUserにセット
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    console.log("auth state changed:", user);
});

// キャンセルボタン
document.querySelector('.cancel-button').addEventListener('click', () => {
    if(confirm("作成した予定は保存されません")){
        window.location.href = 'Calendar.html';
    }
});
// 保存ボタン
document.querySelector('.save-button').addEventListener('click', async () => {
    
    /*タイトル名未入力の際の警告*/
    const title = document.getElementById('event-title').value.trim();
    if (!title) {
        alert("タイトルを入力してください。");
        return; // 処理を中断
    }

    const allDay = document.getElementById('all-day-toggle').checked;
    let startDate = document.getElementById('start-date-box').value;
    let endDate = document.getElementById('end-date-box').value;
    if(!allDay){
        startDate += "T" + document.getElementById('start-time-box').value + ":00";
        
        endDate += "T" + document.getElementById('end-time-box').value + ":00";
    }

    const mochimonList = document.getElementsByClassName('mochimon');
    const itemList = [];
    for(const mochimon of mochimonList) {
        const item = {
            name: mochimon.textContent,
            isChecked: false
        }
        itemList.push(item);
    }
    try{
        //データ登録
        if (!currentUser) {
            alert("ログインしていません。もう一度お試しください。");
            return;
        }
        const docRef = await addDoc(collection(db, currentUser.uid), {
            tag: "Event",
            eventName: title,    //タイトル
            isAllDay: allDay,
            startDate: start,   //開始日時
            endDate: end,       //終了日時
            notify: notify,   //通知設定
            itemArray: itemList
        });
        
        alert("登録成功: ");
        window.location.href = 'Calendar.html';
    } catch(error){
        alert("登録に失敗しました: " + error.message);
        console.error("エラー", error);
    }     
});
//  持ち物リスト追加ボタン
document.getElementById('add-item-button').addEventListener('click', () => {
    storage();
    location.href = `ListCreate.html?date=${date}`;
});
//  終日トグル
document.getElementById('all-day-toggle').addEventListener('change', () => {
    const isAllDay = document.getElementById('all-day-toggle').checked;
    document.getElementById('start-time-box').style.display = isAllDay ? 'none' : 'inline-block';
    document.getElementById('end-time-box').style.display = isAllDay ? 'none' : 'inline-block';
});

document.getElementById('modal-back-button').addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.remove('active');
});


function calcNotifyTime(start, day, hour, minute){
    const loss = (((day * 24) + hour) * 60 + minute) * 60000;
    const time = new Date(start.getTime() - loss)
    return time;
}

function storage(){
    const notify = []

    const notifyList = document.querySelectorAll('.form-row.selected');
    for(const notifyTime of notifyList){
        console.log(notifyTime.id);
        notify.push(notifyTime.id);
    }
    console.log(notify);
    const storage = ([
        ["title", document.getElementById('event-title').value.trim()],
        ["allDay", document.getElementById('all-day-toggle').checked],
        ["endDate", document.getElementById('end-date-box').value ?? ""],
        ["startTime", document.getElementById('start-time-box').value ?? ""],
        ["endTime", document.getElementById('end-time-box').value ?? ""],
        ["notifyList", notify]
    ]);
    const JSONstorage = Array.from(storage);
    console.log(JSONstorage);
    localStorage.setItem(date, JSON.stringify(JSONstorage));
    localStorage.setItem('item', JSON.stringify(itemArray));
}