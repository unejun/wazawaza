// ============================================================
// wazawaza サイト設定 ── ここだけ書き換える
// ============================================================

const PASSWORD_ENABLED = true;
// ↑ サイト全体の公開スイッチ。true=全体を隠す（公開前の今）／false=全体公開

const LATEST = "001";
// ↑ ここに書いた番号が「本番トップ（wazawaza.tokyo）」に表示される最新作

const PROTECTED = [];
// ↑ 番号が入っていると【その作品だけ非公開】、空っぽ[]だと【全作品公開】
//    例: ["002"] で 002 だけ隠す。["002","003"] で 002 と 003 を同時に隠す

const PASSWORD = "waza2";

// ------------------------------------------------------------
// 運用手順（覚えておくこと）
//   ・公開する日        : PASSWORD_ENABLED を false にするだけ
//   ・002 を作り始める  : false のまま PROTECTED に "002" を足す（003も同時なら ["002","003"]）
//   ・002 を公開する    : LATEST を "002" に変え、PROTECTED から "002" を外す
//   ・注意              : LATEST に入れた作品は PROTECTED に入れない（トップが認証で止まるため）
// ============================================================


import { rewrite, next } from "@vercel/edge";

export const config = {
  // 静的アセット（画像・CSS・JS・動画・フォント等）は素通し（速度優先）
  matcher:
    "/((?!favicon.ico|.*\\.(?:svg|png|jpe?g|gif|webp|ico|css|js|mjs|json|woff2?|ttf|otf|mp4|webm)).*)",
};

export default function middleware(request) {
  const { pathname } = new URL(request.url);

  // 1) 公開前（PASSWORD_ENABLED = true）: サイト全体に Basic 認証
  if (PASSWORD_ENABLED) {
    if (!authorized(request)) return unauthorized();
  } else {
    // 2) 公開後: PROTECTED に入ったフォルダ（複数可）だけ Basic 認証で隠す
    const isProtected = PROTECTED.some(
      (w) => pathname === `/${w}` || pathname.startsWith(`/${w}/`)
    );
    if (isProtected && !authorized(request)) return unauthorized();
  }

  // 3) トップ "/" を最新作へリライト（URL は "/" のまま /LATEST/ を配信）
  if (pathname === "/") {
    return rewrite(new URL(`/${LATEST}/`, request.url));
  }

  // それ以外は素通し
  return next();
}

// --- Basic 認証まわり（通常ここは触らなくてよい） ---
function authorized(request) {
  const auth = request.headers.get("Authorization");
  if (!auth) return false;
  const [scheme, encoded] = auth.split(" ");
  if (scheme !== "Basic" || !encoded) return false;
  try {
    return atob(encoded).split(":").slice(1).join(":") === PASSWORD;
  } catch (e) {
    return false;
  }
}

function unauthorized() {
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="wazawaza preview"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
