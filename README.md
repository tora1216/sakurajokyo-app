# 桜上居株式会社 営業管理

営業担当者の月次実績・目標を管理するための社内向けアプリです。管理者は全体・担当者別の実績をダッシュボードで確認でき、営業担当者は自分の実績と目標を入力できます。

## 主な機能

- **管理者ダッシュボード**（`/admin`）: 年間実績・目標の集計、月次推移グラフ、担当者ランキング、担当者別の月次詳細
- **メンバー管理**（`/admin/members`）: 営業担当者の追加・削除、パスワードの再発行
- **営業担当ページ**（`/sales/[id]`）: ログイン中の担当者が自分の月次実績・目標を入力
- 営業担当はメールアドレス＋パスワードでログイン（Cookieセッション管理）
- 管理者ページはBasic認証で保護

## 技術構成

- [Next.js](https://nextjs.org)（App Router） / React / TypeScript
- Tailwind CSS
- データ保存先: [Firebase Firestore](https://firebase.google.com/docs/firestore)（Admin SDK経由、サーバー側のみでアクセス）

## セットアップ

依存パッケージをインストール:

```bash
npm install
```

`.env.local` を作成し、以下を設定します。

```bash
# 管理者ページのBasic認証
ADMIN_USER=
ADMIN_PASS=

# 営業担当ログインのセッション署名用シークレット（ランダムな文字列）
SESSION_SECRET=

# Firebase Admin SDK（Firebaseコンソール > プロジェクト設定 > サービスアカウント から取得）
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

開発サーバーを起動:

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) で確認できます。

## デプロイ

Vercelにデプロイする場合、上記の環境変数をVercelプロジェクトの Settings > Environment Variables にも登録してください（`.env.local` はデプロイに含まれません）。
