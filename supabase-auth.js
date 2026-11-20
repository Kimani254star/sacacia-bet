import { supabase } from "./supabase.js";

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

/* Phone + password sign-in (like Betika): the Kenyan number is turned into a private login id,
   so no SMS provider is needed. 0712 345 678, +254712345678 and 254712345678 are the same account. */
function normalizePhone(raw) {
  let d = String(raw || "").replace(/[^\d]/g, "");
  if (d.startsWith("254")) d = d.slice(3);
  else if (d.startsWith("0")) d = d.slice(1);
  if (!/^[17]\d{8}$/.test(d)) throw new Error("Enter a valid Kenyan phone number, e.g. 0712 345 678.");
  return "254" + d;
}
/* A real, deliverable address is needed (Supabase rejects made-up domains), so the number is added as a "+tag" to the Acacia admin inbox. */
const phoneLoginId = (raw) => "adminacaciabooks+" + normalizePhone(raw) + "@gmail.com";
function friendlyAuthError(error, isPhone) {
  const m = (error && error.message) || "Authentication failed.";
  if (/invalid login credentials/i.test(m)) return isPhone ? "Wrong phone number or password." : "Wrong email or password.";
  if (/email not confirmed/i.test(m)) return "This account still needs confirming. Ask the admin to turn off 'Confirm email' in Supabase.";
  if (/rate limit/i.test(m)) return "Too many sign-up attempts. Wait a little and try again. (Admin: turn off 'Confirm email' in Supabase so no email is sent.)";
  if (/already registered|already exists/i.test(m)) return isPhone ? "This phone number is already registered. Log in instead." : m;
  return m;
}
/* the look is saved to the account, so it follows the login to any phone */
if (window.AcaciaAppearance) AcaciaAppearance.onSave((look) => { supabase.auth.updateUser({ data: { look } }).catch(() => {}); });
async function paintSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  if (window.AcaciaAppearance) AcaciaAppearance.setUser(session.user.id, session.user.user_metadata?.look);
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
        email: phoneLoginId($("login-phone").value),
        password: $("login-password").value
      });
    } else {
      const phone = normalizePhone($("reg-phone").value);
      const password = $("reg-password").value;
      const dob = $("reg-dob").value;
      if (!$("reg-age").checked) throw new Error("You must confirm the age and responsible-play declaration.");
      if (!dob) throw new Error("Enter your date of birth.");
      const age = (Date.now() - new Date(dob).getTime()) / 31557600000;
      if (!Number.isFinite(age) || age < 18) throw new Error("You must be at least 18 years old to register.");
      result = await supabase.auth.signUp({
        email: "adminacaciabooks+" + phone + "@gmail.com", password,
        options: { data: { phone, date_of_birth: dob, account_type: "customer" } }
      });
    }
    if (result.error) throw result.error;
    if (result.data?.session) {
      show("Signed in successfully.");
      await paintSession();
    } else {
      show(isPhoneSignup ? "Account created. Log in with your phone number and password." : "Registration received. Complete any email confirmation requested.");
    }
    if (form.closest("#modalBackdrop")) $("modalBackdrop")?.classList.remove("open");
  } catch (error) {
    show(friendlyAuthError(error, isPhoneLogin || isPhoneSignup));
  } finally { setBusy(form, false); }
}, true);

$("logoutBtn")?.addEventListener("click", async (event) => {
  event.preventDefault();
  const { error } = await supabase.auth.signOut();
  if (error) show(error.message);
  else {
    if (window.AcaciaAppearance) AcaciaAppearance.clearUser();
    if ($("loggedOutActions")) $("loggedOutActions").style.display = "flex";
    if ($("accountMenu")) $("accountMenu").style.display = "none";
    show("You have signed out.");
  }
});
paintSession();
