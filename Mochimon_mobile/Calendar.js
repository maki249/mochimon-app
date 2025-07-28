// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, getDocs} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
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
// ユーザーの認証状態が変わるたびにcurrentUserにセット
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    console.log("auth state changed:", user);
});

document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    let selectedDateStr = null;

    let calendar;

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            alert("ログインしてください");
            return;
        }

        // ユーザーIDを使って、そのユーザーのイベントをFirestoreから取得
        // 例：Firestoreでコレクション名をユーザーUIDにしている場合
        const eventsCol = collection(db, user.uid);
        const snapshot = await getDocs(eventsCol);

        const events = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // "tag" が "Event" のドキュメントだけをイベントとして追加（EventCreate.htmlに合わせて）
            if (data.tag === "Event") {
                events.push({
                    id: doc.id,
                    title: data.eventName || "予定なし",
                    start: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
                    end: data.endDate?.toDate ? data.endDate.toDate() : data.endDate,
                    allDay: data.isAllDay || false,
                });
            }
        });

        if (calendar) {
            calendar.destroy();
        }

        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev',
                center: 'title',
                right: 'next'
            },
            locale: 'ja',
            events: events,
            dateClick: function(info) {
                document.querySelectorAll('.fc-day').forEach(el => el.classList.remove('selected-date'));
                info.dayEl.classList.add('selected-date');
                selectedDateStr = info.dateStr;
            },
            eventClick: function (info) {
                // クリックした予定のIDを取得
                const eventId = info.event.id;
                // EventEdit.html に eventId を渡して遷移
                window.location.href = `EventEdit.html?eventId=${eventId}`;
            }
        });

        calendar.render();

        document.getElementById("add-event-btn").addEventListener("click", () => {
            // 日付が未選択の場合は今日を使う
            const date = selectedDateStr || new Date().toISOString().split('T')[0];
            window.location.href = `EventCreate.html?date=${date}`;
        });
    });
});
