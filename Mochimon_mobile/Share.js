import dayjs from "https://esm.sh/dayjs";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, getDocs, query, collection, where, Timestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;

// ユーザーの認証状態が変わるたびにcurrentUserにセット
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    console.log("Auth state changed:", user);
    
    // 現在以降の予定の取得
    try{
        const nowDate = Timestamp.now();
        const getList = await getDocs(query(collection(db, user.uid), where("tag" , "==", "Event")));
        console.log(getList);
        const dashBoard = document.getElementById('dashboard');
        getList.forEach(doc => {
                if(doc.data().startDate >= nowDate){
                const card = document.createElement('div');
                card.setAttribute('class', 'overlay-card');
                card.setAttribute('id', doc.id);
                const title = document.createElement('h2');
                title.textContent = doc.data().eventName;
                
                const date = document.createElement('p');
                const time = document.createElement('p');
                const start = new Date(doc.data().startDate.seconds * 1000);
                const end = new Date(doc.data().endDate.seconds * 1000);
                if(start.toISOString().split('T')[0] == end.toISOString().split('T')[0]){
                    date.textContent = dayjs(start).format("YYYY年MM月DD日")
                    if(doc.data().isAllday){
                        time.textContent = "終日";
                    }else{
                        time.textContent = dayjs(start).format("HH:mm")
                                            + " ~ " + 
                                            dayjs(end).format("HH:mm")
                    }
                }else{
                    if(doc.data().isAllday){
                        date.textContent = dayjs(start).format("YYYY年MM月DD日") + " 終日";
                        time.textContent = "~ " + dayjs(end).format("YYYY年MM月DD日 HH:mm") + " 終日";
                        
                    }else{
                        date.textContent = dayjs(start).format("YYYY年MM月DD日 HH:mm");
                        time.textContent = "~ " + dayjs(end).format("YYYY年MM月DD日 HH:mm");
                    }
                }
                card.appendChild(title);
                card.appendChild(date);
                card.appendChild(time)
                dashBoard.appendChild(card);
            }
        })
    }catch(error){
        console.log(error);
    }
});

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
