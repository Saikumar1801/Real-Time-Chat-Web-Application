const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

/**
 * Sends a push notification when a new message is created in a chatroom.
 */
exports.sendChatNotification = functions.firestore
  .document("chatrooms/{roomId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const roomId = context.params.roomId;
    const roomDoc = await db.collection("chatrooms").doc(roomId).get();
    
    if (!roomDoc.exists) return;
    
    const roomData = roomDoc.data();
    const participants = roomData.participantIds;
    let recipients = participants.filter(id => id !== message.senderId);
    
    if (recipients.length === 0) return;

    // Check for blocked users before sending notifications
    try {
        const recipientDocs = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', recipients).get();
        const validRecipients = [];
        recipientDocs.forEach(doc => {
            const userData = doc.data();
            if (!userData.blockedUsers || !userData.blockedUsers.includes(message.senderId)) {
                validRecipients.push(doc.id);
            }
        });
        recipients = validRecipients;
    } catch(e) {
        console.error("Error checking for blocked users:", e);
    }
    
    if (recipients.length === 0) return;

    // Get FCM tokens
    const tokensSnapshot = await db.collection('users')
        .where(admin.firestore.FieldPath.documentId(), 'in', recipients)
        .get();

    const tokens = [];
    tokensSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.fcmToken) {
            tokens.push(userData.fcmToken);
        }
    });

    if (tokens.length === 0) return;
    
    let notificationTitle = message.senderName;
    if (roomData.type === 'group') {
        notificationTitle = `${message.senderName} (${roomData.title})`;
    }

    let body = "새 메시지";
    if (message.text) body = message.text;
    else if (message.base64Image) body = "📷 사진";

    const payload = {
      notification: {
        title: notificationTitle,
        body: body,
        icon: "/favicon.ico"
      },
      data: {
        roomId: roomId,
        click_action: `/?room=${roomId}`
      }
    };

    try {
        await admin.messaging().sendToDevice(tokens, payload);
    } catch (error) {
        console.error("Error sending notifications:", error);
    }
  });

/**
 * Sends a push notification to an admin when a new join request is created.
 */
exports.notifyJoinRequest = functions.firestore
  .document("joinRequests/{requestId}")
  .onCreate(async (snap, context) => {
    const request = snap.data();
    
    const adminDoc = await db.collection('users').doc(request.adminId).get();
    if (!adminDoc.exists || !adminDoc.data().fcmToken) return;
    
    const payload = {
      notification: {
        title: '새 가입 요청',
        body: `${request.userName}님이 "${request.roomName}" 그룹에 가입을 요청했습니다`,
        icon: "/favicon.ico"
      },
      data: {
        roomId: request.roomId,
        type: 'joinRequest',
        click_action: `/?room=${request.roomId}`
      }
    };

    try {
        await admin.messaging().sendToDevice([adminDoc.data().fcmToken], payload);
    } catch (error) {
        console.error("알림 전송 실패:", error);
    }
  });
  
/**
 * Handles post-processing when a user accepts an invitation.
 * It adds the user to the chatroom's participants, creates their member document,
 * and creates their private room reference so it appears in their list.
 */
exports.onInvitationAccepted = functions.firestore
  .document("invitations/{invitationId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== "pending" || after.status !== "accepted") {
      return null;
    }

    const { userId, roomId } = after;

    const roomRef = db.collection("chatrooms").doc(roomId);
    const userRoomsRef = db.collection("users").doc(userId).collection("rooms").doc(roomId);
    const memberRef = roomRef.collection("members").doc(userId);

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      console.error(`User ${userId} not found.`);
      return null;
    }
    const userData = userDoc.data() || {};
    const userName = userData.displayName || `User (${userId.substring(0, 5)})`;
    const userAvatar = userData.photoUrl || null;

    const batch = db.batch();

    batch.update(roomRef, {
      participantIds: admin.firestore.FieldValue.arrayUnion(userId),
      [`participantNames.${userId}`]: userName,
      [`participantAvatars.${userId}`]: userAvatar,
    });
    batch.set(userRoomsRef, { joinedAt: admin.firestore.FieldValue.serverTimestamp() });
    batch.set(memberRef, { role: "member", joinedAt: admin.firestore.FieldValue.serverTimestamp(), userId: userId });

    try {
      await batch.commit();
      console.log(`User ${userId} successfully added to room ${roomId} after accepting invitation.`);
      return null;
    } catch (error) {
      console.error(`Error adding user ${userId} to room ${roomId}:`, error);
      return null;
    }
  });

/**
 * Propagates user profile updates (displayName, photoUrl) to all chatrooms they are a member of.
 * This ensures data consistency across the app.
 */
exports.onUserUpdate = functions.firestore
    .document("users/{userId}")
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const userId = context.params.userId;

        const nameChanged = before.displayName !== after.displayName;
        const photoChanged = before.photoUrl !== after.photoUrl;

        if (!nameChanged && !photoChanged) {
            return null;
        }

        console.log(`User ${userId} updated profile. Propagating changes...`);

        const userRoomsSnapshot = await db.collection('users').doc(userId).collection('rooms').get();
        if (userRoomsSnapshot.empty) {
            console.log(`User ${userId} is not in any rooms.`);
            return null;
        }

        const batch = db.batch();
        const updateData = {};
        if (nameChanged) {
            updateData[`participantNames.${userId}`] = after.displayName;
        }
        if (photoChanged) {
            updateData[`participantAvatars.${userId}`] = after.photoUrl;
        }

        userRoomsSnapshot.docs.forEach(doc => {
            const roomId = doc.id;
            const roomRef = db.collection('chatrooms').doc(roomId);
            batch.update(roomRef, updateData);
        });

        try {
            await batch.commit();
            console.log(`Successfully propagated profile changes for user ${userId} to ${userRoomsSnapshot.size} rooms.`);
            return null;
        } catch (error) {
            console.error(`Error propagating profile changes for user ${userId}:`, error);
            return null;
        }
    });

/**
 * Cleans up a user's room reference when they are removed from a group's participant list.
 */
exports.onMemberRemoved = functions.firestore
  .document("chatrooms/{roomId}")
  .onUpdate(async (change, context) => {
    const beforeIds = change.before.data().participantIds || [];
    const afterIds = change.after.data().participantIds || [];

    const removedIds = beforeIds.filter(id => !afterIds.includes(id));

    if (removedIds.length === 0) {
      return null;
    }

    const roomId = context.params.roomId;
    const batch = db.batch();

    removedIds.forEach(userId => {
      console.log(`User ${userId} was removed from room ${roomId}. Deleting their room reference.`);
      const userRoomRef = db.collection("users").doc(userId).collection("rooms").doc(roomId);
      batch.delete(userRoomRef);
    });

    try {
      await batch.commit();
      console.log(`Successfully cleaned up room references for room ${roomId}.`);
      return null;
    } catch (error) {
      console.error(`Error cleaning up room references for room ${roomId}:`, error);
      return null;
    }
  });