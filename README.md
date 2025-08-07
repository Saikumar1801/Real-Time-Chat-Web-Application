# Real-Time Chat Web Application

A full-featured, real-time chat web application built from the ground up with Vanilla JavaScript and powered by a Firebase backend. This project was developed without any external frameworks or component libraries, focusing on core web technologies and modern development patterns.

**[➡️ Live Demo Link (Placeholder)](https://your-live-demo-url.com)**

---

## 📸 Screenshots

*(Add screenshots or a GIF of the application in action here. This is highly recommended.)*

| Chatroom List View                               | Chat Screen View                               |
| :----------------------------------------------- | :--------------------------------------------- |
|  |  |

---

## ✨ Key Features

-   **Real-Time Messaging:** Instantly send and receive messages in any chat room using Firestore's `onSnapshot` listener.
-   **User-Specific Chatrooms:** Each user has their own list of joined chatrooms, ensuring a private and personalized experience.
-   **Chatroom Management:**
    -   **Create:** Easily create new public or private chatrooms.
    -   **Join:** Join any existing room using its unique Room ID.
    -   **Delete:** Permanently delete a room and all its associated messages.
-   **Rich Media & File Sharing:**
    -   **Image Uploads:** Send images that are displayed directly in the chat.
    -   **File Uploads:** Share any file type, which appears as a downloadable link.
-   **Advanced Messaging Features:**
    -   **Read Receipts:** Sent messages display double blue ticks (`✓✓`) once read by all members in the room.
    -   **Message Forwarding:** Forward any message to another one of your chatrooms.
-   **User Experience Enhancements:**
    -   **Unread Message Count:** A badge on the chatroom list shows the number of new messages.
    -   **Search:** Instantly filter your chatroom list by title.
    -   **Mute:** Mute notifications on a per-room basis.
    -   **Responsive Design:** Fully functional and aesthetically pleasing on both desktop and mobile devices.
-   **Secure & Anonymous Auth:** Users are automatically signed in anonymously via Firebase Auth, providing a unique identity for sending messages without a complicated sign-up process.

---

## 💻 Technology Stack

-   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
-   **Backend (BaaS):** Firebase
    -   **Firestore:** Real-time NoSQL database for storing messages, room details, and user data.
    -   **Firebase Authentication:** For handling anonymous user sessions.
    -   **Firebase Storage:** For storing uploaded files and images.

---

## 🗄️ Firestore Data Structure

The database schema is designed for scalability and efficiency.

-   `chatrooms/{roomId}`
    -   Stores metadata for each chat room, including `title`, `creatorId`, `createdAt`, `members` (an array of user UIDs), and `lastMessage` for list previews.
-   `chatrooms/{roomId}/messages/{messageId}`
    -   A sub-collection containing all messages for a specific room. Each message document includes `senderId`, `text`, `timestamp`, `readBy` (an array of UIDs), and optional fields for media (`fileUrl`, `base64Image`, etc.).
-   `users/{userId}/rooms/{roomId}`
    -   Stores a reference to each room a user is a member of. This allows for efficiently fetching a specific user's chat list without querying all rooms.
-   `mutes/{userId}/rooms/{roomId}`
    -   Stores the mute status for a specific user and room, allowing for per-user, per-room mute settings.

---

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

You need a code editor and a web browser. A local server is recommended for development to avoid CORS issues. The [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension for VS Code is a great option.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/real-time-chat-app.git
    cd real-time-chat-app
    ```

2.  **Create a Firebase Project:**
    -   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    -   In your project, go to **Project Settings** > **General**.
    -   Under "Your apps", click the web icon (`</>`) to add a new web app.
    -   Register the app and Firebase will provide you with a configuration object.

3.  **Add Firebase Config to the Project:**
    -   Copy the `firebaseConfig` object provided.
    -   Open `chat.js` and `chatrooms.js`.
    -   Paste your `firebaseConfig` object at the top of both files, replacing the placeholder.

    ```javascript
    // In both chat.js and chatrooms.js
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    ```

4.  **Enable Firebase Services:**
    -   In the Firebase Console, navigate to the **Authentication** section, click "Get Started", and enable the **Anonymous** sign-in provider.
    -   Navigate to the **Firestore Database** section, click "Create database", start in **Test mode**, and choose a location.
    -   Navigate to the **Storage** section and click "Get Started", starting in **Test mode**.

5.  **Run the Application:**
    -   If you are using the VS Code Live Server extension, simply right-click `index.html` and select "Open with Live Server".
    -   Otherwise, serve the project files using any local web server. The application will open on `chatrooms.html`.

---

## 📁 Project Structure
```
├── chat.html # The individual chat room screen
├── chat.js # Logic for the chat.html page
├── chatrooms.html # The main screen showing the user's chat list
├── chatrooms.js # Logic for the chatrooms.html page
├── index.html # Redirects to chatrooms.html
├── style.css # All CSS styles for the application
└── README.md # This file
```

---

## 📈 Future Improvements

-   **Full User Authentication:** Implement email/password and social sign-in for persistent user profiles, display names, and avatars.
-   **"Is Typing..." Indicator:** Show a real-time indicator when another user is typing a message.
-   **Push Notifications:** Use Firebase Cloud Messaging to notify users of new messages when the app is in the background.
-   **Group Admin/Moderation:** Add roles (`admin`, `member`) to allow for room moderation (e.g., kicking users).
-   **Accessibility (A11y) Enhancements:** Conduct a full audit and add necessary ARIA attributes to improve screen reader support.
