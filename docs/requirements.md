# 役所調査・見積管理システム 要件定義書

## 1. プロジェクト概要

### 1.1 システム名
役所調査・見積管理システム（設計調査システム）

### 1.2 発注元
株式会社Gハウス

### 1.3 目的
注文住宅の新築工事における役所調査業務と見積作成業務を効率化するWebアプリケーション。
現在Excel（役所調査書＿見積＿おうちづくりスケジュール.xlsx）で管理している以下の業務をシステム化する：

1. **都道府県・市区町村ごとの調査項目マスタ管理**
2. **案件（プロジェクト）単位での調査項目選択・入力**
3. **見積金額の自動計算**（原価→売価変換）
4. **役所調査書・見積書のExcel出力**（既存フォーマット準拠）

### 1.4 対象ユーザー
- 株式会社Gハウスの設計担当者・営業担当者（5〜10名程度）

---

## 2. 技術スタック

| カテゴリ | 技術 | バージョン |
|---|---|---|
| フレームワーク | Next.js (App Router) | 16 |
| UI ライブラリ | React | 19 |
| CSS | Tailwind CSS | 4 |
| UIコンポーネント | shadcn/ui | latest |
| データベース | PostgreSQL (Supabase) | - |
| ORM | Drizzle ORM | latest |
| 認証 | better-auth | latest |
| エラー監視 | Sentry | latest |
| Excel出力 | exceljs | latest |
| 言語 | TypeScript | 5.x |

---

## 3. 機能要件

### 3.1 マスタ管理

#### 3.1.1 都道府県マスタ
- 対象都道府県の登録・管理（初期データ: 25滋賀県, 26京都府, 27大阪府, 28兵庫県, 29奈良県, 30和歌山県）
- 都道府県コード・名称の管理

#### 3.1.2 市区町村マスタ
- 各都道府県に属する市区町村の管理
- 郵便番号データとの紐付け（住所自動補完用）

#### 3.1.3 調査項目マスタ
各市区町村に紐づく調査項目（申請業務）のマスタデータ。

**データ項目:**

| フィールド | 説明 | 例 |
|---|---|---|
| 都道府県 | 所属都道府県 | 大阪府 |
| 市区町村 | 対象市区町村 | 高槻市 |
| 摘要 | 調査項目名称 | 高槻市事前経由・調査報告書発行依頼業務 |
| 数量 | デフォルト数量 | 1 |
| 単位 | 単位 | 式 |
| 原価 | 原価（税抜） | 30,000円 |
| 金額 | 原価×数量 | 30,000円 |
| お客様出し（売価） | 顧客提示価格 | 50,000円 |
| 着工前＋日数 | 着工前に必要な日数 | （未入力の場合あり） |

**初期データ件数（Excelより）:**
- 25滋賀県: 338行
- 26京都府: 324行
- 27大阪府: 146行
- 28兵庫県: 310行
- 29奈良県: 320行
- 30和歌山県: 338行

#### 3.1.4 共通調査項目マスタ
全プロジェクト共通で使用する調査項目（都道府県に依存しないもの）。

**例:**
- 確認申請業務
- 長期優良住宅申請業務（共通部分）
- 建築確認検査手数料
- フラット35適合証明
- 省エネ届出
- 埋蔵文化財届出

### 3.2 プロジェクト管理

#### 3.2.1 プロジェクト作成
新規案件（物件）の登録。

**入力項目:**

| フィールド | 必須 | 説明 |
|---|---|---|
| 物件名称 | ○ | 例: Gハウス太郎様邸　新築工事 |
| 建築地（都道府県） | ○ | プルダウン選択 |
| 建築地（市区町村） | ○ | 都道府県に連動したプルダウン |
| 建築地（地番） | - | 自由入力 |
| 住居表示 | - | 自由入力 |
| 敷地面積 | - | ㎡ |
| 建物規模 | - | 自由入力 |
| 都市計画区域 | - | 自由入力 |
| 防火指定 | - | プルダウン（準防火地域/防火地域/法22条地域/指定なし） |
| 用途地域 | - | プルダウン |
| 建蔽率 | - | ％ |
| 容積率 | - | ％ |
| 担当者 | ○ | ログインユーザーから選択 |
| 作成日 | ○ | 自動設定（変更可） |
| 顧客名 | - | 見積書の宛先 |
| ステータス | ○ | 作成中/調査中/見積済/完了 |

#### 3.2.2 プロジェクト一覧
- 一覧表示（ページネーション）
- ステータスフィルタ
- 物件名・顧客名での検索
- 作成日順ソート

#### 3.2.3 プロジェクト詳細・編集
- プロジェクト基本情報の表示・編集
- 調査項目の選択・編集（後述 3.3）
- 見積プレビュー
- Excel出力ボタン

### 3.3 調査項目入力

#### 3.3.1 調査項目の自動取得
プロジェクトの建築地（都道府県・市区町村）を選択すると、該当する調査項目マスタから候補を自動取得。

**フロー:**
1. 都道府県選択 → 市区町村プルダウン更新
2. 市区町村選択 → 該当する調査項目一覧を表示
3. 各項目のチェックボックスで採用/不採用を選択
4. 採用した項目がプロジェクトの調査項目として登録

#### 3.3.2 調査項目の個別編集
- 数量の変更
- 原価の変更（マスタと異なる場合）
- 備考の追加
- 手動項目の追加（マスタにない項目を自由入力）

#### 3.3.3 役所調査原本フォーム
Excelの「役所調査原本」シートに対応する入力フォーム。

**セクション構成:**

| セクション | 入力項目 |
|---|---|
| 基本情報 | 物件名称、建築地（地番/住居表示）、敷地面積、建物規模 |
| 都市計画 | 都市計画区域、防火指定、用途地域、高度地区、建蔽率、容積率 |
| 各種区域等 | 地区計画、建築協定、景観、埋蔵文化財（各備考欄付き） |
| 接続道路 | 最大3本（道路種別、路線名/指定年月日、性格、幅員、明示）|
| インフラ | 公共下水道、水道、ガス（各備考・台帳写し有無） |
| 規制区域 | 風致地区、宅造規制区域、砂防規制区域、河川保全区域 |
| 災害関連 | 地滑り、急傾斜、土砂災害警戒区域 |
| その他 | 消防、中間検査、中高層関係、開発指導要綱、都市企画施設 |

各項目に「備考」欄を付与。

### 3.4 見積計算

#### 3.4.1 売価計算ロジック
```
売価 = ROUNDUP(原価 ÷ 0.7, -4)
```
- 原価を0.7で割り、万円単位（10,000円）に切り上げ
- 例: 原価 35,000円 → 35,000 / 0.7 = 50,000 → 売価 50,000円
- 例: 原価 13,260円 → 13,260 / 0.7 = 18,942.86 → 売価 20,000円
- 例: 原価 57,200円 → 57,200 / 0.7 = 81,714.29 → 売価 90,000円

#### 3.4.2 見積書データ構成

| 項目 | 説明 |
|---|---|
| 見積番号 | 自動採番 |
| 見積日 | 作成日 |
| 宛先 | 顧客名 + 御中 |
| 件名 | 物件名称 + 申請関連の見積もり |
| 明細行 | No.、摘要、数量、単価（売価）、金額 |
| 小計 | 明細合計 |
| 消費税 | 小計 × 10% |
| 合計 | 小計 + 消費税 |

#### 3.4.3 見積プレビュー
- Web画面上で見積書のプレビュー表示
- 明細行の並び替え（ドラッグ&ドロップ）
- 不要行の非表示切り替え

### 3.5 Excel出力

#### 3.5.1 役所調査書Excel出力
- 「役所調査原本」シートのレイアウトに準拠したExcel出力
- 入力済みデータを所定セルに埋め込み
- セル結合・罫線・書式を保持

#### 3.5.2 見積書Excel出力
- 「見積書」シートのレイアウトに準拠したExcel出力
- 会社情報（株式会社Gハウス、住所、TEL）をヘッダーに固定
- 明細行にプロジェクトの調査項目（採用分）を展開
- 小計・消費税・合計を自動計算
- 標準スケジュールセクション（契約日基準の日程表）

#### 3.5.3 Excelテンプレート管理
- 出力レイアウトのテンプレートファイルをシステムに保持
- テンプレートの差し替え機能（将来対応可）

### 3.6 認証・権限

#### 3.6.1 認証
- better-authによるユーザー認証
- メールアドレス+パスワード認証
- セッション管理

#### 3.6.2 権限
- 管理者: マスタ管理、全プロジェクト閲覧・編集、ユーザー管理
- 一般ユーザー: プロジェクト作成・編集、見積作成、Excel出力

---

## 4. データベース設計

### 4.1 ER図（概念）

```
users ──< projects ──< project_items
                  │
prefectures ──< municipalities ──< investigation_items
```

### 4.2 テーブル定義

#### users（ユーザー）
| カラム | 型 | 説明 |
|---|---|---|
| id | UUID PK | |
| email | VARCHAR UNIQUE | メールアドレス |
| name | VARCHAR | 表示名 |
| role | ENUM | admin / user |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

※ better-authが管理するテーブルと連携

#### prefectures（都道府県）
| カラム | 型 | 説明 |
|---|---|---|
| id | SERIAL PK | |
| code | INTEGER UNIQUE | 都道府県コード（25〜30） |
| name | VARCHAR | 都道府県名（滋賀県, 京都府, ...） |
| short_name | VARCHAR | 略称（滋賀, 京都, ...） |
| is_active | BOOLEAN | 有効フラグ |

#### municipalities（市区町村）
| カラム | 型 | 説明 |
|---|---|---|
| id | SERIAL PK | |
| prefecture_id | FK → prefectures | 所属都道府県 |
| name | VARCHAR | 市区町村名 |
| postal_codes | JSONB | 関連郵便番号リスト |
| is_active | BOOLEAN | 有効フラグ |

#### investigation_items（調査項目マスタ）
| カラム | 型 | 説明 |
|---|---|---|
| id | SERIAL PK | |
| prefecture_id | FK → prefectures | 都道府県 |
| municipality_name | VARCHAR | 市区町村名 |
| description | TEXT | 摘要（調査項目名称） |
| quantity | DECIMAL | デフォルト数量 |
| unit | VARCHAR | 単位（式, etc.） |
| cost_price | INTEGER | 原価（円） |
| selling_price | INTEGER | 売価＝お客様出し（円） |
| days_before_construction | INTEGER | 着工前＋日数 |
| sort_order | INTEGER | 表示順 |
| is_active | BOOLEAN | 有効フラグ |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### common_items（共通調査項目マスタ）
| カラム | 型 | 説明 |
|---|---|---|
| id | SERIAL PK | |
| category | VARCHAR | カテゴリ |
| description | TEXT | 摘要 |
| quantity | DECIMAL | デフォルト数量 |
| unit | VARCHAR | 単位 |
| cost_price | INTEGER | 原価 |
| selling_price | INTEGER | 売価 |
| sort_order | INTEGER | 表示順 |
| is_active | BOOLEAN | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### projects（プロジェクト/案件）
| カラム | 型 | 説明 |
|---|---|---|
| id | UUID PK | |
| project_number | VARCHAR UNIQUE | プロジェクト番号（自動採番） |
| property_name | VARCHAR | 物件名称 |
| prefecture_id | FK → prefectures | 建築地（都道府県） |
| municipality | VARCHAR | 建築地（市区町村） |
| lot_number | VARCHAR | 地番 |
| address_display | VARCHAR | 住居表示 |
| site_area | DECIMAL | 敷地面積（㎡） |
| building_scale | VARCHAR | 建物規模 |
| city_planning_zone | VARCHAR | 都市計画区域 |
| fire_prevention | VARCHAR | 防火指定 |
| zoning | VARCHAR | 用途地域 |
| height_district | VARCHAR | 高度地区 |
| building_coverage | DECIMAL | 建蔽率（％） |
| floor_area_ratio | DECIMAL | 容積率（％） |
| customer_name | VARCHAR | 顧客名 |
| status | ENUM | draft/investigating/estimated/completed |
| assigned_user_id | FK → users | 担当者 |
| estimate_number | VARCHAR | 見積番号 |
| estimate_date | DATE | 見積日 |
| notes | TEXT | 備考 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### project_survey（プロジェクト調査情報）
役所調査原本の入力データ。

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID PK | |
| project_id | FK → projects UNIQUE | |
| district_plan | TEXT | 地区計画 |
| district_plan_notes | TEXT | 地区計画備考 |
| building_agreement | TEXT | 建築協定 |
| building_agreement_notes | TEXT | 建築協定備考 |
| landscape | TEXT | 景観 |
| landscape_notes | TEXT | 景観備考 |
| buried_cultural | TEXT | 埋蔵文化財 |
| buried_cultural_notes | TEXT | 埋蔵文化財備考 |
| road_1_type | VARCHAR | 接続道路1 種別 |
| road_1_side | VARCHAR | 接続道路1 方角 |
| road_1_name | TEXT | 接続道路1 路線名/指定 |
| road_1_character | VARCHAR | 接続道路1 性格 |
| road_1_width | DECIMAL | 接続道路1 幅員(m) |
| road_1_demarcation | VARCHAR | 接続道路1 明示 |
| road_2_type | VARCHAR | 接続道路2 種別 |
| road_2_side | VARCHAR | 接続道路2 方角 |
| road_2_name | TEXT | 接続道路2 路線名/指定 |
| road_2_character | VARCHAR | 接続道路2 性格 |
| road_2_width | DECIMAL | 接続道路2 幅員(m) |
| road_2_demarcation | VARCHAR | 接続道路2 明示 |
| road_3_type | VARCHAR | 接続道路3 種別 |
| road_3_side | VARCHAR | 接続道路3 方角 |
| road_3_name | TEXT | 接続道路3 路線名/指定 |
| road_3_character | VARCHAR | 接続道路3 性格 |
| road_3_width | DECIMAL | 接続道路3 幅員(m) |
| road_3_demarcation | VARCHAR | 接続道路3 明示 |
| public_sewerage | TEXT | 公共下水道 |
| sewerage_ledger | BOOLEAN | 下水道台帳写し |
| sewerage_notes | TEXT | 下水道備考 |
| water_supply | TEXT | 水道 |
| water_ledger | BOOLEAN | 水道台帳写し |
| water_notes | TEXT | 水道備考 |
| gas | TEXT | ガス |
| gas_notes | TEXT | ガス備考 |
| scenic_district | TEXT | 風致地区 |
| scenic_notes | TEXT | 風致備考 |
| wall_setback_road | VARCHAR | 壁面後退（道路側） |
| wall_setback_adjacent | VARCHAR | 壁面後退（隣地側） |
| retaining_wall_regulation | TEXT | 宅造規制区域 |
| retaining_wall_notes | TEXT | 宅造備考 |
| sediment_control | TEXT | 砂防規制区域 |
| sediment_notes | TEXT | 砂防備考 |
| river_conservation | TEXT | 河川保全区域 |
| river_width | DECIMAL | 区域幅(m) |
| river_notes | TEXT | 河川備考 |
| landslide | TEXT | 地滑り |
| steep_slope | TEXT | 急傾斜 |
| disaster_warning | TEXT | 土砂災害警戒区域 |
| fire_department | TEXT | 消防 |
| intermediate_inspection | TEXT | 中間検査 |
| highrise_related | TEXT | 中高層関係 |
| development_guidelines | TEXT | 開発指導要綱 |
| city_planning_facility | TEXT | 都市企画施設 |
| extra_notes | TEXT | 追加備考 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### project_items（プロジェクト調査項目/見積明細）
| カラム | 型 | 説明 |
|---|---|---|
| id | UUID PK | |
| project_id | FK → projects | |
| source_item_id | FK → investigation_items NULL | マスタ参照元（手動追加はNULL） |
| description | TEXT | 摘要 |
| quantity | DECIMAL | 数量 |
| unit | VARCHAR | 単位 |
| cost_price | INTEGER | 原価（円） |
| selling_price | INTEGER | 売価（円） |
| is_selected | BOOLEAN | 採用フラグ |
| sort_order | INTEGER | 表示順（見積書の行順） |
| notes | TEXT | 備考 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

## 5. 画面設計

### 5.1 画面一覧

| # | 画面名 | URL | 説明 |
|---|---|---|---|
| 1 | ログイン | /login | メールアドレス+パスワード認証 |
| 2 | ダッシュボード | / | プロジェクト件数サマリ、直近プロジェクト一覧 |
| 3 | プロジェクト一覧 | /projects | 検索・フィルタ付き一覧 |
| 4 | プロジェクト作成 | /projects/new | 新規プロジェクト登録 |
| 5 | プロジェクト詳細 | /projects/[id] | 基本情報・調査・見積タブ |
| 6 | 調査項目選択 | /projects/[id]/items | 市区町村別調査項目の選択 |
| 7 | 役所調査書入力 | /projects/[id]/survey | 調査書フォーム入力 |
| 8 | 見積プレビュー | /projects/[id]/estimate | 見積書プレビュー・編集 |
| 9 | マスタ管理 - 調査項目 | /admin/items | 調査項目マスタCRUD |
| 10 | マスタ管理 - 共通項目 | /admin/common-items | 共通項目マスタCRUD |
| 11 | ユーザー管理 | /admin/users | ユーザーCRUD（管理者のみ） |

### 5.2 画面遷移

```
ログイン → ダッシュボード
              ├── プロジェクト一覧
              │     ├── プロジェクト作成 → プロジェクト詳細
              │     └── プロジェクト詳細
              │           ├── [調査タブ] 役所調査書入力
              │           ├── [項目タブ] 調査項目選択
              │           ├── [見積タブ] 見積プレビュー
              │           └── Excel出力（調査書/見積書）
              └── マスタ管理（管理者のみ）
                    ├── 調査項目マスタ
                    ├── 共通項目マスタ
                    └── ユーザー管理
```

### 5.3 主要画面ワイヤーフレーム概要

#### プロジェクト詳細画面
```
┌─────────────────────────────────────────────┐
│ [← 一覧] 物件名称 xxxxxxxxx     [Excel出力▼]│
│                                              │
│ [基本情報] [調査書] [調査項目] [見積]         │
│ ─────────────────────────────────────────── │
│                                              │
│  （選択タブの内容が表示される）                │
│                                              │
└─────────────────────────────────────────────┘
```

#### 調査項目選択画面
```
┌─────────────────────────────────────────────┐
│ 建築地: 大阪府 高槻市                        │
│                                              │
│ ■ 該当する調査項目（高槻市: 6件）            │
│ ┌───┬──────────────────┬───────┬──────┐      │
│ │ ☑ │ 高槻市事前経由... │ 30,000│50,000│      │
│ │ ☑ │ 既存擁壁調査書... │ 10,000│20,000│      │
│ │ ☐ │ 8側溝整備協議...  │ 50,000│80,000│      │
│ │ ☑ │ 道路中心線調査... │ 10,000│20,000│      │
│ │ ☑ │ 長期優良住宅認... │ 13,000│20,000│      │
│ │ ☑ │ 長期優良住宅適... │ 57,200│90,000│      │
│ └───┴──────────────────┴───────┴──────┘      │
│                                              │
│ ■ 共通項目                                   │
│ ┌───┬──────────────────┬───────┬──────┐      │
│ │ ☑ │ 確認申請業務      │ xx,xxx│xx,xxx│      │
│ │ ...                                   │      │
│ └───┴──────────────────┴───────┴──────┘      │
│                                              │
│ [+ 手動項目追加]          [保存]             │
└─────────────────────────────────────────────┘
```

---

## 6. API設計

### 6.1 エンドポイント一覧

Next.js App Router の Route Handlers (API Routes) を使用。

| メソッド | パス | 説明 |
|---|---|---|
| POST | /api/auth/* | better-auth認証関連 |
| GET | /api/prefectures | 都道府県一覧 |
| GET | /api/prefectures/[id]/municipalities | 市区町村一覧 |
| GET | /api/items?prefecture_id=&municipality= | 調査項目検索 |
| POST | /api/items | 調査項目追加（管理者） |
| PUT | /api/items/[id] | 調査項目更新（管理者） |
| DELETE | /api/items/[id] | 調査項目削除（管理者） |
| GET | /api/common-items | 共通項目一覧 |
| POST | /api/common-items | 共通項目追加（管理者） |
| GET | /api/projects | プロジェクト一覧 |
| POST | /api/projects | プロジェクト作成 |
| GET | /api/projects/[id] | プロジェクト詳細 |
| PUT | /api/projects/[id] | プロジェクト更新 |
| DELETE | /api/projects/[id] | プロジェクト削除 |
| GET | /api/projects/[id]/items | プロジェクト調査項目一覧 |
| POST | /api/projects/[id]/items | 調査項目追加 |
| PUT | /api/projects/[id]/items/[itemId] | 調査項目更新 |
| DELETE | /api/projects/[id]/items/[itemId] | 調査項目削除 |
| GET | /api/projects/[id]/survey | 調査書データ取得 |
| PUT | /api/projects/[id]/survey | 調査書データ更新 |
| GET | /api/projects/[id]/estimate | 見積データ取得 |
| GET | /api/projects/[id]/export/survey | 調査書Excel出力 |
| GET | /api/projects/[id]/export/estimate | 見積書Excel出力 |
| GET | /api/dashboard/stats | ダッシュボード統計 |

---

## 7. 見積計算ロジック詳細

### 7.1 売価計算

```typescript
function calculateSellingPrice(costPrice: number): number {
  // 原価 ÷ 0.7 を万円単位に切り上げ
  return Math.ceil(costPrice / 0.7 / 10000) * 10000;
}
```

### 7.2 見積合計計算

```typescript
function calculateEstimate(items: ProjectItem[]) {
  const selectedItems = items.filter(item => item.isSelected);

  const subtotal = selectedItems.reduce((sum, item) => {
    return sum + item.sellingPrice * item.quantity;
  }, 0);

  const tax = Math.floor(subtotal * 0.1);  // 消費税10%
  const total = subtotal + tax;

  return { subtotal, tax, total };
}
```

---

## 8. Excel出力仕様

### 8.1 役所調査書

exceljs を使用し、テンプレートExcel（役所調査原本シートのレイアウト）にデータを埋め込む。

**主要セルマッピング:**

| データ | セル位置 |
|---|---|
| 作成日 | H3 |
| 担当者 | J3〜 |
| 物件名称 | C5 |
| 建築地（都道府県） | C6 |
| 建築地（市区町村） | D6 |
| 建築地（地番詳細） | G6 |
| 住居表示（都道府県） | C7 |
| 住居表示（市区町村） | D7 |
| 住居表示（詳細） | G7 |
| 敷地面積 | C8〜D8 |
| 建物規模 | G8〜 |
| 都市計画区域 | C9〜 |
| 防火指定 | G9〜 |
| 用途地域 | C10 |
| 外壁後退 | G10〜 |
| 備考（用途地域） | J10 |
| ... | （以下省略、63行分） |

### 8.2 見積書

**主要セルマッピング:**

| データ | セル位置 |
|---|---|
| 宛先（顧客名） | C3〜D3 |
| 見積番号 | H3〜 |
| 見積日 | I4 |
| 件名 | D6 |
| 会社名 | I6 |
| 合計金額 | D12 |
| 明細No. | B15〜B34 |
| 摘要 | C15〜C34 |
| 数量 | F15〜F34 |
| 単位 | G15〜G34 |
| 単価 | H15〜H34 |
| 金額 | I15〜I34 |
| 小計 | I35 |
| 消費税 | I36 |
| 合計 | I37 |

明細は最大20行。項目が20行を超える場合は複数ページ対応（将来検討）。

---

## 9. 非機能要件

### 9.1 パフォーマンス
- 画面表示: 2秒以内
- Excel出力: 5秒以内
- 同時接続: 10ユーザー程度

### 9.2 セキュリティ
- HTTPS通信
- better-authによるセッション管理
- CSRF対策
- SQLインジェクション対策（Drizzle ORM）
- 認証必須（ログイン画面以外）

### 9.3 可用性
- Supabase managed PostgreSQL（自動バックアップ）
- Vercel / Supabase ホスティング

### 9.4 ブラウザ対応
- Chrome最新版（推奨）
- Edge最新版
- Safari最新版

---

## 10. 初期データ投入

### 10.1 投入対象

| データ | ソース | 件数 |
|---|---|---|
| 都道府県 | 手動定義 | 6件 |
| 市区町村 | Excel 25SHIGA〜30WAKAYA シート | 各県数百〜数千件 |
| 調査項目(滋賀県) | Excel 25滋賀県シート | 338件 |
| 調査項目(京都府) | Excel 26京都府シート | 324件 |
| 調査項目(大阪府) | Excel 27大阪府シート | 146件 |
| 調査項目(兵庫県) | Excel 28兵庫県シート | 310件 |
| 調査項目(奈良県) | Excel 29奈良県シート | 320件 |
| 調査項目(和歌山県) | Excel 30和歌山県シート | 338件 |

### 10.2 投入方法
- Drizzle ORM の seed スクリプトで初期データを投入
- Excelファイルをパースして JSON → DB挿入

---

## 11. 実装フェーズ

### Phase 1: プロジェクト基盤
- Next.js 16 プロジェクト初期化
- Tailwind CSS 4 + shadcn/ui セットアップ
- Supabase接続 + Drizzle ORM設定
- better-auth認証実装
- 基本レイアウト（サイドバー、ヘッダー）

### Phase 2: マスタデータ
- DBスキーマ作成（Drizzle migration）
- Excelデータパース → seed スクリプト
- 都道府県・市区町村・調査項目マスタ投入
- マスタ管理画面（CRUD）

### Phase 3: プロジェクト管理
- プロジェクトCRUD（作成/一覧/詳細/編集）
- 都道府県→市区町村連動プルダウン
- ステータス管理

### Phase 4: 調査項目・調査書
- 調査項目自動取得・選択機能
- 手動項目追加
- 役所調査書入力フォーム

### Phase 5: 見積計算・プレビュー
- 売価自動計算
- 見積プレビュー画面
- 明細行並べ替え

### Phase 6: Excel出力
- exceljs によるテンプレートベース出力
- 役所調査書Excel出力
- 見積書Excel出力

### Phase 7: 仕上げ
- Sentry エラー監視導入
- ダッシュボード画面
- UIブラッシュアップ
- テスト・バグ修正

---

## 12. 用語集

| 用語 | 説明 |
|---|---|
| 役所調査 | 新築工事の着工前に各行政機関（市区町村役場）で行う法規制等の調査 |
| 調査項目 | 市区町村ごとに必要な申請・届出業務（事前協議、長期優良住宅申請等） |
| 原価 | 業務の原価（仕入れコスト） |
| 売価（お客様出し） | 顧客に提示する価格。ROUNDUP(原価/0.7, -4) で算出 |
| 事前経由 | 確認申請の前に市区町村の関係部署を巡回して事前協議すること |
| 長期優良住宅 | 耐久性等が一定基準を満たす住宅。認定取得に申請費用が必要 |
| 建築協定 | 地域の建築に関する自主ルール |
| 風致地区 | 都市の自然的景観を維持するための規制地区 |
| 砂防指定地 | 砂防法に基づく規制区域 |
