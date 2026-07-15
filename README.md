# 立教大学交響楽団サイト

立教大学交響楽団の公式サイト用トップページ雛形です。参考サイトの情報設計をもとに、公開しやすい静的サイト構成に整理しています。

## ファイル構成

- `index.html` - トップページ本体
- `styles.css` - 全体スタイル
- `assets/` - 写真、ロゴ、ファビコンなどを置くフォルダ
- `content/news/` - 新着情報（1記事につき1つのMarkdownファイル）
- `content/concerts.json` - 最新・過去の公演情報
- `.pages.yml` - Pages CMSの入力画面設定
- `scripts/build-content.mjs` - コンテンツからHTMLを生成する処理

## 新着情報・公演情報の更新

新着情報は `content/news/`、公演情報は `content/concerts.json` を編集します。HTMLへ反映するには、プロジェクトのフォルダで次を実行します。

```bash
npm run build
```

`index.html`、`news.html`、`concerts.html`、`concerts-archive.html` と新着情報の詳細ページが自動更新されます。`content:*:start` と `content:*:end` で囲まれたHTMLは、生成時に上書きされるため直接編集しないでください。

GitHubへCMSの変更が保存された場合は、`.github/workflows/build-content.yml` が同じ生成処理を自動実行します。通常の更新担当者はHTMLを直接編集する必要がありません。

## ローカル確認方法

ブラウザで `index.html` を直接開くと確認できます。

## GitHub に載せる手順

```bash
cd rikkyo-orchestra-site
git init
git add .
git commit -m "Initial site scaffold"
```

その後、GitHub で新しいリポジトリを作成し、表示された手順に従って `remote` を追加してください。

## レンタルサーバーへアップロードするもの

静的サイトとして、そのまま以下をアップロードできます。

- `index.html`
- `styles.css`
- `assets/` 配下の画像やロゴ

多くのレンタルサーバーでは、これらを `public_html` や `www` 配下に置けば表示できます。

## 次に差し替えるとよい項目

- 公演日程
- 曲目
- 問い合わせメールアドレス
- 実際の団員数や創立年
- ヒーロー画像、演奏会写真、ロゴ
