# Social Interaction Lab

いいね・コメント・共有・引用を、4つのオリジナルな表現で比較する React + TypeScript ライブラリと EN/JA 対応の Vite プレイグラウンドです。

## 起動と検証

Node.js 22.12 以上の 22 系、24 系、26 系（対応する偶数リリース）と npm が必要です。

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
npm run verify:consumer
npm run verify:archive
```

build はサイト `dist/`、ESM ライブラリ `package/`、インストール可能な `public/downloads/social-interaction-lab-react-0.2.0.tgz` を生成します。verify:archive は Git HEAD に記録されたファイルだけで新規インストール・ビルド・テストを行います。

SNS への投稿、アカウント連携、API キー、アクセス解析はありません。応答はすべてローカルのシミュレーションです。保存したコメント・引用は現在の画面セッション内のみ保持され、再読み込みで消えます。

## 別のアプリに組み込む

```sh
npm install ./social-interaction-lab-react-0.2.0.tgz
```

```tsx
import { LikeButton } from '@social-interaction-lab/react';
import '@social-interaction-lab/react/styles.css';

<LikeButton label="いいね" selected={liked}
  onClick={() => setLiked(!liked)} variant="soft" />
```

React 18.2 / 19 対応、ESM のみです。CSS は明示的に読み込みます。LikeButton は制御コンポーネントです。CommentButton・QuoteButton はダイアログ、ShareButton はメニューを開くことを支援技術に伝えます。利用側で実際のポップアップ、フォーカス移動・復帰、キーボード操作、aria-expanded / aria-controls を実装してください。動く実装例はソースの src/app/LiveActions.tsx にあります。

## アイコン自体を動かす

見た目の variant とは別に、`iconMotion="pulse"` / `"spring"` / `"trace"` / `"gesture"` を選べます。「動き」セクションで4操作 × 4表現を比較し、時間・強さ・パーツの時間差を調整。一括再生や処理中プレビューができ、選んだ動きは実際のローカル操作にも反映されます。

```tsx
<LikeButton label="いいね" selected={liked} iconMotion="gesture"
  motionTokens={{ duration: 560, intensity: 1, stagger: 60 }}
  onClick={() => setLiked(value => !value)} />
```

ハートの弾み、吹き出しの膨らみ、共有矢印の発射、引用符の時間差などを SVG 自体で表現します。開始時の動きは成功を意味しません。処理中はゆっくり反復し、静止した点と状態説明も残ります。OS 設定と `reducedMotion` に対応。詳しくは[動きの API・意図・制約](docs/MOTION.md)を参照してください。

## 状態と非同期処理

`useAsyncAction<T>()` は run / cancel / reset と status / value / error を返します。1つの hook は1つの操作を所有し、処理中の重複開始を無視します。中止・アンマウント後の古い応答は反映しません。AbortSignal を受け取る処理を渡してください。UI の中止がサーバー側の変更を取り消すわけではありません。

## 設計と運用

- `src/lib/tokens.ts` を共通のトークン定義にし、部品・見本・調整 UI・DTCG 出力に使います
- minimal / soft / solid / spring の4種類。印象の説明は、万人に通じる美の法則ではなく検証する仮説です
- アイコンの大きさと線幅は独立。操作領域の最小44 px は設計上の選択です
- WCAG 2.2 の AA 2.5.8 は最小24 × 24 CSS px で、規定の例外があります
- DTCG 2025.10 はコミュニティグループの仕様で、W3C 勧告ではありません
- 動きを抑える OS 設定に対応。アクセント色変更時はコントラストを再確認してください
- [API](docs/API.md)、[設計](docs/DESIGN.md)、[アクセシビリティ](docs/ACCESSIBILITY.md)、[貢献手順](CONTRIBUTING.md)、[変更履歴](CHANGELOG.md)

private ソースと private デモです。公開ライセンス決定までは UNLICENSED。npm には公開していません。DOM テストはブラウザのレイアウトや実際の支援技術による確認を代替しません。
