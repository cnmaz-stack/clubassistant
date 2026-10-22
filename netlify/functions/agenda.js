// Crée un événement dans l'agenda Google du club à chaque nouvelle demande de réparation.
const crypto = require("crypto");
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");

async function googleToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: "RS256", typ: "JWT" });
  const claim = b64({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/calendar.events", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 });
  const sig = crypto.createSign("RSA-SHA256").update(head + "." + claim).sign(sa.private_key, "base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: head + "." + claim + "." + sig }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("Jeton Google refusé : " + JSON.stringify(j));
  return j.access_token;
}

exports.handler = async (ev) => {
  if (ev.httpMethod !== "POST") return { statusCode: 405, body: "POST uniquement" };
  let id; try { id = JSON.parse(ev.body).id; } catch (e) {}
  if (!/^[0-9a-f-]{36}$/i.test(id || "")) return { statusCode: 400, body: "id invalide" };
  const { SUPABASE_URL: U, SUPABASE_SERVICE_KEY: K, GOOGLE_SERVICE_ACCOUNT_JSON: G } = process.env;
  const cal = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID || "contact@cnmaz.fr");
  const H = { apikey: K, Authorization: "Bearer " + K, "Content-Type": "application/json" };
  try {
    const rows = await (await fetch(`${U}/rest/v1/problemes?id=eq.${id}&select=*`, { headers: H })).json();
    const p = rows[0];
    if (!p) return { statusCode: 404, body: "problème inconnu" };
    if (p.agenda_id) return { statusCode: 200, body: "déjà envoyé" };
    const day = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
    const nx = new Date(day + "T12:00:00Z"); nx.setUTCDate(nx.getUTCDate() + 1);
    const tok = await googleToken(JSON.parse(G));
    const r = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${cal}/events`, {
      method: "POST", headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" },
      body: JSON.stringify({ summary: `Réparation à faire : ${p.type} n°${p.numero}`, description: p.commentaire, start: { date: day }, end: { date: nx.toISOString().slice(0, 10) } }),
    });
    const e = await r.json();
    if (!e.id) throw new Error(JSON.stringify(e));
    await fetch(`${U}/rest/v1/problemes?id=eq.${id}`, { method: "PATCH", headers: H, body: JSON.stringify({ agenda_id: e.id }) });
    return { statusCode: 200, body: "ok" };
  } catch (e) { return { statusCode: 500, body: String(e.message || e) }; }
};
