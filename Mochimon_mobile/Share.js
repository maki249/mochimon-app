import dayjs from "https://esm.sh/dayjs";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, addDoc, getDoc, getDocs, query, collection, doc, where, Timestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

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
    
    // 送られてきたリストの取得
    try{
        const shareListId = await getDocs(query(collection(db, "sharedEvents"), where("to", "==", user.email)));
        const shareListsData = shareListId.docs.map(doc => ({
            id: doc.id,
            ... doc.data()
        }));
        // リストの参照
        if(shareListsData.length > 0){
            const dashboard = document.getElementById('share-dashboard');
            for(const shareListData of shareListsData){
                const shareEvents = await getDoc(doc(db, shareListData.fromId, shareListData.list));
                console.log(shareEvents.data())
                
                // リストの表示
                const body = document.createElement('div');
                body.setAttribute('class', 'card-group');
                body.setAttribute('id', shareListData.fromId + '?' + shareListData.list);
                dashboard.appendChild(body);
                
                const title = document.createElement('span');
                title.setAttribute('class', 'owner-label');
                title.textContent = shareListData.from + 'さん';
                body.appendChild(title);

                const ref = document.createElement('a');
                body.appendChild(ref);

                const card = document.createElement('div');
                card.setAttribute('class', 'card');
                body.appendChild(card);
                
                const date = document.createElement('H2');
                const startDate = new Date(shareEvents.data().startDate.seconds *1000);
                date.textContent = dayjs(startDate).format('YYYY年MM月DD日');
                card.appendChild(date);

                const eventTitle = document.createElement('H2');
                eventTitle.textContent = shareEvents.data().eventName;
                card.appendChild(eventTitle);

                        
                body.addEventListener('click', () => {
                    // イベント情報を localStorage に保存
                    localStorage.setItem('selectedShredEvent', JSON.stringify({
                        id: shareEvents.data().id,
                        eventName: shareEvents.data().eventName,
                        startDate: shareEvents.data().startDate,
                        endDate: shareEvents.data().endDate,
                        isAllDay: shareEvents.data().isAllDay
                    }));

                    // EventEdit.html に遷移
                    window.location.href = "SelectDate.html";
                });
            }
            
            
        }
        
    }catch(error){
        console.log(error);
    }

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

    document.getElementById("submit-event").addEventListener("click", async () => {
        // 入力フォームは your-name と receiver-email だと思うので取得
        const yourName = document.getElementById("your-name").value.trim();
        const receiverEmail = document.getElementById("receiver-email").value.trim();

        if (!yourName || !receiverEmail || !selectedCard) {
            alert("名前・メール・予定を選択してください");
            return;
        }

        // Firebaseに送るデータを作成
        const sharedEventData = {
            from: yourName, // 送り主の名前
            fromId: user.uid, //送り主のユーザID
            to: receiverEmail, //宛先メールアドレス
            timestamp: new Date().toISOString(),
            isRead: false,
            list: selectedCard.id
        };
        const sharedEventsRef = collection(db, "sharedEvents");
        // Firebaseにデータ登録
        addDoc(sharedEventsRef, sharedEventData)
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

});