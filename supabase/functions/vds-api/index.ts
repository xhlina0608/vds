import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BOOTSTRAP_SECRET = Deno.env.get("VDS_BOOTSTRAP_SECRET")!;
const adminDb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const authClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-vds-bootstrap-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
function reply(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: cors });
}
function internalEmail(username: string) { return `${username.toLowerCase()}@vds.invalid`; }
function validUsername(v: unknown) { return typeof v === "string" && /^[a-zA-Z0-9._-]{3,24}$/.test(v); }
async function getActor(req: Request) {
  const h = req.headers.get("Authorization") || "";
  const token = h.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Sesi login tidak ditemukan.");
  const { data, error } = await adminDb.auth.getUser(token);
  if (error || !data.user) throw new Error("Sesi tidak valid. Silakan login kembali.");
  const { data: profile, error: pErr } = await adminDb.from("profiles").select("*").eq("id", data.user.id).single();
  if (pErr || !profile || profile.active === false) throw new Error("Akun tidak aktif atau profil tidak ditemukan.");
  return { user: data.user, profile, token };
}
function isAdmin(profile: any) { return profile.role === "admin" && profile.active !== false; }
async function requireAdmin(req: Request) {
  const actor = await getActor(req);
  if (!isAdmin(actor.profile)) throw new Error("Aksi ini hanya boleh dilakukan Admin.");
  return actor;
}
async function requireSiteAccess(req: Request, site: string) {
  const actor = await getActor(req);
  if (!["bidding", "dana"].includes(site)) throw new Error("Website tidak valid.");
  const permissions = actor.profile.permissions || {};
  if (!isAdmin(actor.profile) && permissions[site === "bidding" ? "siteBidding" : "siteDana"] !== true)
    throw new Error("Tidak memiliki akses ke website ini.");
  return actor;
}
function maxNumeric(values: unknown[], fallback = 0) {
  const nums = values.map(v => Number(String(v ?? "").replace(/[^\d]/g, ""))).filter(n => Number.isFinite(n));
  return Math.max(fallback, ...nums);
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    const body = await req.json();
    const action = String(body.action || "");

    if (action === "bootstrap-admin") {
      if (!BOOTSTRAP_SECRET || req.headers.get("x-vds-bootstrap-secret") !== BOOTSTRAP_SECRET)
        return reply({ error: "Bootstrap secret tidak cocok." }, 401);
      const username = "septino";
      const password = String(body.password || "");
      if (password.length < 10) return reply({ error: "Password Admin awal minimal 10 karakter." }, 400);
      const email = internalEmail(username);
      const { data: existing } = await adminDb.auth.admin.listUsers({ page: 1, perPage: 1000 });
      let user = existing.users.find((u) => u.email?.toLowerCase() === email);
      if (!user) {
        const { data, error } = await adminDb.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { username } });
        if (error) throw error;
        user = data.user;
      }
      const { error: pErr } = await adminDb.from("profiles").upsert({
        id: user.id, username, role: "admin", active: true, must_change_password: false,
        permissions: { siteBidding: true, siteDana: true },
      }, { onConflict: "id" });
      if (pErr) throw pErr;
      return reply({ ok: true, username });
    }

    if (action === "login") {
      const username = String(body.username || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!validUsername(username) || !password) return reply({ error: "Username atau password tidak valid." }, 400);
      const { data, error } = await authClient.auth.signInWithPassword({ email: internalEmail(username), password });
      if (error || !data.session || !data.user) return reply({ error: "Username atau password salah." }, 401);
      const { data: profile, error: pErr } = await adminDb.from("profiles").select("*").eq("id", data.user.id).single();
      if (pErr || !profile || profile.active === false) return reply({ error: "Akun tidak aktif." }, 403);
      return reply({ ok: true, session: data.session, user: {
        id: data.user.id, username: profile.username, role: profile.role, active: profile.active,
        permissions: profile.permissions || {}, must_change_password: profile.must_change_password,
      }});
    }

    if (action === "change-password") {
      const actor = await getActor(req);
      const next = String(body.newPassword || "");
      if (next.length < 8) return reply({ error: "Password baru minimal 8 karakter." }, 400);
      const { error } = await adminDb.auth.admin.updateUserById(actor.user.id, { password: next });
      if (error) throw error;
      const { error: pErr } = await adminDb.from("profiles").update({ must_change_password: false }).eq("id", actor.user.id);
      if (pErr) throw pErr;
      return reply({ ok: true });
    }

    if (action === "list-users") {
      await requireAdmin(req);
      const { data: authUsers, error: aErr } = await adminDb.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (aErr) throw aErr;
      const { data: profiles, error: pErr } = await adminDb.from("profiles").select("*").order("username");
      if (pErr) throw pErr;
      const byId = new Map((profiles || []).map((p: any) => [p.id, p]));
      return reply({ users: authUsers.users.map((u: any) => {
        const p: any = byId.get(u.id) || {};
        return { id: u.id, username: p.username || u.user_metadata?.username || "", role: p.role || "user",
          active: p.active !== false, permissions: p.permissions || {}, must_change_password: p.must_change_password === true,
          created_at: u.created_at };
      }).filter((u: any) => !!u.username) });
    }

    if (action === "create-user") {
      await requireAdmin(req);
      const username = String(body.username || "").trim().toLowerCase();
      const password = String(body.password || "123456");
      const permissions = body.permissions && typeof body.permissions === "object" ? body.permissions : {};
      const role = body.role === "admin" ? "admin" : "user";
      if (!validUsername(username)) return reply({ error: "Username harus 3–24 karakter: huruf, angka, titik, _ atau -." }, 400);
      if (password.length < 6) return reply({ error: "Password awal minimal 6 karakter." }, 400);
      const { data, error } = await adminDb.auth.admin.createUser({ email: internalEmail(username), password, email_confirm: true, user_metadata: { username } });
      if (error) throw error;
      const { error: pErr } = await adminDb.from("profiles").upsert({
        id: data.user.id, username, role, active: true,
        permissions: role === "admin" ? { siteBidding: true, siteDana: true } : permissions,
        must_change_password: true,
      }, { onConflict: "id" });
      if (pErr) throw pErr;
      return reply({ ok: true, username, temporary_password: password, must_change_password: true });
    }

    if (action === "update-user") {
      await requireAdmin(req);
      const id = String(body.id || "");
      const updates: any = {};
      if (typeof body.active === "boolean") updates.active = body.active;
      if (body.permissions && typeof body.permissions === "object") updates.permissions = body.permissions;
      if (!id) return reply({ error: "User ID wajib diisi." }, 400);
      const { error } = await adminDb.from("profiles").update(updates).eq("id", id);
      if (error) throw error;
      return reply({ ok: true });
    }

    if (action === "reset-password") {
      await requireAdmin(req);
      const id = String(body.id || "");
      const password = String(body.password || "123456");
      if (!id || password.length < 6) return reply({ error: "User ID atau password tidak valid." }, 400);
      const { error } = await adminDb.auth.admin.updateUserById(id, { password });
      if (error) throw error;
      const { error: pErr } = await adminDb.from("profiles").update({ must_change_password: true }).eq("id", id);
      if (pErr) throw pErr;
      return reply({ ok: true, temporary_password: password });
    }

    if (action === "allocate-transaction-numbers") {
      const site = String(body.site || "");
      await requireSiteAccess(req, site);
      const { data: current, error: stateErr } = await adminDb.from("app_state").select("payload").eq("site", site).maybeSingle();
      if (stateErr) throw stateErr;
      const txs = Array.isArray(current?.payload?.transactions) ? current.payload.transactions : [];
      const invoiceBase = site === "dana" ? 26000 : 2600;
      const initialBid = maxNumeric(txs.map((t: any) => t.bidNo), 0);
      const initialInvoice = maxNumeric(txs.map((t: any) => t.invoice), invoiceBase);
      const { data, error } = await adminDb.rpc("allocate_vds_transaction_numbers", {
        p_site: site, p_initial_bid: initialBid, p_initial_invoice: initialInvoice,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error("Nomor transaksi tidak berhasil dialokasikan.");
      return reply({ ok: true, bidNo: String(row.bid_no).padStart(2, "0"), invoice: String(row.invoice_no) });
    }

    if (action === "get-state" || action === "save-state") {
      const site = String(body.site || "");
      const actor = await requireSiteAccess(req, site);
      if (action === "get-state") {
        const { data, error } = await adminDb.from("app_state").select("payload,updated_at").eq("site", site).maybeSingle();
        if (error) throw error;
        return reply({ ok: true, state: data?.payload ?? null, updated_at: data?.updated_at ?? null });
      }
      const payload = body.state;
      if (!payload || typeof payload !== "object") return reply({ error: "Data state tidak valid." }, 400);
      // Atomic server-side merge: concurrent users may submit stale snapshots.
      // The SQL RPC unions transactions/history by id under the row lock, so a
      // transaction inserted by another user is never removed by a stale save.
      const { error } = await adminDb.rpc("merge_vds_app_state", {
        p_site: site,
        p_payload: payload,
        p_updated_by: actor.user.id,
      });
      if (error) throw error;

      // Publish only the transaction changed by the dedicated transaction form.
      // Other settings/state saves do not generate Realtime traffic.
      const syncEvent = body.sync_event;
      if (syncEvent && typeof syncEvent === "object" && syncEvent.transaction && syncEvent.history) {
        const tx = syncEvent.transaction;
        const hist = syncEvent.history;
        if (tx.id && hist.id) {
          const { error: eventError } = await adminDb.from("vds_sync_events").insert({
            site,
            event_payload: { transaction: tx, history: hist },
          });
          if (eventError) throw eventError;
        }
      }
      return reply({ ok: true });
    }

    return reply({ error: "Action tidak dikenal." }, 400);
  } catch (e) {
    return reply({ error: e?.message || "Terjadi kesalahan server." }, 400);
  }
});
