const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// Notification for new messages
exports.sendChatNotification = functions.firestore
  .document("chatrooms/{roomId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const roomId = context.params.roomId;
    const roomDoc = await db.collection("chatrooms").doc(roomId).get();
    
    if (!roomDoc.exists) return;
    
    const roomData = roomDoc.data();
    const participants = roomData.participantIds;
    const recipients = participants.filter(id => id !== message.senderId);
    
    if (recipients.length === 0) return;

    // Get FCM tokens
    const tokens = [];
    for (const userId of recipients) {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists && userDoc.data().fcmToken) {
            tokens.push(userDoc.data().fcmToken);
        }
    }

    if (tokens.length === 0) return;
    
    let notificationTitle = message.senderName;
    if (roomData.type === 'group') {
        notificationTitle = `${message.senderName} (${roomData.title})`;
    }

    let body = "새 메시지";
    if (message.text) body = message.text;
    else if (message.base64Image) body = "📷 사진";
    else if (message.fileUrl) body = "📄 파일";

    const payload = {
      notification: {
        title: notificationTitle,
        body: body,
        icon: "/favicon.ico",
        click_action: `https://YOUR_DOMAIN.com/?room=${roomId}`
      },
      data: {
        roomId: roomId
      }
    };

    try {
        await admin.messaging().sendToDevice(tokens, payload);
    } catch (error) {
        console.error("Error sending notifications:", error);
    }
  });

// Notification for join requests
exports.notifyJoinRequest = functions.firestore
  .document("joinRequests/{requestId}")
  .onCreate(async (snap, context) => {
    const request = snap.data();
    
    // Get admin FCM token
    const adminDoc = await db.collection('users').doc(request.adminId).get();
    if (!adminDoc.exists || !adminDoc.data().fcmToken) return;
    
    const payload = {
      notification: {
        title: '새 가입 요청',
        body: `${request.userName}님이 "${request.roomName}" 그룹에 가입을 요청했습니다`,
        icon: "/favicon.ico",
        click_action: `https://YOUR_DOMAIN.com/?room=${request.roomId}`
      },
      data: {
        roomId: request.roomId,
        type: 'joinRequest'
      }
    };

    try {
        await admin.messaging().sendToDevice(adminDoc.data().fcmToken, payload);
    } catch (error) {
        console.error("알림 전송 실패:", error);
    }
  });