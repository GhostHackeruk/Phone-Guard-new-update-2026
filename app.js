// app.js (complete) — index.html এর সাথে কাজ করবে, কিছুই আলাদা করে করতে হবে না

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

/* ---------------- Firebase Config (তোমারটা বসানো আছে) ---------------- */
const firebaseConfig = {
  apiKey: "AIzaSyBud-tsFoCGWG8S5Qj5cnhImZwGfwn0b5g",
  authDomain: "phone-guard-c2a6c.firebaseapp.com",
  projectId: "phone-guard-c2a6c",
  storageBucket: "phone-guard-c2a6c.firebasestorage.app",
  messagingSenderId: "652581603569",
  appId: "1:652581603569:web:c3912ce05e36ad65bc8150",
  measurementId: "G-R44LEDGNL9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ---------------- UI Elements ---------------- */
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const tabGlow = document.querySelector(".tabGlow");

const loginMsg = document.getElementById("loginMsg");
const regMsg = document.getElementById("regMsg");

const loginEmailEl = document.getElementById("loginEmail");
const loginPassEl = document.getElementById("loginPassword");

const regNameEl = document.getElementById("regName");
const regEmailEl = document.getElementById("regEmail");
const regPassEl = document.getElementById("regPassword");

/* ---------------- Helpers ---------------- */
function setMsg(el, text = "", type = "") {
  if (!el) return;
  el.textContent = text;
  el.className = "msg " + (type ? type : "");
}

function showLogin() {
  tabLogin?.classList.add("active");
  tabRegister?.classList.remove("active");
  loginForm?.classList.add("show");
  registerForm?.classList.remove("show");
  if (tabGlow) tabGlow.style.transform = "translateX(0%)";
  setMsg(regMsg, "");
}

function showRegister() {
  tabRegister?.classList.add("active");
  tabLogin?.classList.remove("active");
  registerForm?.classList.add("show");
  loginForm?.classList.remove("show");
  if (tabGlow) tabGlow.style.transform = "translateX(100%)";
  setMsg(loginMsg, "");
}

function normalizeEmail(v) {
  return String(v || "").trim().toLowerCase();
}

function safeTrim(v) {
  return String(v || "").trim();
}

/* ---------------- Tabs ---------------- */
tabLogin?.addEventListener("click", showLogin);
tabRegister?.addEventListener("click", showRegister);

/* ---------------- Password Eye Toggle (data-toggle) ---------------- */
document.querySelectorAll("[data-toggle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const sel = btn.getAttribute("data-toggle");
    const input = document.querySelector(sel);
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
  });
});

/* ---------------- Permissions Map (সব false) ---------------- */
const SERVICES = [
  "facebook",
  "whatsapp",
  "imo",
  "tiktok",
  "gmail",
  "instagram",
  "twitter",
  "snapchat",
  "linkedin",
  "devicehack",
];

function makeAllowedMap(defaultValue = false) {
  const m = {};
  SERVICES.forEach((s) => (m[s] = defaultValue));
  return m;
}

/* ---------------- Register ---------------- */
registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg(regMsg, "Creating account...", "");

  const name = safeTrim(regNameEl?.value);
  const email = normalizeEmail(regEmailEl?.value);
  const password = String(regPassEl?.value || "");

  if (name.length < 2) return setMsg(regMsg, "Name কমপক্ষে 2 অক্ষর হতে হবে", "err");
  if (!email.includes("@")) return setMsg(regMsg, "Valid email দাও", "err");
  if (password.length < 6) return setMsg(regMsg, "Password কমপক্ষে 6 অক্ষর", "err");

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // displayName সেট (optional)
    try {
      await updateProfile(user, { displayName: name });
    } catch (_) {}

    const uid = user.uid;

    // users/{uid}
    await setDoc(doc(db, "users", uid), {
      name,
      email,
      role: "user",
      createdAt: serverTimestamp(),
    });

    // accessPermissions/{uid}
    await setDoc(doc(db, "accessPermissions", uid), {
      email,
      allowed: makeAllowedMap(false),
      createdAt: serverTimestamp(),
    });

    setMsg(regMsg, "Account created ✅ এখন Login করো", "ok");
    registerForm.reset();
    showLogin();
  } catch (err) {
    const msg = err?.message || "Register failed";
    setMsg(regMsg, msg, "err");
  }
});

/* ---------------- Login ---------------- */
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg(loginMsg, "Logging in...", "");

  const email = normalizeEmail(loginEmailEl?.value);
  const password = String(loginPassEl?.value || "");

  if (!email.includes("@")) return setMsg(loginMsg, "Valid email দাও", "err");
  if (!password) return setMsg(loginMsg, "Password দাও", "err");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    setMsg(loginMsg, "Login success ✅ Redirecting...", "ok");
    setTimeout(() => {
      window.location.href = "home.html";
    }, 600);
  } catch (err) {
    setMsg(loginMsg, "Wrong email/password ❌", "err");
  }
});

/* ---------------- Default View ---------------- */
showLogin();
```0
