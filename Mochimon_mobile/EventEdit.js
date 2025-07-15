import dayjs from "https://esm.sh/dayjs";
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";
import { getFirestore, addDoc, updateDoc, deleteDoc, collection, doc, getDocs, where, query, deleteField, Timestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
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
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;

// 現在の状態の保持
const strage = JSON.parse(localStorage.getItem('selectedEvent'));
console.log(strage);
document.getElementById('event-title').value = strage.eventName;
document.getElementById('all-day-toggle').checked = strage.isAllDay;
document.getElementById('start-time-box').style.display = strage.isAllDay ? 'none' : 'inline-block';
document.getElementById('end-time-box').style.display = strage.isAllDay ? 'none' : 'inline-block';

const startDate = new Date(strage.startDate.seconds * 1000);
const endDate = new Date(strage.endDate.seconds * 1000);
document.getElementById('start-date-box').value = dayjs(startDate).format("YYYY-MM-DD");
document.getElementById('start-time-box').value = dayjs(startDate).format("HH:mm");

document.getElementById('end-date-box').value = dayjs(endDate).format("YYYY-MM-DD");
document.getElementById('end-time-box').value = dayjs(endDate).format("HH:mm");

const notifyToggleArray = [];
for(const notifyTime of strage.notify){
    const dif = notifyTimeReplace(strage.startDate.seconds, notifyTime.seconds);
    notifyToggleArray.push(dif);
}
document.querySelectorAll(".notification-options .form-row").forEach(row => {
    const value = parseInt(row.dataset.value, 10);
    if (notifyToggleArray.includes(value)) {
        row.classList.add("selected");
    } else {
        row.classList.remove("selected");
    }
});

const itemList = document.createElement('div');
itemList.setAttribute('class', 'form-section');
itemList.setAttribute('id', 'item-list');
itemList.textContent = "持ち物";
const itemButton = document.getElementById('add-item-button');
itemButton.before(itemList);
strage.itemList.forEach(item =>{
    const form = document.createElement('div');
    form.setAttribute('class', 'form-row');
    const li = document.createElement('span');
    li.setAttribute('class', 'checkmark');
    li.textContent = '・';

    const span = document.createElement('span');
    span.textContent = item[1];
    span.setAttribute('id', item[0]);
    span.setAttribute('class', 'mochimon');
    itemList.appendChild(form);
    form.appendChild(li);
    li.appendChild(span);
})

// ユーザーの認証状態が変わるたびにcurrentUserにセット
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    console.log("auth state changed:", user);
    
    //持ち物の取得
    try{
        const getItem = await getDocs(query(collection(db, currentUser.uid), where("tag", "==", "item")));
        const items = getItem.docs.map(doc => ({
            id: doc.id,
            ... doc.data()
        }));

        //持ち物の表示
        if(items){
            const itemList = document.getElementById('item-list');
            items.forEach(item =>{
                if(item.unlisted == false){
                    const form = document.createElement('div');
                    form.setAttribute('class', 'form-row');
                    const li = document.createElement('span');
                    li.textContent = '・';
                    const span = document.createElement('span');
                    span.textContent = item.name;
                    span.setAttribute('id', item.id);
                    span.setAttribute('class', 'mochimon');
                    itemList.appendChild(form);
                    form.appendChild(li);
                    li.appendChild(span);
                }
            })
        }else console.log("item is null");

    }catch(error){
        console.log(error);
    }
});
// キャンセルボタン
document.querySelector('.cancel-button').addEventListener('click', () => {
    localStorage.removeItem('selectedEvent');
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
    const dict = {
        "0": calcNotifyTime(start,0, 0, 0),
        "5": calcNotifyTime(start, 0, 0, 5),
        "10": calcNotifyTime(start, 0, 0, 10),
        "15": calcNotifyTime(start, 0, 0, 15),
        "30": calcNotifyTime(start, 0, 0, 30),
        "60": calcNotifyTime(start, 0, 1, 0),
        "120": calcNotifyTime(start, 0, 2, 0),
        "180": calcNotifyTime(start, 0, 3, 0),
        "360": calcNotifyTime(start, 0, 6, 0),
        "1440": calcNotifyTime(start, 1, 0, 0),
    };
    //const notify = document.getElementById('notification-toggle').checked;
    const notify = [];
    for(const notifyElement of notifyList){
        const notifyTime = dict[notifyElement];
        notify.push(notifyTime);
    }
    const mochimonList = document.getElementsByClassName('mochimon');
    const idList = [];
    for(const itemId of mochimonList) {
        console.log(itemId.id);
        idList.push(itemId.id);
        await updateDoc(doc(db, currentUser.uid, itemId.id),{
                unlisted: true
        })
    }
    try{
        //データ登録
        if (!currentUser) {
            alert("ログインしていません。もう一度お試しください。");
            return;
        }
        console.log(idList);
        await updateDoc(doc(db, currentUser.uid, strage.id), {
            tag: "Event",
            eventName: title,    //タイトル
            isAllDay: allDay,
            startDate: start,   //開始日時
            endDate: end,       //終了日時
            notify: notify,   //通知設定
            itemList: idList //持ち物idの配列
        });
        
        alert("登録成功: ");
        localStorage.removeItem('selectedEvent');
        window.location.href = 'Calendar.html';
    } catch(error){
        alert("登録に失敗しました: " + error.message);
        console.error("エラー", error);
    }
});
//  持ち物リスト追加ボタン
document.getElementById('add-item-button').addEventListener('click', () => {
    localStorage.removeItem('selectedEvent');

    window.location.href = 'ListCreate.html';
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
        });
    });

});


function calcNotifyTime(start, day, hour, minute){
    const loss = (((day * 24) + hour) * 60 + minute) * 60000;
    const time = new Date(start.getTime() - loss)
    return time;
}

function notifyTimeReplace(startTime, notifyTime){
    const dif = startTime - notifyTime;
    return dif / 60;
}