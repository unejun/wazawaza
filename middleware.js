// ==========================================================
// wazawaza LP パスワード保護（Vercel Edge Middleware）
// ==========================================================
// 【使い方】
//
// ・パスワード保護を「ON」にしたい時 → 下の PASSWORD_ENABLED を true に
// ・パスワード保護を「OFF」にしたい時（本番公開時） → false に
// ・変更したらGitHubにpushするだけで、Vercelが自動で反映します
//
// 【パスワード】
//   ユーザー名：何でもOK（空欄でも可）
//   パスワード：waza2
//
// ==========================================================


// 👇 ここを true / false で切り替えるだけ
const PASSWORD_ENABLED = false;

// 👇 パスワード（変更したい時はここを書き換える）
const PASSWORD = "waza2";

// ==========================================================


export const config = {
  // すべてのページに適用（静的アセットは除外）
  matcher: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf)).*)",
};

export default function middleware(request) {
  // パスワード保護がOFFならそのまま通す
  if (!PASSWORD_ENABLED) {
    return;
  }

  const auth = request.headers.get("Authorization");

  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      try {
        const decoded = atob(encoded);
        const colonIndex = decoded.indexOf(":");
        const password = decoded.slice(colonIndex + 1);
        if (password === PASSWORD) {
          // 認証成功 → 通す
          return;
        }
      } catch (e) {
        // デコード失敗 → 認証ダイアログを再表示
      }
    }
  }

  // 認証ダイアログを表示
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="wazawaza preview"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
