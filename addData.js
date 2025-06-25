import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, addDoc, collection } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
async function addData(listName){
    const firebaseConfig = {
        apiKey: "AIzaSyChPt5NDvgd4okxbUQalZtrS7w6Tm30fgg",
        authDomain: "mochimon-base.firebaseapp.com",
        projectId: "mochimon-base",
        storageBucket: "mochimon-base.firebasestorage.app",
        messagingSenderId: "5202457046",
        appId: "1:5202457046:web:7233c6b556a7d260803477",
        measurementId: "G-GPT541EW6S"
    };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const user = getAuth(app).currentUser();

    try{
        //データ登録
        const docRef = await addDoc(collection(db, user.uid), {
            name: listName,
            isDone: false,  //準備完了フラグ
            userId: user.uid//userIDの登録
        });
    } catch(e){
        alert("登録に失敗しました: " + error.message);
        console.error("エラー", error);
    }
}
