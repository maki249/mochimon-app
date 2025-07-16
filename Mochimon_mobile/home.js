import dayjs from "https://esm.sh/dayjs";

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, collection, doc, getDocs, where, query, deleteField, Timestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
    
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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const iconBtn = document.getElementById("user-icon-btn");
const db = getFirestore(app);
let currentUser = null;


// ユーザーの認証状態が変わるたびにcurrentUserにセット
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    console.log("Auth state changed:", user);
    //持ち物の取得
    try{
        const getList = await getDocs(query(collection(db, "users", user.uid, "events"), where("tag", "==", "Event")));
        const items = getList.docs.map(doc => ({
            id: doc.id,
            ... doc.data()
        }));

        //持ち物の表示
        const dashBoard = document.getElementById('dashboard');
        const itemList = document.createElement('a');
        dashBoard.appendChild(itemList);

        items.forEach(item =>{
            console.log(item);
            const itemCard = document.createElement('div');
            itemCard.setAttribute('class', 'card');
            itemCard.setAttribute('id', item.id);

            const eventTitle = document.createElement('h2');
            eventTitle.textContent = item.eventName;

            const startDate = new Date(item.startDate.seconds * 1000);
            const endDate = new Date(item.endDate.seconds * 1000);

            let start;
            let end;
            if(item.isAllDay){
                if(dayjs(startDate).format("YYYY年MM月DD日") === dayjs(endDate).format("YYYY年MM月DD日")){
                    start = dayjs(startDate).format("YYYY年MM月DD日")
                    end = "終日"
                }else{
                    start = dayjs(startDate).format("YYYY年MM月DD日")
                    end = dayjs(endDate).format("~ YYYY年MM月DD日")
                }
            }else{
                if(dayjs(startDate).format("YYYY年MM月DD日") === dayjs(endDate).format("YYYY年MM月DD日")){
                    start = dayjs(startDate).format("YYYY年MM月DD日 HH時mm分")
                    end = dayjs(endDate).format("~ HH時mm分")
                }else{
                    start = dayjs(startDate).format("YYYY年MM月DD日 HH時mm分")
                    end = dayjs(endDate).format("~ YYYY年MM月DD日 HH時mm分")
                }
            }
            
            const p1 = document.createElement('p');
            const p2 = document.createElement('p');
            p1.textContent = start;
            p2.textContent = end;

            itemList.appendChild(itemCard);
            itemCard.appendChild(eventTitle);
            itemCard.appendChild(p1);
            itemCard.appendChild(p2);

            itemCard.addEventListener('click', () => {
            // イベント情報を localStorage に保存
            localStorage.setItem('selectedEvent', JSON.stringify({
                id: item.id,
                eventName: item.eventName,
                startDate: item.startDate,
                endDate: item.endDate,
                isAllDay: item.isAllDay
            }));

            // EventEdit.html に遷移
            window.location.href = `EventEdit.html?eventId=${item.id}`;
        });

            
        })

    }catch(error){
        console.log(error);
    }
});

if (iconBtn) {
    iconBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        console.log("Clicked. currentUser:", currentUser);
        if (currentUser) {
        console.log("認証済みなのでマイページへ遷移");
        window.location.href = "../Mypage.html";
        } else {
        console.log("未認証なのでログインへ遷移");
        window.location.href = "../Login.html";
        }
    });
}

