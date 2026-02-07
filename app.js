import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

/* ✅ তোমার Firebase config এখানে বসাও */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ---------- UI: Tabs ---------- */
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const tabGlow = document.querySelector(".tabGlow");

function showLogin() {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  loginForm.classList.add("show");
  registerForm.classList.remove("show");
  tabGlow.style.transform = "translateX(0%)";
}
function showRegister() {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  registerForm.classList.add("show");
  loginForm.classList.remove("show");
  tabGlow.style.transform = "translateX(100%)";
}
tabLogin.addEventListener("click", showLogin);
tabRegister.addEventListener("click", showRegister);

/* ---------- UI: password eye ---------- */
document.querySelectorAll("[data-toggle]").forEach(btn => {
  btn.addEventListener("click", () => {
    const sel = btn.getAttribute("data-toggle");
    const input = document.querySelector(sel);
    input.type = input.type === "password" ? "text" : "password";
  });
});

/* ---------- Helpers ---------- */
const loginMsg = document.getElementById("loginMsg");
const regMsg = document.getElementById("regMsg");
const setMsg = (el, text, type) => {
  el.textContent = text;
  el.className = `msg ${type || ""}`;
};

const SERVICES = [
  "facebook","whatsapp","imo","tiktok","gmail",
  "instagram","twitter","snapchat","linkedin","devicehack"
];

function makeAllowedMap(defaultValue = false){
  const m = {};
  SERVICES.forEach(s => (m[s] = defaultValue));
  return m;
}

/* ---------- Register ---------- */
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg(regMsg, "Creating account...", "");

  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const password = document.getElementById("regPassword").value;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // users/{uid}
    await setDoc(doc(db, "users", uid), {
      name,
      email,
      role: "user",
      createdAt: serverTimestamp()
    });

    // accessPermissions/{uid}
    await setDoc(doc(db, "accessPermissions", uid), {
      email,
      allowed: makeAllowedMap(false),
      createdAt: serverTimestamp()
    });

    setMsg(regMsg, "Account created ✅ এখন Login করো", "ok");
    showLogin();
  } catch (err) {
    setMsg(regMsg, (err && err.message) ? err.message : "Register failed", "err");
  }
});

/* ---------- Login ---------- */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg(loginMsg, "Logging in...", "");

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

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

/* default view */
showLogin();
