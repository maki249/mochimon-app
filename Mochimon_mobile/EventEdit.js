// --- Firebase 初期化 ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, doc, addDoc, getDoc, updateDoc, deleteDoc, Timestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyChPt5NDvgd4okxbUQalZtrS7w6Tm30fgg",
  authDomain: "mochimon-base.firebaseapp.com",
  projectId: "mochimon-base",
  storageBucket: "mochimon-base.appspot.com",
  messagingSenderId: "5202457046",
  appId: "1:5202457046:web:7233c6b556a7d260803477",
  measurementId: "G-GPT541EW6S"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// URL から eventId を取得
const params  = new URLSearchParams(window.location.search);
const eventId = params.get("eventId");
let currentItemList = []; // グローバルで定義

// --- 持ち物リスト描画 ---
function renderItemList() {
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

// --- イベントデータの読み込み ---
async function loadEventData(user) {
  const ref = doc(db, user.uid, eventId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("該当のイベントが見つかりません");
    return;
  }

  const data = snap.data();
  console.log("✅ イベントデータ:", data);
  currentItemList = data.itemArray || [];
  const itemArray = JSON.parse(localStorage.getItem('item')) || [];
  if(itemArray.length > 0){
    console.log(itemArray);
    currentItemList.length = 0;
    itemArray.forEach(item =>{
      currentItemList.push({
        name: item,
        isChecked: false
    });
    })
  }
  console.log(currentItemList);
  renderItemList();

  // フォームへ反映
  document.getElementById("event-title").value = data.eventName || "";
  document.getElementById("all-day-toggle").checked = !!data.isAllDay;
  if(data.isAllDay){
    document.getElementById("start-time-box").style.display = 'none';
    document.getElementById("end-time-box").style.display = 'none';
  }

  if (data.startDate) {
    const start = data.startDate.toDate();
    document.getElementById("start-date-box").value = start.toISOString().slice(0, 10);
    document.getElementById("start-time-box").value = start.toTimeString().slice(0, 5);
  }

  if (data.endDate) {
    const end = data.endDate.toDate();
    document.getElementById("end-date-box").value = end.toISOString().slice(0, 10);
    document.getElementById("end-time-box").value = end.toTimeString().slice(0, 5);
  }

  
  

  document.querySelector(".copy-button").addEventListener("click", async () => {
    const user = auth.currentUser;
    if(!user) return alert("再度ログインしてください");
    if(confirm("この予定をコピーしますか？")){
      try{
        await addDoc(collection(db, user.uid), {
            tag: "Event",
            eventName: snap.data().eventName + "+",
            isAllDay: snap.data().isAllDay,
            startDate: snap.data().startDate,
            endDate: snap.data().endDate,
            notify: snap.data().notify,
            itemArray: snap.data().itemArray
        });
        alert("予定をコピーしました");
        window.location.href = "Calendar.html"; 
      }catch (e){

      }
    }

  });
}

// --- ログイン後処理 ---
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("ログインしてください");
    location.href = "Login.html";
    return;
  }
  if (!eventId) {
    alert("eventId が指定されていません");
    location.href = "home.html";
    return;
  }
  loadEventData(user);
});

// --- DOM 準備完了後 ---
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".save-button").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return alert("再度ログインしてください");

    const title  = document.getElementById("event-title").value;
    const allDay = document.getElementById("all-day-toggle").checked;
    const sd     = document.getElementById("start-date-box").value;
    const st     = document.getElementById("start-time-box").value;
    const ed     = document.getElementById("end-date-box").value;
    const et     = document.getElementById("end-time-box").value;

    const start = new Date(`${sd}T${st}`);
    const end   = new Date(`${ed}T${et}`);

    // 持ち物リストをDOMから取得して配列作成
    const mochimonItems = document.querySelectorAll("#checklist li span.mochimon");
    const itemArray = [];

    mochimonItems.forEach(mochimon => {
      itemArray.push({
        name: mochimon.textContent.trim(),
        isChecked: false,  // チェックボックス連動があればここで取得
      });
    });

    const ref = doc(db, user.uid, eventId);
    await updateDoc(ref, {
      eventName: title,
      isAllDay:  allDay,
      startDate: Timestamp.fromDate(start),
      endDate:   Timestamp.fromDate(end),
      tag:       "Event",
      itemArray: itemArray
    });

    alert("保存しました");
    window.location.href = "Calendar.html";
  });

  // アイテム追加
  document.getElementById("add-item-button").addEventListener("click", () => {
    storage();
    location.href = `ListCreate.html?eventId=${eventId}`;
  });

  // 終日切り替え
  document.getElementById("all-day-toggle").addEventListener("change", () => {
    const isAllDay = document.getElementById("all-day-toggle").checked;
    document.getElementById("start-time-box").style.display = isAllDay ? "none" : "inline-block";
    document.getElementById("end-time-box").style.display = isAllDay ? "none" : "inline-block";
  });

  // モーダル操作
  document.getElementById("modal-back-button").addEventListener("click", () => {
    document.getElementById("modal-overlay").classList.remove("active");
  });


  // キャンセル・削除
  document.querySelector(".cancel-button").addEventListener("click", () => {
    location.href = "Calendar.html";
  });

  document.querySelector(".delete-button").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return alert("再度ログインしてください");

    const confirmed = confirm("この予定を削除しますか？");
    if (!confirmed) return;
    try {
        const ref = doc(db,  user.uid, eventId);
        await deleteDoc(ref);
        alert("予定を削除しました");
        location.href = "Calendar.html"; 

    } catch (error) {
      console.error("削除に失敗:", error);
      alert("削除に失敗しました");
    }
  });
});

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
    localStorage.setItem(eventId, JSON.stringify(JSONstorage));
    const itemArray = [];
    currentItemList.forEach(item => {
      itemArray.push(item.name);
    })
    localStorage.setItem('item', JSON.stringify(itemArray));
}