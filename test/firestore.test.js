// test/firestore.test.js

const assert = require('assert');
const firebase = require('@firebase/rules-unit-testing');

const MY_PROJECT_ID = "chat-app-6194f"; // Your actual project ID

describe("Chat App Security Rules", () => {
    let testEnv;

    before(async () => {
        // Set up the test environment
        testEnv = await firebase.initializeTestEnvironment({
            projectId: MY_PROJECT_ID,
            firestore: {
                rules: require('fs').readFileSync('../firestore.rules', 'utf8')
            }
        });
    });

    after(async () => {
        // Cleanup the test environment
        await testEnv.cleanup();
    });

    beforeEach(async () => {
        // Clear data before each test
        await testEnv.clearFirestoreData();
    });

    it("should NOT allow a non-member to read messages in a chatroom", async () => {
        const ownerId = "user_owner";
        const memberId = "user_member";
        const intruderId = "user_intruder";
        const roomId = "test_room";

        // 1. Setup the database state as an admin
        const adminDb = testEnv.authenticatedContext("admin", { admin: true }).firestore();
        await adminDb.collection("chatrooms").doc(roomId).set({
            title: "Test Room",
            type: "group",
            participantIds: [ownerId, memberId] // Intruder is NOT a participant
        });
        await adminDb.collection("chatrooms").doc(roomId).collection("messages").add({ text: "hello" });

        // 2. Get a Firestore instance for the non-member (intruder)
        const intruderDb = testEnv.authenticatedContext(intruderId).firestore();

        // 3. Try to read the messages and assert that it FAILS
        const messagesRef = intruderDb.collection("chatrooms").doc(roomId).collection("messages");
        await firebase.assertFails(messagesRef.get());
    });
    
    it("should ALLOW a member to read messages in a chatroom", async () => {
        const ownerId = "user_owner";
        const memberId = "user_member";
        const roomId = "test_room";

        // 1. Setup the database state
        const adminDb = testEnv.authenticatedContext("admin", { admin: true }).firestore();
        await adminDb.collection("chatrooms").doc(roomId).set({
            title: "Test Room",
            type: "group",
            participantIds: [ownerId, memberId]
        });
        await adminDb.collection("chatrooms").doc(roomId).collection("messages").add({ text: "hello" });

        // 2. Get a Firestore instance for the member
        const memberDb = testEnv.authenticatedContext(memberId).firestore();

        // 3. Try to read the messages and assert that it SUCCEEDS
        const messagesRef = memberDb.collection("chatrooms").doc(roomId).collection("messages");
        await firebase.assertSucceeds(messagesRef.get());
    });
});