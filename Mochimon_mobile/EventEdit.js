// --- Firebase 初期化 ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, Timestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

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
      <span>${item.name}</span>
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

  currentItemList = data.itemList || [];
  renderItemList();

  // フォームへ反映
  document.getElementById("event-title").value = data.eventName || "";
  document.getElementById("all-day-toggle").checked = !!data.isAllDay;

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

    const ref = doc(db, user.uid, eventId);
    await updateDoc(ref, {
      eventName: title,
      isAllDay:  allDay,
      startDate: Timestamp.fromDate(start),
      endDate:   Timestamp.fromDate(end),
      tag:       "Event",
      itemList:  currentItemList
    });

    alert("保存しました");
    window.location.href = "Calendar.html";
  });

  // アイテム追加
  document.getElementById("add-item-button").addEventListener("click", () => {
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

  document.querySelector(".notification-row").addEventListener("click", () => {
    document.getElementById("modal-overlay").classList.add("active");
  });

  document.querySelectorAll(".notification-options .form-row").forEach(row => {
    row.addEventListener("click", () => row.classList.toggle("selected"));
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
<<<<<<< HEAD
        const ref = doc(db,  user.uid, eventId);
        await deleteDoc(ref);
        alert("予定を削除しました");
        location.href = "Calendar.html";  // 削除後に戻るページ
=======
      const ref = doc(db, user.uid, eventId);
      await deleteDoc(ref);
      alert("予定を削除しました");
      location.href = "Calendar.html";
>>>>>>> 6480ae5a1989fc8bcac164185f1deb08aae90420
    } catch (error) {
      console.error("削除に失敗:", error);
      alert("削除に失敗しました");
    }
  });
});
