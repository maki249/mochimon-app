import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, addDoc, updateDoc, deleteDoc, collection } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
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
async function addData(listName){
    try{
        //データ登録
        const docRef = await addDoc(collection(db, user.uid), {
            Name: listName,
            IsDone: false,  //準備完了フラグ
            UserId: user.uid//userIDの登録
        });
        const docID = docRef.id
    } catch(e){
        alert("登録に失敗しました: " + error.message);
        console.error("エラー", error);
    }
}

async function updateData(listName, isDone, docID){
    try{
        await updateDoc(collection(db, user.uid, docID), {
            Name: listName,
            IsDone: isDone
        })
    } catch(e){
        alert("更新に失敗しました: " + error.message);
        console.error("エラー", error);
    }
}

async function deleteData(docID){
    try{
        await deleteDoc(collection(db, user.uid, docID))
    } catch(e){
        alert("更新に失敗しました: " + error.message);
        console.error("エラー", error);
    }
}
