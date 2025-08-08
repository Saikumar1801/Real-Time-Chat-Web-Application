// This is a helper script to populate your Firestore with initial data.
// You can run this once from the chatrooms.html page's console by typing `setupData(db)`.

const setupData = async (db) => {
    // A quick check to make sure the db object is valid.
    if (!db || typeof db.batch !== 'function') {
        console.error("Firebase database object is not valid. Make sure you are passing the `db` variable from chatrooms.js.");
        alert("Could not run setup: Firebase not initialized correctly.");
        return;
    }

    console.log("Setting up initial data...");

    // Define the sample chatrooms we want to create.
    const rooms = {
        'general': {
            title: 'General Discussion',
            createdAt: new Date(),
            lastMessage: {
                text: 'Welcome everyone to the general chat!',
                timestamp: new Date()
            }
        },
        'project-phoenix': {
            title: 'Project Phoenix',
            createdAt: new Date(),
            lastMessage: {
                text: 'Let\'s review the latest mockups for the dashboard.',
                timestamp: new Date(Date.now() - 3600000) // 1 hour ago
            }
        },
        'random': {
            title: 'Random & Fun',
            createdAt: new Date(),
            lastMessage: {
                text: 'What is everyone doing this weekend?',
                timestamp: new Date(Date.now() - 86400000) // 1 day ago
            }
        }
    };
    
    // A batched write allows us to perform multiple write operations as a single, atomic unit.
    // If any operation fails, they all fail. This is safer than individual writes.
    const batch = db.batch();

    // Loop through our predefined room objects.
    for (const [id, data] of Object.entries(rooms)) {
        // Get a reference to the document we want to create, using our predefined ID (e.g., 'general').
        const roomRef = db.collection('chatrooms').doc(id);
        
        // Add the 'set' operation for the chatroom document to the batch.
        batch.set(roomRef, data);

        // Also add a sample welcome message to each room's 'messages' sub-collection.
        const messagesRef = roomRef.collection('messages').doc(); // Generate a new random ID for the message.
        batch.set(messagesRef, {
            senderId: 'system', // A special ID for system-generated messages.
            text: `Welcome to the ${data.title} room!`,
            timestamp: data.lastMessage.timestamp // Use the same timestamp as the lastMessage for consistency.
        });
    }

    try {
        // Commit the batch to Firestore. This sends all the operations to the server.
        await batch.commit();
        console.log("✅ Initial data setup complete!");
        alert("Firestore has been populated with sample data. You can now remove the setup-data.js script tag from chatrooms.html if you wish.");
    } catch (error) {
        console.error("Error setting up data: ", error);
        alert("Error populating data. This might be due to Firestore security rules. Please check the console for details.");
    }
};