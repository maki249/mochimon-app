// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, addDoc, updateDoc, deleteDoc, collection, doc ,getDoc} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
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
const params = new URLSearchParams(window.location.search);
const eventId = params.get("eventId");
const date = params.get("date");

// ユーザーの認証状態が変わるたびにcurrentUserにセット
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    console.log("auth state changed:", user);
});

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.small-card');
    const useButton = document.getElementById('use-button');

    function updateButtonState() {
        const anySelected = document.querySelectorAll('.small-card.selected').length > 0;

        if (anySelected) {
            useButton.classList.add('active');
        } else {
            useButton.classList.remove('active');
        }
    }

    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('selected');
            updateButtonState();
        });
    });

    
    // 保存ボタン
    useButton.addEventListener('click', () => {
        alert('保存処理をここに追加');
    });
});
// キャンセルボタン
document.querySelector('.cancel-button').addEventListener('click', () => {
    if(!eventId){
        window.location.href = `ListCreate.html?date=${date}`;
    }else{
        window.location.href = `ListCreate.html?eventId=${eventId}`;
    }
});