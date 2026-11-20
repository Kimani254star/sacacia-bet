import { supabase } from "./supabase.js";
const $ = (id) => document.getElementById(id);
const OWNERS = ["adminacaciabooks@gmail.com", "developeracaciabooks@gmail.com"];
const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const note = (id, text, kind = "bad") => { $(id).innerHTML = text ? `<div class="msg ${kind}">${esc(text)}</div>` : ""; };
let me = null; // { email, role }

async function loadAccess() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { $("loginCard").classList.remove("hide"); $("console").classList.add("hide"); $("logoutBtn").classList.add("hide"); $("who").textContent = "Staff only"; return; }
  const email = (session.user.email || "").toLowerCase();
  const { data, error } = await supabase.from("acb_staff").select("email,role").ilike("email", email).maybeSingle();
  $("loginCard").classList.add("hide"); $("logoutBtn").classList.remove("hide");
  if (error || !data) {
    $("console").classList.add("hide");
    $("loginCard").classList.remove("hide");
    note("loginMsg", error ? "Could not check access: " + error.message + " (has acacia-bet-admin.sql been run?)" : email + " does not have back-end access. Ask the developer to add you.");
    $("who").textContent = email; return;
  }
  me = { email, role: data.role };
  $("who").textContent = email + " · " + data.role;
  $("console").classList.remove("hide");
  $("addCard").classList.toggle("hide", !(me.role === "developer" || me.role === "admin"));
  await Promise.all([renderStaff(), renderPlayers()]);
}

async function renderStaff() {
  const { data, error } = await supabase.from("acb_staff").select("email,role,added_by,created_at").order("created_at");
  if (error) { $("staffList").innerHTML = `<div class="msg bad">${esc(error.message)}</div>`; return; }
  const canEdit = me.role === "developer" || me.role === "admin";
  $("staffList").innerHTML = data.map((r) => {
    const locked = OWNERS.includes(r.email.toLowerCase()) || r.email.toLowerCase() === me.email;
    return `<div class="row"><div class="t"><b>${esc(r.email)}</b><span>${esc(r.role)}${r.added_by ? " · added by " + esc(r.added_by) : ""}</span></div>` +
      (canEdit && !locked ? `<button class="btn sec sm" data-remove="${esc(r.email)}">Remove</button>` : `<span class="pill">${OWNERS.includes(r.email.toLowerCase()) ? "owner" : "you"}</span>`) + `</div>`;
  }).join("") || '<p class="mute">Nobody yet.</p>';
}

async function renderPlayers() {
  const { data, error } = await supabase.from("acb_profiles").select("*").limit(500);
  if (error) { $("playerList").innerHTML = `<p class="mute">Player list is not available yet (${esc(error.message)}).</p>`; $("playerCount").textContent = "–"; return; }
  $("playerCount").textContent = data.length;
  $("playerList").innerHTML = data.map((p) => {
    const name = p.display_name || p.phone || p.email || String(p.id || "").slice(0, 8);
    const extra = [p.phone && p.phone !== name ? p.phone : "", p.date_of_birth ? "DOB " + p.date_of_birth : "", p.created_at ? "joined " + new Date(p.created_at).toLocaleDateString() : ""].filter(Boolean).join(" · ");
    return `<div class="row"><div class="t"><b>${esc(name)}</b><span>${esc(extra)}</span></div></div>`;
  }).join("") || '<p class="mute">No players yet.</p>';
}

$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault(); note("loginMsg", "");
  const { error } = await supabase.auth.signInWithPassword({ email: $("em").value.trim(), password: $("pw").value });
  if (error) return note("loginMsg", /invalid login/i.test(error.message) ? "Wrong email or password." : error.message);
  await loadAccess();
});
$("showCreate").addEventListener("click", (e) => { e.preventDefault(); $("createForm").classList.toggle("hide"); });
$("createForm").addEventListener("submit", async (e) => {
  e.preventDefault(); note("loginMsg", "");
  const { data, error } = await supabase.auth.signUp({ email: $("cem").value.trim(), password: $("cpw").value, options: { data: { account_type: "staff" } } });
  if (error) return note("loginMsg", error.message);
  if (data.session) await loadAccess(); else note("loginMsg", "Account created. Log in above.", "ok");
});
$("logoutBtn").addEventListener("click", async () => { await supabase.auth.signOut(); me = null; await loadAccess(); });
$("addForm").addEventListener("submit", async (e) => {
  e.preventDefault(); note("consoleMsg", "");
  const email = $("ae").value.trim().toLowerCase();
  const { error } = await supabase.from("acb_staff").insert({ email, role: $("ar").value, added_by: me.email });
  if (error) return note("consoleMsg", /duplicate/i.test(error.message) ? "That email already has access." : error.message);
  e.target.reset(); note("consoleMsg", email + " added. They can log in on this page now.", "ok"); await renderStaff();
});
$("staffList").addEventListener("click", async (e) => {
  const b = e.target.closest("[data-remove]"); if (!b || !confirm("Remove " + b.dataset.remove + "?")) return;
  const { error } = await supabase.from("acb_staff").delete().eq("email", b.dataset.remove);
  note("consoleMsg", error ? error.message : "Removed.", error ? "bad" : "ok"); await renderStaff();
});
supabase.auth.onAuthStateChange(() => {});
loadAccess();
