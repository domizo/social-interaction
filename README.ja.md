# Social Interaction Lab

12種類のソーシャル操作アイコンを、4つの見た目と5つの動きで比較する React + TypeScript ライブラリと EN/JA 対応の Vite プレイグラウンドです。cartoon はアニメやカートゥーンを参考に、予備動作・つぶれと伸び・行き過ぎと収束・装飾エフェクトを加えます。

## 起動と検証

Node.js 22.12 以上の 22 系、24 系、26 系（対応する偶数リリース）と npm が必要です。

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
npm run verify:consumer
npm run verify:generated
npm run verify:archive
```

build はサイト `dist/`、ESM ライブラリ `package/`、インストール可能な `public/downloads/social-interaction-lab-react-0.4.0.tgz` を生成します。verify:archive は Git HEAD に記録されたファイルだけで新規インストール・ビルド・テストを行います。

SNS への投稿、SNS・AI サービスとの連携、アカウント連携、API キー、アクセス解析はありません。応答はすべてローカルのシミュレーションです。コメント・引用の下書き、選択状態、処理状態は現在の画面セッション内だけに保持され、再読み込みで消えます。名前付きの Studio プリセットだけは、このブラウザーの localStorage に保存され、削除またはブラウザーのデータ消去まで残ります。

## Studio で試す

1. **場面を選ぶ。** サンプルのソーシャルフィード、記事の末尾、固定の AI チャット回答を切り替えます。操作、EN/JA ラベル、見た目、トークン、動きを共有します。AI バックエンドはありません。トグル、コメント・引用のローカル下書き、サンプルの共有メニューを操作できます。
2. **設定を保存する。** 1〜12 操作を選び、編集したラベルを適用します。このブラウザーに最大20件の名前付きプリセットを保存でき、スキーマ v1 の JSON を入出力できます。読み込みは最大64 KBで、全項目が検証を通った場合だけ適用します。不正なファイルで現在の設定は変更されません。
3. **コードを持ち帰る。** import、制御トグル、ローカル入力フォーム、共有メニュー、任意の `onCommand` コールバックを含む `SocialActions.tsx` をコピー・ダウンロードできます。設定と両言語のラベルを含み、選択中の言語で表示します。Studio の画面全体を複製するものではありません。コピーに失敗した場合は選択可能なコードを表示します。
4. **時間と状態を調べる。** 12アイコン × 5表現を共通の再生エンジンでスクラブし、0.25×・0.5×・1×再生、約16.7 msのコマ送り、段階の目印で確認できます。別の比較では、いいね・保存の楽観的更新と成功後の更新を、失敗・再試行・中止、表示値と確定値で調べます。
5. **ひとつだけ変える。** デザインレンズは余白・アイコンサイズ・線幅から1変数だけを変え、ほかの設定をそろえます。操作領域、アイコン枠の幾何学的な中心、同じ行の横方向の間隔を表示します。美しさやアクセシビリティを自動判定する機能ではありません。

プリセットと書き出しに下書き・選択・処理状態・手動の動き抑制スイッチは含みません。生成コードは OS の動き抑制に対応します。保存領域を使えない場合はエラーを示し、保存成功とは表示しません。不正な保存済みデータは、明示的に消去するまで残します。検証条件と書き出し範囲は [Studio ガイド](docs/STUDIO.md)を参照してください。

## 別のアプリに組み込む

```sh
npm install ./social-interaction-lab-react-0.4.0.tgz
```

```tsx
import { LikeButton } from '@social-interaction-lab/react';
import '@social-interaction-lab/react/styles.css';

<LikeButton label="いいね" selected={liked}
  onClick={() => setLiked(!liked)} variant="soft" />
```

React 18.2 / 19 対応、ESM のみです。CSS は明示的に読み込みます。LikeButton は制御コンポーネントです。CommentButton・QuoteButton はダイアログ、ShareButton はメニューを開くことを支援技術に伝えます。利用側で実際のポップアップ、フォーカス移動・復帰、キーボード操作、aria-expanded / aria-controls を実装してください。動く実装例はソースの src/app/LiveActions.tsx にあります。

## 操作カタログ

- 選択状態を持つ制御トグル: `LikeButton`（いいね）、`BookmarkButton`（ブックマーク）、`NoteButton`（メモを保存）、`StarButton`（スター）、`BellButton`（ベル）
- コマンド: `CommentButton`（コメント）、`ShareButton`（共有）、`QuoteButton`（引用）、`RepostButton`（リポスト）、`SendButton`（送信）、`SparklesButton`（きらめき）、`ReactionButton`（リアクション）
- `ActionButton` と装飾用 SVG の `ActionIcon` で、同じ12種類の `SocialAction` を使えます
- `socialActions` / `toggleActions` / `isToggleAction` と EN/JA の `actionLabels` を公開し、カタログの実装に再利用できます

トグルの `selected` は `aria-pressed` に対応し、選択前後でアクセシブル名を変えません。`NoteButton` は付箋の形をした保存操作の別案です。プレイグラウンドでのラベルは「メモを保存」/ “Keep note” で、文章を入力するエディタではありません。Sparkles に AI 機能はなく、リポストや送信を含むすべての操作はローカルのシミュレーションです。

## アイコン自体を動かす

見た目の variant とは別に、`iconMotion="pulse"` / `"spring"` / `"trace"` / `"gesture"` / `"cartoon"` を選べます。`"none"` ならアイコンの動きを止めます。「動き」セクションで従来の4操作 × 5表現を比較し、時間・強さ・パーツの時間差を調整。別の12枚のカタログで、選んだ動きを全アイコンに適用して確認できます。カタログのプレビューはポップアップや外部サービスを起動しません。一括再生や処理中プレビューができ、選んだ動きは従来のローカル操作にも反映されます。

```tsx
<LikeButton label="いいね" selected={liked} iconMotion="cartoon"
  motionTokens={{ duration: 560, intensity: 1, stagger: 60 }}
  onClick={() => setLiked(value => !value)} />
```

cartoon では、ハートの小刻みな震えと拡大しながら消える輪郭を表現します。コメントは指定時間の最初の75%で、左下の小さな円から膨らみながら上がり、頂点で基本の吹き出しが完成します。最後の25%で落下し、着地時につぶれ、小さく跳ね返って静止します（初期値560 msでは420 ms＋140 ms）。リポストは従来どおり、元の長方形の経路に沿って一定長の矢印本体が移動します。他のアイコンも操作に合わせた動きを SVG 自体で表現します。心地よさの説明は文脈の中で検証する仮説です。

アイコンの時間は 0–1600 ms、強さは 0–2、パーツの時間差は 0–160 ms。開始時の動きは成功を意味しません。処理中はゆっくり反復し、静止した点と状態説明を残し、cartoon の追加バーストは表示しません。OS 設定と `reducedMotion` に対応し、動きがなくても状態を伝えます。装飾エフェクトも再生単位で中止され、操作領域の大きさは変わりません。詳しくは[動きの API・意図・制約](docs/MOTION.md)を参照してください。

Studio の時間軸は、単独の `ActionIcon` SVG を `createGlyphTimeline` が専有して再生します。動作中の `ActionButton` 内の SVG には接続しないでください。合計時間にはパーツの時間差も含みます。公開 API は [API ガイド](docs/API.md)を参照してください。

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

## 検証と配布

`verify:consumer` は新しい外部プロジェクトに tarball をインストールし、厳密な NodeNext 型検査、ESM の実行時 import、CSS を確認します。`verify:generated` はビルド済み tarball と既存の依存関係を使い、EN/JA・全操作・単独操作を含む6つの生成 TSX を型検査します。CI の設定は `.github/workflows/quality.yml` にあります。コマンドや CI の定義が存在することと、実行済み・成功済みであることは別です。ブラウザー検証の実施範囲と結果は [QA 記録](docs/QA.md)を参照してください。

private ソースと private デモです。公開ライセンス決定までは UNLICENSED。npm には公開していません。DOM テストはブラウザのレイアウトや実際の支援技術による確認を代替しません。
