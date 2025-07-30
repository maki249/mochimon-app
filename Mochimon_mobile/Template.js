import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, setDoc, getDocs, doc, getDoc, where, query } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

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
const auth = getAuth(app);

const iconBtn = document.getElementById("user-icon-btn");
let currentUser = null;

const addButton = document.getElementById("add-event-btn");
const modal = document.getElementById("template-modal");
const closeBtn = document.getElementById("close-modal");

// ＋ボタン押下時、モーダル表示
addButton.addEventListener("click", (e) => {
  e.preventDefault(); // aタグのリンクを無効化
  modal.style.display = "flex"; // ← block → flex に修正
});

// モーダル外クリックで閉じる
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// ✕ボタンで閉じる（存在チェックも追加）
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
}

document.getElementById("create-template-btn").addEventListener("click", () => {
    const input = document.getElementById("template-name").value.trim();
    if (input) {
      // URLにテンプレート名をクエリパラメータで渡す
      location.href = `EditTemplate.html?name=${encodeURIComponent(input)}`;
    } else {
      alert("テンプレート名を入力してください");
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

// ユーザーの認証状態が変わるたびにcurrentUserにセット
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    console.log("auth state changed:", user);
    
    //持ち物の取得
    try{
        const tempList = await getDocs(query(collection(db, user.uid), where("tag", "==", "templateList")));
        
        if(tempList.empty){
            // テンプレートリストをデータベースへ追加
            await setDoc(doc(db, user.uid, "child"),{
                tag: "templateList",
                title: "赤ちゃん",
                item: [
                    {
                        name: "タオル",
                        isChecked: false
                    },
                    {
                        name: "ウェットシート",
                        isChecked: false
                    }
                ]
            })
            await setDoc(doc(db, user.uid, "plane"),{
                tag: "templateList",
                title: "飛行機",
                item: [
                    {
                        name: "耳栓",
                        isChecked: false
                    },
                    {
                        name: "ウェットシート",
                        isChecked: false
                    }
                ]
            })
            await setDoc(doc(db, user.uid, "sport"),{
                tag: "templateList",
                title: "スポーツ",
                item: [
                    {
                        name: "タオル",
                        isChecked: false
                    },
                    {
                        name: "スポーツウェア",
                        isChecked: false
                    }
                ]
            })
            await setDoc(doc(db, user.uid, "ocean"),{
                tag: "templateList",
                title: "海",
                item: [
                    {
                        name: "タオル",
                        isChecked: false
                    },
                    {
                        name: "サンダル",
                        isChecked: false
                    },
                    {
                        name: "日焼け止め",
                        isChecked: false
                    }
                ]
            })
            await setDoc(doc(db, user.uid, "climb"),{
                tag: "templateList",
                title: "登山",
                item: [
                    {
                        name: "登山靴",
                        isChecked: false
                    },
                    {
                        name: "登山ジャケット",
                        isChecked: false
                    },
                    {
                        name: "ポリ袋",
                        isChecked: false
                    }
                ]
            })
            await setDoc(doc(db, user.uid, "camp"),{
                tag: "templateList",
                title: "キャンプ",
                item: [
                    {
                        name: "テント",
                        isChecked: false
                    },
                    {
                        name: "寝袋",
                        isChecked: false
                    },
                    {
                        name: "折り畳み椅子",
                        isChecked: false
                    }
                ]
            })
            await setDoc(doc(db, user.uid, "picnic"),{
                tag: "templateList",
                title: "ピクニック",
                item: [
                    {
                        name: "レジャーシート",
                        isChecked: false
                    },
                    {
                        name: "弁当",
                        isChecked: false
                    },
                    {
                        name: "日焼け止め",
                        isChecked: false
                    }
                ]
            })
            await setDoc(doc(db, user.uid, "park"),{
                tag: "templateList",
                title: "遊園地",
                item: [
                    {
                        name: "年間パスポート",
                        isChecked: false
                    },
                    {
                        name: "日焼け止め",
                        isChecked: false
                    }
                ]
            })
            await setDoc(doc(db, user.uid, "festival"),{
                tag: "templateList",
                title: "祭り",
                item: [
                    {
                        name: "",
                        isChecked: false
                    },
                ]
            })
            await setDoc(doc(db, user.uid, "spring"),{
                tag: "templateList",
                title: "温泉",
                item: [
                    {
                        name: "タオル",
                        isChecked: false
                    }
                ]
            })
        }else{
            tempList.forEach((doc) => {
                doc
            });
        }
    }catch(error){
        console.log(error);
    }
    const tempcards = document.getElementsByClassName("small-card");
    for(const temp of tempcards){
        temp.addEventListener('click', (e) => {
                e.stopPropagation(); // カード本体クリック
                window.location.href = `EditTemplate.html?TempId=${temp.id}`;
        });
    }
});
