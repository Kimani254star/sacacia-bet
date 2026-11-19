import { supabase } from "./supabase.js";

// Auth forms are intercepted in capture phase so legacy demo handlers cannot create fake sessions.
const $ = (id) => document.getElementById(id);
const show = (message) => {
  const toast = $("slipToast");
  if (toast) { toast.textContent = message; toast.classList.add("show"); }
  else window.alert(message);
};
const setBusy = (form, busy) => {
  const button = form.querySelector('button[type="submit"]');
  if (button) { button.disabled = busy; button.dataset.originalText ||= button.textContent;
    button.textContent = busy ? "Please wait…" : button.dataset.originalText; }
};
async function paintSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const label = session.user.user_metadata?.display_name ||
    session.user.user_metadata?.phone || session.user.phone ||
    session.user.email || "Account";
  const loggedOut = $("loggedOutActions");
  const accountMenu = $("accountMenu");
  if (loggedOut) loggedOut.style.display = "none";
  if (accountMenu) {
    accountMenu.style.display = "block";
    if ($("accountName")) $("accountName").textContent = label;
    if ($("accountAvatar")) $("accountAvatar").textContent = label.slice(0,1).toUpperCase();
  }
}
supabase.auth.onAuthStateChange(() => { paintSession(); });

document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  const isEmailLogin = form.id === "loginForm";
  const isEmailSignup = form.id === "signupForm";
  const isPhoneLogin = form.id === "login-form";
  const isPhoneSignup = form.id === "register-form";
  if (!(isEmailLogin || isEmailSignup || isPhoneLogin || isPhoneSignup)) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  setBusy(form, true);
  try {
    let result;
    if (isEmailLogin) {
      result = await supabase.auth.signInWithPassword({
        email: $("loginEmail").value.trim(),
        password: $("loginPassword").value
      });
    } else if (isEmailSignup) {
      const name = $("signupName").value.trim();
      const email = $("signupEmail").value.trim();
      const password = $("signupPassword").value;
      const confirm = $("signupConfirm").value;
      if (password !== confirm) throw new Error("Passwords do not match.");
      result = await supabase.auth.signUp({
        email, password,
        options: { data: { display_name: name, account_type: "customer" } }
      });
    } else if (isPhoneLogin) {
      result = await supabase.auth.signInWithPassword({
        phone: $("login-phone").value.trim(),
        password: $("login-password").value
      });
    } else {
      const phone = $("reg-phone").value.trim();
      const password = $("reg-password").value;
      const dob = $("reg-dob").value;
      if (!$("reg-age").checked) throw new Error("You must confirm the age and responsible-play declaration.");
      if (!dob) throw new Error("Enter your date of birth.");
      const age = (Date.now() - new Date(dob).getTime()) / 31557600000;
      if (!Number.isFinite(age) || age < 18) throw new Error("You must be at least 18 years old to register.");
      result = await supabase.auth.signUp({
        phone, password,
        options: { data: { date_of_birth: dob, account_type: "customer" } }
      });
    }
    if (result.error) throw result.error;
    if (result.data?.session) {
      show("Signed in successfully.");
      await paintSession();
    } else {
      show("Registration received. Complete any phone/email confirmation requested by Supabase.");
    }
    if (form.closest("#modalBackdrop")) $("modalBackdrop")?.classList.remove("open");
  } catch (error) {
    show(error.message || "Authentication failed.");
  } finally { setBusy(form, false); }
}, true);

$("logoutBtn")?.addEventListener("click", async (event) => {
  event.preventDefault();
  const { error } = await supabase.auth.signOut();
  if (error) show(error.message);
  else {
    if ($("loggedOutActions")) $("loggedOutActions").style.display = "flex";
    if ($("accountMenu")) $("accountMenu").style.display = "none";
    show("You have signed out.");
  }
});
paintSession();
