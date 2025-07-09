const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {getMessaging} = require("firebase-admin/messaging");

initializeApp();

const admin = require("firebase-admin");

exports.sendNotification = onSchedule("every 1 minutes", async (event) => {
  const db = getFirestore();
  const now = admin.firestore.Timestamp.now();
  const oneMinuteLater = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 60 * 1000));

  const usersSnapshot = await db.collection("users").get();

  for (const userDoc of usersSnapshot.docs) {
    const {fcmToken} = userDoc.data();
    if (!fcmToken) continue;

    const snapshot = await db
        .collection("users")
        .doc(userDoc.id)
        .collection("events")
        .where("tag", "==", "Event")
        .where("startDate", ">=", now)
        .where("startDate", "<=", oneMinuteLater)
        .get();

    if (!snapshot.empty) {
      const firstEvent = snapshot.docs[0].data();
      await getMessaging().send({
        token: fcmToken,
        notification: {
          title: "予定の時間です！",
          body: firstEvent.eventName || "予定があります",
        },
      });
      console.log(`通知送信: ${userDoc.id}`);
    } else {
      console.log(`通知なし: ${userDoc.id}`);
    }
  }

  return null;
});
