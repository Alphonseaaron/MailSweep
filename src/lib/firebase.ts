import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOu78zJoLPDNfNyKjX4tIaOiN_lb3H10Q",
  authDomain: "mailsweep-c663e.firebaseapp.com",
  databaseURL: "https://mailsweep-c663e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mailsweep-c663e",
  storageBucket: "mailsweep-c663e.firebasestorage.app",
  messagingSenderId: "516439091078",
  appId: "1:516439091078:web:b58b030c852323a620ee07",
  measurementId: "G-8ZZH7GFD32"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure custom email template
auth.config.emailVerificationTemplate = {
  subject: 'Welcome to MailSweep - Verify Your Email',
  body: `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://mailsweep-c663e.firebaseapp.com/logo.png" alt="MailSweep Logo" style="width: 150px;">
      </div>
      
      <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">Verify Your Email Address</h1>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
        Welcome to MailSweep! We're excited to have you on board. To get started with managing your email inbox, please verify your email address by clicking the button below:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="%LINK%" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        If you didn't create an account with MailSweep, you can safely ignore this email.
      </p>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>MailSweep - Your Email Management Solution</p>
        <p>© 2024 MailSweep. All rights reserved.</p>
      </div>
    </div>
  `
};