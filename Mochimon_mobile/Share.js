import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase設定（apiKeyは実際のものに置き換えてください）
const firebaseConfig = {
    databaseURL: "https://mochimon-base-default-rtdb.asia-southeast1.firebasedatabase.app/",
    apiKey: "AIzaSyChPt5NDvgd4okxbUQalZtrS7w6Tm30fgg",
    authDomain: "mochimon-base.firebaseapp.com",
    projectId: "mochimon-base",
    storageBucket: "mochimon-base.firebasestorage.app",
    messagingSenderId: "5202457046",
    appId: "1:5202457046:web:7233c6b556a7d260803477",
    measurementId: "G-GPT541EW6S"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.getElementById("add-event-btn").addEventListener("click", () => {
    document.getElementById("modal-overlay").style.display = "flex";
});

document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("modal-overlay").style.display = "none";
});

// 予定カードの選択処理
const overlayCards = document.querySelectorAll('.overlay-card');
let selectedCard = null;

overlayCards.forEach(card => {
    card.addEventListener('click', (e) => {
        e.preventDefault();

        if (selectedCard) {
            selectedCard.classList.remove('selected');
        }

        card.classList.add('selected');
        selectedCard = card;
    });
});

document.getElementById("submit-event").addEventListener("click", () => {
    // 入力フォームは your-name と receiver-email だと思うので取得
    const yourName = document.getElementById("your-name").value.trim();
    const receiverEmail = document.getElementById("receiver-email").value.trim();

    if (!yourName || !receiverEmail || !selectedCard) {
        alert("名前・メール・予定を選択してください");
        return;
    }

    // 選択されたカードの情報取得
    const eventTitle = selectedCard.querySelector("h2")?.textContent || "";
    const eventDate = selectedCard.querySelectorAll("p")[0]?.textContent || "";
    const eventTime = selectedCard.querySelectorAll("p")[1]?.textContent || "";

    // Firebaseに送るデータを作成
    const sharedEventData = {
        from: yourName,
        to: receiverEmail,
        title: eventTitle,
        date: eventDate,
        time: eventTime,
        timestamp: new Date().toISOString()
    };

    const sharedEventsRef = ref(db, "sharedEvents");

    // Firebaseにデータ登録
    push(sharedEventsRef, sharedEventData)
        .then(() => {
            alert("予定を共有しました！");
            // モーダル閉じてフォームや選択リセット
            document.getElementById("modal-overlay").style.display = "none";
            document.getElementById("your-name").value = "";
            document.getElementById("receiver-email").value = "";
            if (selectedCard) selectedCard.classList.remove('selected');
            selectedCard = null;
        })
        .catch((error) => {
            console.error("保存エラー:", error);
            alert("共有に失敗しました");
        });
});
