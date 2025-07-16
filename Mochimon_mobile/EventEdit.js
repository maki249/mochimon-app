import dayjs from "https://esm.sh/dayjs";

// --- Firebase の読み込み（CDN を使う場合は firebaseConfig.js ではなくここで初期化してください） ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc,Timestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
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

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// URL から eventId を取得
const params  = new URLSearchParams(window.location.search);
const eventId = params.get("eventId");

// Firestore から読み込んでフォームに反映する関数
async function loadEventData(user) {
  const ref     = doc(db, user.uid, eventId);
  const snap    = await getDoc(ref);
  console.log("🔎 getDoc 結果 exists =", snap.exists());
  if (!snap.exists()) {
    alert("該当のイベントが見つかりません");
    return;
  }
  const data = snap.data();
  console.log("✅ イベントデータ:", snap.data());
  // タイトル
  document.getElementById("event-title").value = data.eventName || "";

  // 終日
  document.getElementById("all-day-toggle").checked = !!data.isAllDay;

  // 開始日時
  if (data.startDate) {
    const start = data.startDate.toDate();
    document.getElementById("start-date-box").value = start.toISOString().slice(0, 10);
    document.getElementById("start-time-box").value = start.toTimeString().slice(0, 5);
  }
  // 終了日時
  if (data.endDate) {
    const end = data.endDate.toDate();
    document.getElementById("end-date-box").value = end.toISOString().slice(0, 10);
    document.getElementById("end-time-box").value = end.toTimeString().slice(0, 5);
  }

  // 通知
  if (data.notify) {
    const notifyToggleArray = [];
     for(const notifyTime of data.notify){
        const dif = (data.startDate.seconds - notifyTime.seconds) / 60;
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
  }
}

// 認証が確定したらデータを読み込む
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

document.addEventListener("DOMContentLoaded", () => {
  // 保存ボタン
  document.querySelector(".save-button").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return alert("再度ログインしてください");

    // フォーム値を取得
    const title   = document.getElementById("event-title").value;
    const allDay  = document.getElementById("all-day-toggle").checked;
    const sd      = document.getElementById("start-date-box").value;
    const st      = document.getElementById("start-time-box").value;
    const ed      = document.getElementById("end-date-box").value;
    const et      = document.getElementById("end-time-box").value;

    // Date に変換
    const start = new Date(`${sd}T${st}`);
    const end   = new Date(`${ed}T${et}`);

    // 更新
    const ref = doc(db, user.uid, eventId);
    await updateDoc(ref, {
      eventName: title,
      isAllDay:  allDay,
      startDate: Timestamp.fromDate(start),
      endDate:   Timestamp.fromDate(end),
      tag:       "Event"
    });
    alert("保存しました");
  });

  // 持ち物リスト追加ボタン
  document.getElementById("add-item-button").addEventListener("click", () => {
    location.href = "ListCreate.html";
  });

  // 終日トグル
  document.getElementById("all-day-toggle").addEventListener("change", () => {
    const isAllDay = document.getElementById("all-day-toggle").checked;
    document.getElementById("start-time-box").style.display = isAllDay ? "none" : "inline-block";
    document.getElementById("end-time-box").style.display   = isAllDay ? "none" : "inline-block";
  });

  // モーダル戻るボタン
  document.getElementById("modal-back-button").addEventListener("click", () => {
    document.getElementById("modal-overlay").classList.remove("active");
  });

  // 通知モーダルの表示
  document.querySelector(".notification-row").addEventListener("click", () => {
    document.getElementById("modal-overlay").classList.add("active");
  });

  // 通知オプションの選択
  document.querySelectorAll(".notification-options .form-row").forEach(row => {
    row.addEventListener("click", () => {
      row.classList.toggle("selected");
      const notifies = Array.from(document.querySelectorAll('.form-row.selected'))
                          .map(row => row.dataset.value);
      const preNotifyArea = document.getElementsByClassName('notifyList');
      while (preNotifyArea.length > 0){
          preNotifyArea[0].remove();
      }
      if(notifies){
          const arrow = document.getElementById('arrow');
          for(const notify of notifies){
              const notifyArea = document.createElement('span');
              notifyArea.textContent = notify + " ";
              notifyArea.setAttribute('class', 'notifyList');
              arrow.appendChild(notifyArea);
          }
      }
    });
  });

  // キャンセルボタン
  document.querySelector(".cancel-button").addEventListener("click", () => {
        location.href = "Calendar.html";
    });
  
  document.querySelector(".delete-button").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("再度ログインしてください");
  if (!eventId) return alert("eventIdがありません");

  const confirmed = confirm("この予定を本当に削除しますか？");
  if (!confirmed) return;

  try {
      const ref = doc(db, user.uid, eventId);
      await deleteDoc(ref);
      alert("予定を削除しました");
      location.href = "Calendar.html";  // 削除後に戻るページ
  } catch (error) {
      console.error("削除に失敗しました:", error);
      alert("削除に失敗しました");
  }
  });

});