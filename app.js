import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

/* ✅ তোমার Firebase Config */
const firebaseConfig = {
  apiKey: "AIzaSyBud-tsFoCGWG8S5Qj5cnhImZwGfwn0b5g",
  authDomain: "phone-guard-c2a6c.firebaseapp.com",
  projectId: "phone-guard-c2a6c",
  storageBucket: "phone-guard-c2a6c.firebasestorage.app",
  messagingSenderId: "652581603569",
  appId: "1:652581603569:web:c3912ce05e36ad65bc8150",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* UI */
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const tabGlow = document.querySelector(".tabGlow");

const loginMsg = document.getElementById("loginMsg");
const regMsg = document.getElementById("regMsg");

const SERVICES = [
  "mobile",
  "facebook",
  "whatsapp",
  "imo",
  "tiktok",
  "gmail",
  "instagram",
  "location",
  "snapchat",
  "linkedin",
];

function setMsg(el, text = "", type = "") {
  if (!el) return;
  el.textContent = text;
  el.className = "msg " + (type || "");
}

function showLogin() {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  loginForm.classList.add("show");
  registerForm.classList.remove("show");
  if (tabGlow) tabGlow.style.transform = "translateX(0%)";
  setMsg(regMsg, "");
}

function showRegister() {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  registerForm.classList.add("show");
  loginForm.classList.remove("show");
  if (tabGlow) tabGlow.style.transform = "translateX(100%)";
  setMsg(loginMsg, "");
}

/* Tabs */
tabLogin.addEventListener("click", showLogin);
tabRegister.addEventListener("click", showRegister);

/* Eye toggle */
document.querySelectorAll("[data-toggle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const sel = btn.getAttribute("data-toggle");
    const input = document.querySelector(sel);
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
  });
});

function makeAllowedMap() {
  const m = {};
  SERVICES.forEach((k) => (m[k] = false));
  return m;
}

/* Register */
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const password = document.getElementById("regPassword").value;

  if (!name) return setMsg(regMsg, "Name required", "err");
  if (!email) return setMsg(regMsg, "Email required", "err");
  if (password.length < 6) return setMsg(regMsg, "Password min 6", "err");

  try {
    setMsg(regMsg, "Creating...", "");
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // optional displayName
    try { await updateProfile(cred.user, { displayName: name }); } catch {}

    const uid = cred.user.uid;

    await setDoc(doc(db, "users", uid), {
      name,
      email,
      role: "user",
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "accessPermissions", uid), {
      email,
      allowed: makeAllowedMap(),
      createdAt: serverTimestamp(),
    });

    setMsg(regMsg, "Account created ✅ এখন Login করো", "ok");
    registerForm.reset();
    showLogin();
  } catch (err) {
    setMsg(regMsg, err?.message || "Register failed", "err");
  }
});

/* Login */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) return setMsg(loginMsg, "Email + Password required", "err");

  try {
    setMsg(loginMsg, "Logging in...", "");
    await signInWithEmailAndPassword(auth, email, password);
    setMsg(loginMsg, "Login success ✅ Redirecting...", "ok");
    setTimeout(() => (window.location.href = "home.html"), 500);
  } catch {
    setMsg(loginMsg, "Wrong email/password ❌", "err");
  }
});

/* If already logged in, go home */
onAuthStateChanged(auth, (user) => {
  if (user) {
    // optional auto-redirect:
    // window.location.href = "home.html";
  }
});

showLogin();
