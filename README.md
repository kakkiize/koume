# 🌸 梅乃園幼稚園 小梅クラス 成長チェックアプリ

梅乃園幼稚園の小梅クラス向け成長チェックアプリです。119項目の発達チェックリストを管理し、保護者が定期的に記録できます。

## 機能

- **5カテゴリ・119項目**のチェックリスト（言葉・行動生活・食事・理解・運動）
- **5回分**のチェック記録（5/6・7/20・8/30・1/9・2/28）
- 各項目の「なぜ大切か」説明
- スコアに応じたアドバイス・退行アドバイス表示
- 達成率の可視化
- 子育て感想欄
- 11ヶ月後の卒業画面

## 動作モード

### GitHub Pages モード（スタンドアロン）
ブラウザで直接アクセスできます。データはブラウザの `localStorage` に保存されます。

**公開URL:** https://umenosonoai-stack.github.io/koume-growth-check/

### GAS Webアプリ モード（スプレッドシート連動）
Google Apps Script 経由でアクセスすると、データがGoogleスプレッドシートに自動保存されます。

詳細は [GAS_SETUP_GUIDE.md](./GAS_SETUP_GUIDE.md) を参照してください。

## スプレッドシート

データ保存用のGoogleスプレッドシートは以下に作成済みです：

[梅乃園幼稚園 小梅クラス 成長チェックデータ](https://docs.google.com/spreadsheets/d/1DWmMVyHSyxkC3WMgIM3CHRsMlT1m75CL1zXEUvhP02o/edit)

## ファイル構成

| ファイル | 説明 |
|---------|------|
| `index.html` | ウェブアプリ本体（HTML/CSS/JavaScript） |
| `Code.gs` | Google Apps Script サーバー側処理 |
| `GAS_SETUP_GUIDE.md` | GASデプロイ手順書 |

## GASセットアップ

スプレッドシートとの連動には、GASのデプロイが必要です。[GAS_SETUP_GUIDE.md](./GAS_SETUP_GUIDE.md) の手順に従ってください。
