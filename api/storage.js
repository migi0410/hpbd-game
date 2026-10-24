/**
 * ============================================================================
 * VERCEL SERVERLESS DATABASE API (/api/storage)
 * Tự động lưu & đồng bộ dữ liệu chỉnh sửa giữa mọi thiết bị (Điện thoại & Máy tính)
 * Hỗ trợ đa tầng:
 *   1. Vercel KV / Upstash Redis (nếu có biến môi trường KV_REST_API_URL)
 *   2. Cloud DB mặc định tích hợp sẵn (KeyValue + Bytebin + Ntfy Realtime) — hoạt động ngay 100% không cần cấu hình!
 * ============================================================================
 */

const KV_APP_KEY = "1ksr18he";
const KV_PTR_KEY = "hpbd_ptr_v4";
const NTFY_TOPIC = "hpbd_galaxy_3d_migi0410_v4";

async function saveToBuiltInCloudDb(stateObj) {
  // 1. Lưu toàn bộ JSON state lên Bytebin Cloud Store
  const postRes = await fetch("https://bytebin.lucko.me/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "BirthdayGalaxy3D/3.0"
    },
    body: JSON.stringify(stateObj)
  });

  if (!postRes.ok) {
    throw new Error(`Bytebin POST failed: ${postRes.status}`);
  }

  const { key: blobKey } = await postRes.json();
  if (!blobKey) throw new Error("Missing blobKey from Bytebin");

  // 2. Lưu con trỏ blobKey vĩnh viễn vào KeyValue DB
  await fetch(
    `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${KV_APP_KEY}/${KV_PTR_KEY}/${encodeURIComponent(blobKey)}`,
    { method: "POST" }
  ).catch(() => {});

  // 3. Phát tín hiệu đồng bộ thời gian thực (Realtime Pub/Sub) qua Ntfy
  await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
    method: "POST",
    headers: { "Title": "hpbd-db-sync" },
    body: JSON.stringify({
      blobKey,
      updatedAt: stateObj.updatedAt || Date.now()
    })
  }).catch(() => {});

  globalThis.__HPBD_LAST_BLOB_KEY = blobKey;
  globalThis.__HPBD_LAST_STATE = stateObj;
  return blobKey;
}

async function loadFromBuiltInCloudDb() {
  let blobKey = null;

  // 1. Đọc con trỏ mới nhất từ KeyValue DB
  try {
    const kvRes = await fetch(
      `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${KV_APP_KEY}/${KV_PTR_KEY}`,
      { cache: "no-store" }
    );
    if (kvRes.ok) {
      const raw = await kvRes.text();
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "string" && parsed !== "null") {
        blobKey = parsed;
      }
    }
  } catch (_) {}

  // 2. Dự phòng: Kiểm tra tin nhắn đồng bộ gần nhất trên Ntfy
  if (!blobKey) {
    try {
      const ntfyRes = await fetch(`https://ntfy.sh/${NTFY_TOPIC}/json?poll=1`, {
        cache: "no-store"
      });
      if (ntfyRes.ok) {
        const text = await ntfyRes.text();
        const lines = text.trim().split("\n").filter(Boolean);
        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            const evt = JSON.parse(lines[i]);
            if (evt && evt.message) {
              const msg = JSON.parse(evt.message);
              if (msg && msg.blobKey) {
                blobKey = msg.blobKey;
                break;
              }
            }
          } catch (_) {}
        }
      }
    } catch (_) {}
  }

  if (!blobKey && globalThis.__HPBD_LAST_BLOB_KEY) {
    blobKey = globalThis.__HPBD_LAST_BLOB_KEY;
  }

  if (blobKey) {
    const blobRes = await fetch(`https://bytebin.lucko.me/${encodeURIComponent(blobKey)}`, {
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });
    if (blobRes.ok) {
      const data = await blobRes.json();
      if (data && typeof data === "object") {
        globalThis.__HPBD_LAST_STATE = data;
        return data;
      }
    }
  }

  return globalThis.__HPBD_LAST_STATE || null;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    if (req.method === "GET") {
      // Ưu tiên 1: Vercel KV / Upstash Redis nếu có cấu hình
      if (kvUrl && kvToken) {
        const r = await fetch(`${kvUrl}/get/BIRTHDAY_GALAXY_STATE_V3`, {
          headers: { Authorization: `Bearer ${kvToken}` },
          cache: "no-store"
        });
        if (r.ok) {
          const j = await r.json();
          if (j && j.result) {
            const state = typeof j.result === "string" ? JSON.parse(j.result) : j.result;
            return res.status(200).json({ ok: true, provider: "vercel-kv", state });
          }
        }
      }

      // Ưu tiên 2: Cloud DB mặc định tích hợp sẵn
      const cloudState = await loadFromBuiltInCloudDb();
      return res.status(200).json({
        ok: true,
        provider: "cloud-db",
        state: cloudState
      });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body || typeof body !== "object") {
        return res.status(400).json({ ok: false, error: "Invalid payload" });
      }
      if (!body.updatedAt) body.updatedAt = Date.now();

      // Lưu vào Vercel KV nếu có
      if (kvUrl && kvToken) {
        await fetch(`${kvUrl}/set/BIRTHDAY_GALAXY_STATE_V3`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${kvToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }).catch(() => {});
      }

      // Luôn đồng bộ vào Cloud DB tích hợp sẵn để mọi máy nhận ngay lập tức
      const blobKey = await saveToBuiltInCloudDb(body);
      return res.status(200).json({
        ok: true,
        provider: "cloud-db",
        blobKey,
        updatedAt: body.updatedAt
      });
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
};
