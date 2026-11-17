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
function isAdmin(profile: any) { return String(profile?.role || "").toLowerCase() === "admin" && profile.active !== false; }
async function requireAdmin(req: Request) {
  const actor = await getActor(req);
  if (!isAdmin(actor.profile)) throw new Error("Aksi ini hanya boleh dilakukan Admin.");
  return actor;
}
async function requireSiteAccess(req: Request, site: string) {
  const actor = await getActor(req);
  if (!["bidding", "dana", "sponsor"].includes(site)) throw new Error("Website tidak valid. Identitas website tidak dikenali oleh API.");
  const permissions = actor.profile.permissions || {};
  const allowed = site === "bidding" ? permissions.siteBidding === true
    : site === "dana" ? permissions.siteDana === true
    : (permissions.siteSponsor === true || permissions.siteBidding === true || permissions.siteDana === true);
  if (!isAdmin(actor.profile) && !allowed)
    throw new Error("Tidak memiliki akses ke website ini.");
  return actor;
}

function normalizeSite(body: any): string {
  const raw = body?.site ?? body?.site_id ?? body?.website ?? body?.website_id ?? "";
  const value = String(raw).trim().toLowerCase().replace(/[\s_-]+/g, " ").replace(/\s+/g, " ");
  if (["bidding", "website bidding", "website 1", "1"].includes(value)) return "bidding";
  if (["dana", "dana paramita", "website dana", "website 2", "2"].includes(value)) return "dana";
  if (["sponsor", "sponsors", "data sponsor", "data sponsor barang", "sponsor data", "website sponsor", "website 3", "3"].includes(value)) return "sponsor";
  return "";
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
        permissions: { siteBidding: true, siteDana: true, siteSponsor: true },
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
        permissions: role === "admin" ? { siteBidding: true, siteDana: true, siteSponsor: true } : permissions,
        must_change_password: true,
      }, { onConflict: "id" });
      if (pErr) throw pErr;
      return reply({ ok: true, username, temporary_password: password, must_change_password: true });
    }

    if (action === "update-user") {
      const actor = await requireAdmin(req);
      const id = String(body.id || "");
      const updates: any = {};
      if (!id) return reply({ error: "User ID wajib diisi." }, 400);
      if (typeof body.active === "boolean") updates.active = body.active;
      if (body.permissions && typeof body.permissions === "object") updates.permissions = body.permissions;
      if (body.username !== undefined) {
        const username = String(body.username || "").trim().toLowerCase();
        if (!validUsername(username)) return reply({ error: "Username harus 3–24 karakter: huruf, angka, titik, _ atau -." }, 400);
        if (id === actor.user.id || username === "septino") return reply({ error: "Username akun Admin utama atau akun yang sedang digunakan tidak dapat diubah dari menu ini." }, 403);
        const { data: target, error: targetErr } = await adminDb.from("profiles").select("id,username,role").eq("id", id).single();
        if (targetErr || !target) return reply({ error: "Akun tidak ditemukan." }, 404);
        if (String(target.role).toLowerCase() === "admin") return reply({ error: "Username akun Admin tidak dapat diubah dari menu User." }, 403);
        const { data: duplicate, error: dupErr } = await adminDb.from("profiles").select("id").eq("username", username).neq("id", id).limit(1);
        if (dupErr) throw dupErr;
        if (duplicate?.length) return reply({ error: "Username sudah digunakan." }, 409);
        const { error: authErr } = await adminDb.auth.admin.updateUserById(id, {
          email: internalEmail(username), user_metadata: { username }, email_confirm: true,
        });
        if (authErr) throw authErr;
        updates.username = username;
      }
      if (Object.keys(updates).length) {
        const { error } = await adminDb.from("profiles").update(updates).eq("id", id);
        if (error) throw error;
      }
      return reply({ ok: true });
    }

    if (action === "delete-user") {
      const actor = await requireAdmin(req);
      const id = String(body.id || "");
      if (!id) return reply({ error: "User ID wajib diisi." }, 400);
      if (id === actor.user.id) return reply({ error: "Anda tidak dapat menghapus akun yang sedang digunakan." }, 403);
      const { data: target, error: targetErr } = await adminDb.from("profiles").select("id,username,role").eq("id", id).single();
      if (targetErr || !target) return reply({ error: "Akun tidak ditemukan." }, 404);
      if (String(target.username || "").toLowerCase() === "septino" || String(target.role || "").toLowerCase() === "admin")
        return reply({ error: "Akun Admin dilindungi dan tidak dapat dihapus dari menu ini." }, 403);
      const { error } = await adminDb.auth.admin.deleteUser(id);
      if (error) throw error;
      return reply({ ok: true, deleted_username: target.username });
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
      const site = normalizeSite(body);
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

    if (action === "get-sync-events") {
      const site = normalizeSite(body);
      await requireSiteAccess(req, site);
      const afterId = Math.max(0, Number(body.after_id || 0));
      const { data, error } = await adminDb.from("vds_sync_events")
        .select("id,site,event_payload,created_at")
        .eq("site", site).gt("id", afterId).order("id", { ascending: true }).limit(100);
      if (error) throw error;
      return reply({ ok: true, events: data || [] });
    }

    if (action === "get-shared-inventory" || action === "save-shared-inventory" || action === "admin-save-shared-inventory") {
      const site = normalizeSite(body);
      if (site !== "bidding" && site !== "dana")
        return reply({ error: "Fitur stok hanya tersedia untuk Website Bidding dan Dana Paramita." }, 400);
      await requireSiteAccess(req, site);
      // Inventory snapshots are isolated by website. Both sites use the same
      // table, but each query and insert is scoped to its own site identifier.
      if (action === "get-shared-inventory") {
        const { data, error } = await adminDb.from("vds_sync_events")
          .select("event_payload").eq("site", site)
          .contains("event_payload", { kind: "site_inventory_snapshot", site })
          .order("id", { ascending: false }).limit(1).maybeSingle();
        if (error) throw error;
        const inventory = data?.event_payload?.inventory;
        return reply({ ok: true, inventory: inventory && typeof inventory === "object"
          ? inventory : { items: [], returns: [], additions: [] } });
      }
      const actor = await getActor(req);
      if (action === "admin-save-shared-inventory" && String(actor.profile?.role || "").toLowerCase() !== "admin")
        return reply({ error: "Hanya Admin yang dapat mengedit atau menghapus riwayat barang." }, 403);
      const incoming = body.inventory;
      if (!incoming || typeof incoming !== "object" || !Array.isArray(incoming.items) || !Array.isArray(incoming.returns))
        return reply({ error: "Format data barang tidak valid." }, 400);
      if (incoming.items.length > 5000 || incoming.returns.length > 20000)
        return reply({ error: "Jumlah data barang melebihi batas." }, 400);
      const additions = Array.isArray(incoming.additions) ? incoming.additions : [];
      if (additions.length > 20000) return reply({ error: "Jumlah riwayat barang masuk melebihi batas." }, 400);
      const cleanInventory = {
        items: incoming.items.map((item: any) => ({ ...item, site })),
        returns: incoming.returns.map((item: any) => ({ ...item, site })),
        additions: additions.map((item: any) => ({ ...item, site })),
        updated_at: new Date().toISOString(),
        updated_by: String(actor.profile.username || ""),
        site
      };
      const { error } = await adminDb.from("vds_sync_events").insert({
        site,
        event_payload: { kind: "site_inventory_snapshot", site, inventory: cleanInventory }
      });
      if (error) throw error;
      return reply({ ok: true, inventory: cleanInventory });
    }

    if (action === "admin-clear-testing-data") {
      const site = normalizeSite(body);
      if (site !== "bidding" && site !== "dana")
        return reply({ error: "Website tidak valid." }, 400);
      const actor = await requireSiteAccess(req, site);
      if (!isAdmin(actor.profile))
        return reply({ error: "Hanya Admin yang dapat menghapus data testing." }, 403);

      // Read current cloud payload, preserving master data and all settings.
      const { data: current, error: readError } = await adminDb.from("app_state")
        .select("payload").eq("site", site).maybeSingle();
      if (readError) throw readError;
      if (!current?.payload || typeof current.payload !== "object")
        return reply({ error: "Data website tidak ditemukan; penghapusan dibatalkan." }, 404);

      const payload: Record<string, any> = { ...current.payload };
      payload.transactions = [];
      payload.history = [];
      // Reset bidding counters while retaining the master item and stock values.
      if (Array.isArray(payload.items)) {
        payload.items = payload.items.map((item: any) => ({
          ...item, bid: 0, sum: 0, return: null,
          remain: Number(item.remain ?? item.stock ?? 0)
        }));
      }
      payload._testing_reset_at = new Date().toISOString();

      // Clear old replayable transaction events. Keep only the newest inventory snapshot.
      const { data: snapshots, error: snapshotReadError } = await adminDb.from("vds_sync_events")
        .select("event_payload").eq("site", site)
        .contains("event_payload", { kind: "site_inventory_snapshot", site })
        .order("id", { ascending: false }).limit(1);
      if (snapshotReadError) throw snapshotReadError;
      const { error: deleteEventsError } = await adminDb.from("vds_sync_events")
        .delete().eq("site", site);
      if (deleteEventsError) throw deleteEventsError;
      if (snapshots?.[0]?.event_payload) {
        const { error: restoreSnapshotError } = await adminDb.from("vds_sync_events").insert({
          site, event_payload: snapshots[0].event_payload
        });
        if (restoreSnapshotError) throw restoreSnapshotError;
      }

      // Direct UPDATE deliberately bypasses merge_vds_app_state array-union behavior.
      const { data: saved, error: saveError } = await adminDb.from("app_state")
        .update({ payload, updated_by: actor.user.id, updated_at: new Date().toISOString() })
        .eq("site", site).select("payload").single();
      if (saveError) throw saveError;
      const txCount = Array.isArray(saved?.payload?.transactions) ? saved.payload.transactions.length : -1;
      const historyCount = Array.isArray(saved?.payload?.history) ? saved.payload.history.length : -1;
      const resetAt = saved?.payload?._testing_reset_at;
      if (txCount !== 0 || historyCount !== 0 || !resetAt)
        throw new Error("Verifikasi reset gagal: data cloud belum kosong.");

      return reply({ ok: true, site, reset_at: resetAt, transactions: txCount, history: historyCount,
        message: "Data testing berhasil dihapus dan diverifikasi langsung dari database." });
    }

    if (action === "admin-clear-all-operational-data") {
      const site = normalizeSite(body);
      if (site !== "bidding" && site !== "dana")
        return reply({ error: "Website tidak valid." }, 400);
      await requireSiteAccess(req, site);
      const actor = await getActor(req);
      if (String(actor.profile?.role || "").toLowerCase() !== "admin")
        return reply({ error: "Hanya Admin yang dapat menghapus seluruh data operasional." }, 403);

      const { data: current, error: readError } = await adminDb.from("app_state")
        .select("payload").eq("site", site).maybeSingle();
      if (readError) throw readError;
      if (!current?.payload || typeof current.payload !== "object")
        return reply({ error: "Data website tidak ditemukan; penghapusan dibatalkan." }, 404);

      // Preserve every unrelated setting/configuration field; clear only known operational datasets.
      const payload: Record<string, any> = { ...current.payload };
      for (const key of ["prices", "items", "transactions", "history", "sponsors"]) {
        if (Array.isArray(payload[key])) payload[key] = [];
      }
      if (Array.isArray(payload.rincian)) {
        payload.rincian = payload.rincian.map((row: any) =>
          row && typeof row === "object" ? { ...row, value: 0 } : row
        );
      }

      const { error: saveError } = await adminDb.from("app_state").upsert({
        site,
        payload,
        updated_by: actor.user.id,
        updated_at: new Date().toISOString()
      }, { onConflict: "site" });
      if (saveError) throw saveError;

      // This table contains both transaction sync events and inventory snapshots.
      // Remove the old operational event stream so a newly opened browser cannot replay old bids.
      const { error: eventsDeleteError } = await adminDb.from("vds_sync_events")
        .delete().eq("site", site);
      if (eventsDeleteError) throw eventsDeleteError;

      // Inventory is stored as append-only snapshots in vds_sync_events.
      // Write one empty snapshot so the latest state contains no stock or inventory history.
      const emptyInventory = {
        items: [], returns: [], additions: [],
        updated_at: new Date().toISOString(),
        updated_by: String(actor.profile.username || ""),
        site
      };
      const { error: inventoryError } = await adminDb.from("vds_sync_events").insert({
        site,
        event_payload: { kind: "site_inventory_snapshot", site, inventory: emptyInventory }
      });
      if (inventoryError) throw inventoryError;

      return reply({ ok: true, site, message: "Seluruh data operasional dihapus; pengaturan dan akun dipertahankan." });
    }

    if (action === "get-state" || action === "save-state") {
      const site = normalizeSite(body);
      const actor = await requireSiteAccess(req, site);
      if (action === "get-state") {
        const { data, error } = await adminDb.from("app_state").select("payload,updated_at").eq("site", site).maybeSingle();
        if (error) throw error;
        return reply({ ok: true, state: data?.payload ?? null, updated_at: data?.updated_at ?? null });
      }
      let payload = body.state;
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
