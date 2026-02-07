# 設計調査システム - 開発ルール

## プロジェクト概要
株式会社Gハウスの役所調査・見積管理システム。
Next.js 16 (App Router) + Supabase + Drizzle ORM。

## Next.js 開発ルール（必須遵守）

### TypeScript
- **絶対に `any` を使わない** - `unknown` + type guard、具体的な型、ジェネリクスを使う
- `@typescript-eslint/no-explicit-any` が有効

### Server Components vs Client Components
- **デフォルトはServer Component** - `'use client'` は hooks/event handlers/ブラウザAPI が必要な場合のみ
- Server Componentで直接 async/await、DB アクセス可能
- **`<Link>` と `redirect()` はServer Componentで使用可能** - `'use client'` 不要
- `useRouter()`, `usePathname()`, `useSearchParams()` は Client Component のみ

### params / searchParams (Next.js 15+)
- `params` と `searchParams` は **Promise** - 必ず `await` する
- `params: Promise<{ id: string }>` → `const { id } = await params;`
- searchParamsのインライン: `const q = (await searchParams).q || '';`

### useSearchParams
- **必ず `'use client'` AND `<Suspense>` の両方が必要**
- 2ファイルパターン推奨: Parent(Server) が Suspense で wrap → Child(Client) が useSearchParams

### データフェッチ
- Client ComponentでuseEffectによるデータフェッチ **禁止** → Server Componentを使う
- 並列フェッチは `Promise.all` を使う（ウォーターフォール回避）

### Server Actions
- form action で使う Server Actions は **void を返す**（return文なし）
- UIフィードバックが必要なら `useActionState` を使う
- `'use server'` と `'use client'` を **同一ファイルに混在させない**

### ルーティング
- ルートを過度にネストしない - デフォルトは `app/[id]/page.tsx`
- 明示的に指定がない限り `app/products/[id]` のようにネストしない
- metadata は `next/head` ではなく `metadata` export を使う

### Cookie
- Client Component から Cookie を設定する場合は2ファイルパターン
  - File 1: Client Component (onClick handler)
  - File 2: Server Action (`'use server'` + `cookies()`)

## ディレクトリ構成
```
src/
├── app/              # ページ・API Routes
│   ├── (auth)/       # 認証グループ
│   ├── (dashboard)/  # メイン画面グループ
│   └── api/          # API Routes
├── components/       # UIコンポーネント
│   ├── ui/           # shadcn/ui
│   └── ...           # アプリ固有
├── db/               # Drizzle ORM
│   ├── schema.ts     # テーブル定義
│   └── index.ts      # DB接続
├── lib/              # ユーティリティ
│   ├── utils.ts      # cn(), formatCurrency()等
│   └── auth.ts       # better-auth設定
└── types/            # 型定義
```

## コマンド
- `npm run dev` - 開発サーバー
- `npm run build` - ビルド
- `npx drizzle-kit generate` - マイグレーション生成
- `npx drizzle-kit push` - DB反映
