export const APP_VERSION = "1.4.0";

export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  changes: string[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.4.0",
    date: "2026-08-21",
    title: "データベースをFirebase Firestoreに移行",
    changes: [
      "営業担当・実績データの保存先をローカルJSONファイルからFirestoreに変更",
      "サーバー側のみでFirebase Admin SDKを使用し、既存の認証方式は変更なし",
    ],
  },
  {
    version: "1.3.0",
    date: "2026-08-20",
    title: "営業担当ログインをメール＋パスワード認証に変更",
    changes: [
      "営業担当はメールアドレスとパスワードでログインする方式に変更（名前選択方式を廃止）",
      "ログインセッションをCookieで管理し、他の担当者のページには直接アクセスできないよう制御",
      "パスワードはハッシュ化して保存（平文は保持しない）",
      "メンバー管理画面に、メールアドレス・パスワード欄を追加（パスワードは自動生成も選択可能）",
      "メンバー管理画面から既存メンバーのパスワードを再発行できる機能を追加",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-03-17",
    title: "初回リリース 🎉",
    changes: [
      "営業担当者の月次実績・目標の入力機能",
      "管理者ダッシュボード（全体集計・月次グラフ・担当者別詳細）",
      "担当者管理（追加・削除）",
      "管理者ページへのBasic認証",
      "レスポンシブ対応",
    ],
  },
];
