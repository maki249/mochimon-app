
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
async function addEvent(name,start,end,isNotify){
    try{
        //データ登録
        const docRef = await addDoc(collection(db, user.uid), {
            eventName: name,    //タイトル
            startDate: start,   //開始日時
            endDate: end,       //終了日時
            notify: isNotify,   //通知設定
        });
        const docID = docRef.id
        alert("登録成功: ");
        return docID
    } catch(e){
        alert("登録に失敗しました: " + error.message);
        console.error("エラー", error);
    }
}

async function updateEvent(date, id, docID){
    try{
        //データ更新
        await updateDoc(collection(db, user.uid, docID), {
            Name: listName,
            IsDone: isDone,
            docID: id           //持ち物リスト参照
        })
    } catch(e){
        alert("更新に失敗しました: " + error.message);
        console.error("エラー", error);
    }
}

async function deleteData(docID){
    try{
        //データ削除
        await deleteDoc(collection(db, user.uid, docID))
    } catch(e){
        alert("更新に失敗しました: " + error.message);
        console.error("エラー", error);
    }
}
