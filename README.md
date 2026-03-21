# LVS Jewellery - Developer & Operations Guide

Welcome to the internal documentation for the LVS Jewellery project. This guide explains how the website's architecture works, how to test it, and how to publish future code updates securely to the internet.

---

## 1. Project Architecture

This is a modern, static web application built using standard, lightweight web technologies for maximum speed and simplicity:
* **Frontend:** HTML, Vanilla CSS (`index.css`), Vanilla JavaScript (`main.js`, `admin.js`).
* **Database:** Firebase Firestore (Cloud Database).
* **Hosting:** Firebase Hosting (Free tier).

---

## 2. The Database system

We recently migrated your "Featured Pieces" from browser memory (`localStorage`) to a real, live cloud database.

Whenever you enter the **Admin Dashboard** (`admin.html`) to upload a picture and product details, the code in `admin.js` converts your image into a text string (Base64 format) and sends it securely to your Firebase project. 

Whenever a customer visits your homepage (`index.html`), the `main.js` script instantly connects to Firebase and downloads the live product inventory to display on their screen.

> **Crucial Concept:** Adding or removing products on `admin.html` is an **instant database update**. Everyone on the internet will see the change within milliseconds. You *do not* need to run terminal commands to add new jewelry.

---

## 3. Code Adjustments & Local Testing

When you edit the code itself (for example: moving buttons in `index.html`, changing gold colors in `index.css`, or adding a search bar in `main.js`), those code changes **are only saved to your computer.** They are not on the live internet yet.

Because the code uses secure JavaScript modules (`type="module"`), you cannot just double-click the HTML files to see them. You must run a "Local Development Server".

**How to test code changes locally:**
1. Open your terminal inside the project checkout folder (`c:\Users\prasanna\Desktop\lvs Jewelery`).
2. Run this command:
   ```bash
   npx serve .
   ```
3. Open the `http://localhost:3000` link provided in your web browser.
4. Keep the server running and browse your site. Every time you save a code file, simply refresh the browser to test your new code.

---

## 4. Publishing Updates to the Live Website

After you have confirmed that your new code works perfectly on your local machine, it is time to publish those code changes to your live host so customers can experience the new features.

**To deploy (publish) your code:**
1. Open your terminal in the project folder.
2. If this is your first time in a while, ensure you are logged into Firebase by running:
   ```bash
   firebase login
   ```
3. Run the publishing command to upload your files to Google's servers:
   ```bash
   firebase deploy
   ```
4. Wait for the terminal to print **"Deploy complete!"**. It will provide your live URL (e.g., `https://lvs-jewelry.web.app`). The changes are now live for the world!
