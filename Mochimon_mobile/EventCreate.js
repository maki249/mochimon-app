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

const dataStrageJSON = localStorage.getItem(date);
const dataStrage = new Map(JSON.parse(dataStrageJSON));
console.log(dataStrage);
const itemArray = JSON.parse(localStorage.getItem('item'));
// 保存した情報の自動設定
window.onload = function(){
    const startDate = document.getElementById('start-date-box');
    startDate.value = date;
    
    if(dataStrage.size > 0){
        document.getElementById('event-title').value = dataStrage.get("title");

        document.getElementById('all-day-toggle').checked = dataStrage.get("allDay");
        document.getElementById('end-date-box').value = dataStrage.get("endDate");
        if(!dataStrage.allDay){
            document.getElementById('start-time-box').value = dataStrage.get("startTime");
            
            document.getElementById('end-time-box').value = dataStrage.get("endTime");
        }
        
        const notifyArray = document.getElementsByClassName('form-row');
        console.log(dataStrage.get("notifyList"));
        for(const notify of notifyArray){
            if(dataStrage.get("notifyList").includes(notify.id)){
                notify.classList.toggle('selected');
            }
        }

        const itemList = document.createElement('div');
        itemList.setAttribute('class', 'form-section');
        itemList.textContent = "持ち物";
        const itemButton = document.getElementById('add-item-button');
        itemButton.before(itemList);
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
        }
        const notifies = document.querySelectorAll('.form-row.selected');
        const preNotfyArea = document.getElementsByClassName('notifyList');
        while (preNotfyArea.length > 0){
            preNotfyArea[0].remove();
        }
        if(notifies){
            const arrow = document.getElementById('arrow');
            for(const notify of notifies){
                const notifyArea = document.createElement('span');
                notifyArea.textContent = notify.id + " ";
                notifyArea.setAttribute('class', 'notifyList');
                arrow.appendChild(notifyArea);
            }
        }
    }
    localStorage.clear();
}

// ユーザーの認証状態が変わるたびにcurrentUserにセット
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    console.log("auth state changed:", user);
});

// キャンセルボタン
document.querySelector('.cancel-button').addEventListener('click', () => {
    window.location.href = 'Calendar.html';
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
    
    const notifyList = Array.from(document.querySelectorAll('.form-row.selected'))
                                .map(row => row.dataset.value);
    const start = new Date(startDate)
    const end = new Date(endDate)
    console.log("sss"+start);
    const dict = {
        "予定時間": calcNotifyTime(start,0, 0, 0),
        "5分前": calcNotifyTime(start, 0, 0, 5),
        "10分前": calcNotifyTime(start, 0, 0, 10),
        "15分前": calcNotifyTime(start, 0, 0, 15),
        "30分前": calcNotifyTime(start, 0, 0, 30),
        "1時間前": calcNotifyTime(start, 0, 1, 0),
        "2時間前": calcNotifyTime(start, 0, 2, 0),
        "3時間前": calcNotifyTime(start, 0, 3, 0),
        "6時間前": calcNotifyTime(start, 0, 6, 0),
        "1日前": calcNotifyTime(start, 1, 0, 0),
    };
    //const notify = document.getElementById('notification-toggle').checked;
    const notify = [];
    console.log("notifyList:" + notifyList);
    for(const notifyElement of notifyList){
        console.log(notifyElement);
        console.log(dict[notifyElement] + "aaa");
        const notifyTime = dict[notifyElement];
        console.log(notifyTime);
        notify.push(notifyTime);
    }
    console.log(notify);

    console.log(currentUser.uid)
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
        });
        
        const docID = docRef.id
        alert("登録成功: ");
        window.location.href = 'Calendar.html';
    } catch(error){
        alert("登録に失敗しました: " + error.message);
        console.error("エラー", error);
    }     
});
//  持ち物リスト追加ボタン
document.getElementById('add-item-button').addEventListener('click', () => {
    if(confirm()){
        storage();
        location.href = `ListCreate.html?date=${date}`;
    }
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

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.notification-row').addEventListener('click', () => {
        document.getElementById('modal-overlay').classList.add('active');
    });
    document.querySelectorAll('.notification-options .form-row').forEach(row => {
        row.addEventListener('click', () => {
            row.classList.toggle('selected');
            const notifies = document.querySelectorAll('.form-row.selected');
            const preNotfyArea = document.getElementsByClassName('notifyList');
            while (preNotfyArea.length > 0){
                preNotfyArea[0].remove();
            }
            if(notifies){
                const arrow = document.getElementById('arrow');
                for(const notify of notifies){
                    const notifyArea = document.createElement('span');
                    notifyArea.textContent = notify.id + " ";
                    notifyArea.setAttribute('class', 'notifyList');
                    arrow.appendChild(notifyArea);
                }
            }
        });
    });
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
}