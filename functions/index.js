const {initializeApp} = require("firebase-admin/app");
const {getFirestore, Timestamp} = require("firebase-admin/firestore");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {getMessaging} = require("firebase-admin/messaging");

initializeApp();

exports.sendNotification = onSchedule("every 1 minutes", async (event) => {
  const db = getFirestore();
  const now = Timestamp.now(); // Firestoreの現在時刻Timestamp
  const oneMinuteAgo = Timestamp.fromDate(new Date(Date.now() - 60000)); // 1分前のTimestamp

  const usersSnapshot = await db.collection("users").get();

  for (const userDoc of usersSnapshot.docs) {
    const {fcmToken} = userDoc.data();
    const eventsRef = db.collection(userDoc.id);

    const snapshot = await db
    .collectionGroup("events")
    .where("userId", "==", userDoc.id)  // 必要なら追加
    .where("tag", "==", "Event")
    .where("startDate", ">=", oneMinuteAgo)
    .where("startDate", "<=", now)
    .orderBy("startDate")
    .get();

    if (fcmToken) {
      if (!snapshot.empty) {
        // 予定あり通知
        await getMessaging().send({
          token: fcmToken,
          notification: {
            title: "予定の時間です！",
            body: snapshot.docs[0].data().eventName || "予定があります",
          },
        });
        console.log(`通知送信: ${userDoc.id} - 予定あり`);
      } else {
        // 予定なし通知
        await getMessaging().send({
          token: fcmToken,
          notification: {
            title: "予定通知",
            body: "今のところ予定はありません！",
          },
        });
        console.log(`通知送信: ${userDoc.id} - 予定なし`);
      }
    }
  }

  return null;
});
