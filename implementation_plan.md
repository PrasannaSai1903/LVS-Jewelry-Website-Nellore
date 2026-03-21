# Migrate LVS Jewellery to Real Database (Firebase)

## Goal
The goal is to replace `localStorage` with Firebase Firestore so that products added via the Admin Dashboard are persistently stored in a cloud database and visible to all users visiting the main website.

> [!IMPORTANT]
> **User Review Required**
> 1. You will need to create a **Firebase Project** (it's free!).
> 2. Enable **Firestore Database** in the Firebase console and set its rules to allow read/write (for testing, you can use Test Mode).
> 3. Provide me with the **Firebase Configuration object** so I can inject it into the code. It looks like this:
>    ```javascript
>    const firebaseConfig = {
>      apiKey: "YOUR_API_KEY",
>      authDomain: "your-project.firebaseapp.com",
>      projectId: "your-project",
>      storageBucket: "your-project.appspot.com",
>      messagingSenderId: "123456789",
>      appId: "1:1234:web:abcd"
>    };
>    ```

## Proposed Changes

### Configuration
#### [NEW] `firebase-config.js`
Create a dedicated file to hold the Firebase configuration and initialize the App and Firestore database. This ensures both the admin and main pages share the same database connection.

---

### Admin Dashboard (admin.html & admin.js)
#### [MODIFY] [admin.html](file:///c:/Users/prasanna/Desktop/lvs%20Jewelery/admin.html)
- Include Firebase SDKs (Firebase App and Firestore) via CDN.
- Include `firebase-config.js`.

#### [MODIFY] [admin.js](file:///c:/Users/prasanna/Desktop/lvs%20Jewelery/admin.js)
- Replace [getProducts()](file:///c:/Users/prasanna/Desktop/lvs%20Jewelery/admin.js#11-19) with a function that fetches products from the Firestore `products` collection.
- Replace [saveProducts()](file:///c:/Users/prasanna/Desktop/lvs%20Jewelery/admin.js#20-24) with logic to write a new product to Firestore (`addDoc` or `setDoc`).
- Update the delete function to remove documents from Firestore using `deleteDoc`.
- Ensure base64 images are saved properly to the Firestore document.

---

### Main Website (index.html & main.js)
#### [MODIFY] [index.html](file:///c:/Users/prasanna/Desktop/lvs%20Jewelery/index.html)
- Include Firebase SDKs via CDN.
- Include `firebase-config.js`.

#### [MODIFY] [main.js](file:///c:/Users/prasanna/Desktop/lvs%20Jewelery/main.js)
- Remove the `localStorage` loading logic.
- Replace [renderHomepageProducts()](file:///c:/Users/prasanna/Desktop/lvs%20Jewelery/main.js#130-162) logic to fetch products directly from Firestore instead of the local cache.
- Handle a potential loading state while products are being fetched from the database.

## Verification Plan

### Manual Verification
1. I will set up the code after you provide the Firebase config.
2. You will open [admin.html](file:///c:/Users/prasanna/Desktop/lvs%20Jewelery/admin.html) in your browser.
3. You will add a new test product (with an image) and delete an old one.
4. You will then open [index.html](file:///c:/Users/prasanna/Desktop/lvs%20Jewelery/index.html) (preferably in an incognito window or on your phone) and verify that the product you added is visible, proving that the cloud database is working to sync data across devices.
