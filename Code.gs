// =============================================
// 🌸 梅乃園幼稚園 小梅クラス 成長チェックアプリ
// Code.gs — Google Apps Script サーバー側処理
// =============================================

const SHEET_PARENTS = '保護者リスト';
const SHEET_RECORDS = 'チェック記録';
const CHECK_DATES   = ['5/6', '7/20', '8/30', '1/9', '2/28'];

// ── チェック項目ラベル（集計シート用） ──────────
const ITEM_LABELS = [
  { cat: '言葉', id: 'kotoba', items: [
    '返事「ハイ」ができる',
    '大人が幼児語を使わない',
    '子供が幼児語を使わない',
    '幼児語を大人が言い直す',
    'TV・スマホを見せない(30分以内)',
    '絵本を毎日2冊以上読み聞かせ',
    '乗り物の名前5つ以上言える',
    '野菜の名前5つ以上言える',
    '果物の名前5つ以上言える',
    '動物の名前5つ以上言える',
    '色の名前5つ以上言える',
    '童謡を1人で歌える曲がある',
    '自分から「おはようございます」',
    '自分から「いただきます」',
    '自分から「ごちそうさま」',
    '自分から「ありがとう」',
    '自分から「ごめんなさい」',
    '自分から「やって下さい」',
  ]},
  { cat: '行動生活', id: 'seikatsu', items: [
    '靴を1人で脱げる',
    '靴を1人で履ける',
    '靴下を1人で脱げる',
    '靴下を1人で履ける',
    'タオルを1人でたためる',
    'スモックを1人で着られる',
    'スモックを1人で脱げる',
    '裏返しのスモックを戻せる',
    'スモックを1人でたためる',
    'クレヨンを正しく持てる',
    '1人で直線が描ける',
    '1人で丸が描ける',
    '1人で三角が描ける',
    '1人で四角が描ける',
    '1人で顔が描ける',
    '簡単な塗り絵ができる',
    'パンツを足首まで下ろせる',
    'パンツをお尻まで上げられる',
    'トイレ後に水を流せる',
    'トイレで排便できる',
    'お尻を1人で拭ける（大）',
    '女:ペーパーを切って拭ける（小）',
    '男:立っておしっこできる',
    'トイレ後に必ず手を洗う',
    '蛇口を1人で操作できる',
    '手を石けんで洗える（1人で）',
    '手をハンカチで拭ける（1人で）',
    'うがいができる',
    '毎朝顔を洗う・洗ってあげる',
    '毎日お風呂に入る',
    '毎日頭と体を洗う・洗ってあげる',
    '汗を1人で拭ける',
    '紅白帽子を1人で被れる',
    '話を聞く時に顔を見られる',
    '前後正しく服を着られる',
    '裏返しにならずに脱げる',
    '自分からトイレに行ける',
    '毎朝排便する',
    '自分で歯磨き・仕上げ磨きも',
    '鼻水を1人でかめる',
  ]},
  { cat: '食事', id: 'shokuji', items: [
    '最後まで座って食べる',
    '足がイスに上がらない',
    '食事中テレビをつけない',
    '食事の時間を決めている(40分)',
    'お箸箱を1人で開けられる',
    'スプーン・フォークを箱にしまえる',
    'スプーン・フォークをお箸持ちで',
    'ご飯をスプーンですくって食べる',
    'スプーンとフォークを使い分ける',
    '反対の手でお皿を押さえる',
    '食器を流し台まで運べる',
    'お給食セットを袋から出せる',
    'お給食セットを袋にしまえる',
    'ランチョンマットをたためる',
    'ランチョンマットを袋にしまえる',
    '好き嫌いをなくす工夫をしている',
    '1人でこぼさずに食べられる',
    '嫌いな物も頑張って食べる',
  ]},
  { cat: '理解', id: 'rikai', items: [
    '自分の性別が答えられる',
    '鬼ごっこで逃げられる',
    '鬼ごっこで捕まえられる',
    '数える間、目を合わせられる',
    '1〜10まで数を数えられる',
    '数えながら手を叩ける',
    '靴を左右間違えずに履ける',
    'フルネームで名前を言える',
    '自分の名前の漢字がわかる',
    '右手・左手がわかる',
    '青信号で渡れる',
    '赤信号で止まれる',
    '誰にでも「貸して」が言える',
    '「いいよ」と渡せる',
    '他の子のおもちゃを取らない',
    '突然押したり叩いたりしない',
    'じゃんけんで手が出せる',
    'じゃんけんの勝ち負けがわかる',
    '「後で」と言われたら待てる',
    '「○○を持ってきて」ができる',
    'お手伝いができる',
    '単語1つを真似して言える',
    '単語2つを連続して真似できる',
    '単語3つ以上を連続して真似できる',
  ]},
  { cat: '運動', id: 'undo', items: [
    '両足ジャンプができる',
    '転ばずに走れる',
    '50m以上休まず走れる',
    '鉄棒に10秒ぶら下がれる',
    'すべり台を1人で上って滑れる',
    '片足3秒立ち（右足）',
    '片足3秒立ち（左足）',
    '階段を交互に上がれる',
    '階段を交互に下がれる',
    '仰向けで両足を上げられる',
    '長座で前屈できる',
    '右手の指で1〜5が作れる',
    '左手の指で1〜5が作れる',
    '両手の指で1〜5が作れる',
    '片手でグーチョキパー',
    '両手でグーチョキパー',
    '正座（お客様座り）',
    '体操座り（おりんごさん）',
    'お父さんと遊ぶ',
  ]},
];

// スコアの背景色（集計シート共通）
const SCORE_BG = { 0:'F5F5F5', 1:'FFCDD2', 2:'FFE0B2', 3:'DCEDC8', 4:'C8E6C9' };

// 感想シート名・成長度換算
const SHEET_COMMENTS   = '感想記録';
const SCORE_WEIGHTS_GAS = { 1:0, 2:28, 3:67, 4:100 };

// ── 保存＋完了時にシート更新（チェック日が全完了した時のみ） ──
// isComplete: フロントエンドが全項目入力済みを検知した時に true を渡す
function saveRecordAndUpdate(category, itemIdx, dateIdx, score, isComplete) {
  saveRecord(category, itemIdx, dateIdx, score);
  if (isComplete) {
    generateSummarySheetsSmart();
  }
  return { success: true };
}

// =============================================
// ⏰ 毎朝6時・差分更新トリガー（バックアップ用）
// ※ 主なトリガーはチェック日完了時の saveRecordAndUpdate です
// 必要な場合のみ setupDailyTrigger() を実行してください
// =============================================

/**
 * トリガーを設定する（一度だけ実行）
 * Apps Script エディタで setupDailyTrigger() を手動実行してください
 */
function setupDailyTrigger() {
  // 重複防止：既存の同名トリガーを削除
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'generateSummarySheetsSmart')
    .forEach(t => ScriptApp.deleteTrigger(t));

  // 毎朝6時台に実行（実際は6:00〜7:00のどこか）
  ScriptApp.newTrigger('generateSummarySheetsSmart')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();

  return '✅ 毎朝6時の自動更新トリガーを設定しました！';
}

/** トリガーを削除する */
function deleteDailyTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'generateSummarySheetsSmart')
    .forEach(t => ScriptApp.deleteTrigger(t));
  return '🗑 トリガーを削除しました';
}

/**
 * 差分更新メイン関数
 * ・PropertiesService に前回実行時刻を保存
 * ・チェック記録の「更新日時」列と比較し変更があった子供の列のみ更新
 * ・変更ゼロなら何もしない（高速）
 */
function generateSummarySheetsSmart() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();

  // 前回実行時刻（初回は全件対象）
  const lastRunStr  = props.getProperty('lastSummaryRun');
  const lastRunDate = lastRunStr ? new Date(lastRunStr) : new Date(0);

  const recordsSheet = ss.getSheetByName(SHEET_RECORDS);
  const parentsSheet = ss.getSheetByName(SHEET_PARENTS);
  if (!recordsSheet || !parentsSheet) {
    console.log('シートが見つかりません。先に setupSheets() を実行してください。');
    return;
  }

  const allRecords = recordsSheet.getDataRange().getValues().slice(1);
  // 列: [email, catId, itemIdx, dateIdx, score, 更新日時]

  // 前回以降に更新されたレコードだけ抽出
  const changedRecords = allRecords.filter(r => {
    if (!r[5]) return false;
    const ts = r[5] instanceof Date ? r[5] : new Date(r[5]);
    return ts > lastRunDate;
  });

  if (changedRecords.length === 0) {
    console.log('変更なし。スキップします。');
    props.setProperty('lastSummaryRun', new Date().toISOString());
    return;
  }

  // 変更があった子供のメールアドレス一覧
  const changedEmails = [...new Set(changedRecords.map(r => r[0]))];
  console.log(`変更検出: ${changedEmails.length}名`);

  // 変更された子供のレコードをまとめて取得
  const recordMap = {};
  allRecords
    .filter(r => changedEmails.includes(r[0]))
    .forEach(r => {
      if (!recordMap[r[0]]) recordMap[r[0]] = {};
      recordMap[r[0]][`${r[1]}_${r[2]}_${r[3]}`] = Number(r[4]);
    });

  const allParents = parentsSheet.getDataRange().getValues().slice(1);
  // 列: [email, name, kana, class, date]

  ['赤小梅', '白小梅'].forEach(className => {
    const sheetName = className + '特別シート';

    // クラス全員をあいうえお順に
    const allInClass = allParents
      .filter(p => p[3] === className)
      .sort((a, b) => String(a[2]).localeCompare(String(b[2]), 'ja'));

    if (allInClass.length === 0) return;

    // 集計シートがなければフル生成してから差分更新
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      generateSummarySheets();
      sheet = ss.getSheetByName(sheetName);
      if (!sheet) return;
    }

    // このクラスで変更があった子供だけ処理
    allInClass
      .filter(p => changedEmails.includes(p[0]))
      .forEach(parentRow => {
        const email    = parentRow[0];
        const childIdx = allInClass.findIndex(p => p[0] === email);
        if (childIdx < 0) return;

        // 列位置: A=カテゴリ, B=項目, C〜 = 子供スコア（1人5列）
        const startCol = 3 + childIdx * CHECK_DATES.length;
        _updateChildColumns(sheet, startCol, recordMap[email] || {});
        console.log(`更新: ${parentRow[1]}（${className}）`);
      });
  });

  props.setProperty('lastSummaryRun', new Date().toISOString());
  console.log('差分更新完了');
}

/**
 * 1人分の列（5チェック日×全項目）をバッチ更新
 * setValues / setBackgrounds を1回ずつ呼ぶだけなので高速
 */
function _updateChildColumns(sheet, startCol, scores) {
  const nd = CHECK_DATES.length;
  const totalItems = ITEM_LABELS.reduce((n, c) => n + c.items.length, 0);

  const vals = [], bgs = [], fws = [], fcs = [];

  ITEM_LABELS.forEach(cat => {
    cat.items.forEach((_, itemIdx) => {
      const rv = [], rb = [], rfw = [], rfc = [];
      CHECK_DATES.forEach((_, di) => {
        const score = scores[`${cat.id}_${itemIdx}_${di}`] || 0;
        rv.push(score > 0 ? score : '');
        rb.push('#' + (SCORE_BG[score] || 'F5F5F5'));
        rfw.push(score === 4 ? 'bold' : 'normal');
        rfc.push(score === 4 ? '#2E7D32' : '#000000');
      });
      vals.push(rv); bgs.push(rb); fws.push(rfw); fcs.push(rfc);
    });
  });

  const range = sheet.getRange(3, startCol, totalItems, nd);
  range.setValues(vals);
  range.setBackgrounds(bgs);
  range.setFontWeights(fws);
  range.setFontColors(fcs);
  range.setHorizontalAlignments(Array(totalItems).fill(Array(nd).fill('center')));
}

// ── メインページ ────────────────────────────
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('🌸 成長チェック | 梅乃園幼稚園')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}

// ── 保護者情報を取得 ────────────────────────────
function getParentInfo() {
  const email = Session.getActiveUser().getEmail();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PARENTS);
  if (!sheet) return { registered: false, email };

  const rows = sheet.getDataRange().getValues().slice(1);
  const row = rows.find(r => r[0] === email);

  return row
    ? {
        registered: true, email,
        childName: row[1], childKana: row[2], childClass: row[3],
        registrationDate: row[4] ? row[4].toISOString() : null
      }
    : { registered: false, email };
}

// ── 子供を登録（初回 or 更新） ─────────────────
function registerChild(childName, childKana, childClass) {
  const email = Session.getActiveUser().getEmail();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PARENTS);

  const rows = sheet.getDataRange().getValues().slice(1);
  const rowIndex = rows.findIndex(r => r[0] === email);

  if (rowIndex >= 0) {
    sheet.getRange(rowIndex + 2, 2, 1, 3).setValues([[childName, childKana, childClass]]);
  } else {
    sheet.appendRow([email, childName, childKana, childClass, new Date()]);
  }
  return { success: true };
}

// ── チェック記録を全件取得 ──────────────────────
function getRecords() {
  const email = Session.getActiveUser().getEmail();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RECORDS);
  if (!sheet) return {};

  const records = {};
  sheet.getDataRange().getValues().slice(1)
    .filter(r => r[0] === email)
    .forEach(r => { records[`${r[1]}_${r[2]}_${r[3]}`] = Number(r[4]); });
  return records;
}

// ── チェックを保存 ───────────────────────────
function saveRecord(category, itemIdx, dateIdx, score) {
  const email = Session.getActiveUser().getEmail();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RECORDS);

  const rows = sheet.getDataRange().getValues().slice(1);
  const rowIndex = rows.findIndex(r =>
    r[0] === email && r[1] === category &&
    Number(r[2]) === itemIdx && Number(r[3]) === dateIdx
  );

  if (rowIndex >= 0) {
    sheet.getRange(rowIndex + 2, 5, 1, 2).setValues([[score, new Date()]]);
  } else {
    sheet.appendRow([email, category, itemIdx, dateIdx, score, new Date()]);
  }
  return { success: true };
}

// ── 集計シートを生成・更新 ──────────────────────
// 「赤小梅特別シート」「白小梅特別シート」を作成し
// 各クラスの子供（あいうえお順）ごとの成績を並べる
// ── 感想を取得（現在のユーザー分） ──────────────
function getComments() {
  const email = Session.getActiveUser().getEmail();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_COMMENTS);
  if (!sheet) return {};
  const comments = {};
  sheet.getDataRange().getValues().slice(1)
    .filter(r => r[0] === email)
    .forEach(r => { comments[Number(r[1])] = r[2] || ''; });
  return comments;
}

// ── 感想を保存してシート全体を再生成 ─────────────
function saveComment(dateIdx, text) {
  const email = Session.getActiveUser().getEmail();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_COMMENTS);
  const rows = sheet.getDataRange().getValues().slice(1);
  const rowIndex = rows.findIndex(r => r[0] === email && Number(r[1]) === dateIdx);
  if (rowIndex >= 0) {
    sheet.getRange(rowIndex + 2, 3, 1, 2).setValues([[text, new Date()]]);
  } else {
    sheet.appendRow([email, dateIdx, text, new Date()]);
  }
  generateSummarySheets(); // 感想変更時は全体再生成
  return { success: true };
}

function generateSummarySheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 保護者リストとチェック記録を読み込み
  const parentsSheet = ss.getSheetByName(SHEET_PARENTS);
  const recordsSheet = ss.getSheetByName(SHEET_RECORDS);
  if (!parentsSheet || !recordsSheet) return '先に setupSheets() を実行してください';

  const allParents = parentsSheet.getDataRange().getValues().slice(1);
  // [email, name, kana, class, date]

  const allRecords = recordsSheet.getDataRange().getValues().slice(1);
  // [email, catId, itemIdx, dateIdx, score, timestamp]

  // email → { "catId_itemIdx_dateIdx": score } のマップを作成
  const recordMap = {};
  allRecords.forEach(r => {
    const email = r[0];
    if (!recordMap[email]) recordMap[email] = {};
    recordMap[email][`${r[1]}_${r[2]}_${r[3]}`] = Number(r[4]);
  });

  const classNames = ['赤小梅', '白小梅'];

  classNames.forEach(className => {
    // クラスの子供をよみがな順（あいうえお）に並べる
    const children = allParents
      .filter(p => p[3] === className)
      .sort((a, b) => String(a[2]).localeCompare(String(b[2]), 'ja'));

    if (children.length === 0) return; // 該当クラスが空なら何もしない

    // ── シートを準備 ──
    const sheetName = className + '特別シート';
    let sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      sheet.clearContents();
      sheet.clearFormats();
    } else {
      sheet = ss.insertSheet(sheetName);
    }

    // ── ヘッダー行を構築 ──
    // 列: [カテゴリ][項目][5/6][7/20][8/30][1/9][2/28] × 子供の人数
    const dateCount = CHECK_DATES.length;

    // 1行目: [空][空] [子供名×dateCount列ずつ]
    const row1 = ['カテゴリ', '項目'];
    children.forEach(child => {
      row1.push(child[1]); // 名前を先頭に
      for (let d = 1; d < dateCount; d++) row1.push(''); // 残り列は空（後でmerge）
    });
    sheet.appendRow(row1);

    // 2行目: [空][空] [5/6, 7/20, 8/30, 1/9, 2/28] × 子供の人数
    const row2 = ['', ''];
    children.forEach(() => CHECK_DATES.forEach(d => row2.push(d)));
    sheet.appendRow(row2);

    // ── 成長度スコア（ヘッダー直下・Row3〜） ──
    const totalItemCount = ITEM_LABELS.reduce((n, c) => n + c.items.length, 0);
    const nCats = ITEM_LABELS.length;   // 5

    // Row 3: セパレータ
    const growthSepRow = 3;
    const growthSepVals = ['成長度スコア', ''];
    children.forEach(() => CHECK_DATES.forEach(() => growthSepVals.push('')));
    sheet.appendRow(growthSepVals);

    const growthDataStartRow = 4;

    // カテゴリ別成長度 (Rows 4〜8)
    ITEM_LABELS.forEach(catObj => {
      const row = ['成長度', catObj.cat];
      children.forEach(child => {
        CHECK_DATES.forEach((_, di) => {
          let total = 0;
          catObj.items.forEach((_, ii) => {
            const s = (recordMap[child[0]] && recordMap[child[0]][`${catObj.id}_${ii}_${di}`]) || 0;
            total += SCORE_WEIGHTS_GAS[s] || 0;
          });
          row.push(Math.round(total / catObj.items.length) + '%');
        });
      });
      sheet.appendRow(row);
    });

    // 総合成長度 (Row 9)
    const totalGrowthRow = ['成長度', '総合'];
    children.forEach(child => {
      CHECK_DATES.forEach((_, di) => {
        let total = 0;
        ITEM_LABELS.forEach(catObj => {
          catObj.items.forEach((_, ii) => {
            const s = (recordMap[child[0]] && recordMap[child[0]][`${catObj.id}_${ii}_${di}`]) || 0;
            total += SCORE_WEIGHTS_GAS[s] || 0;
          });
        });
        totalGrowthRow.push(Math.round(total / totalItemCount) + '%');
      });
    });
    sheet.appendRow(totalGrowthRow);

    // 区切り空行 (Row 10)
    const itemsSepRow = growthDataStartRow + nCats + 1;
    sheet.appendRow([]);
    const itemsStartRow = itemsSepRow + 1; // Row 11

    // ── 項目データ（Row 11〜） ──
    const dataRows = [];
    ITEM_LABELS.forEach(catObj => {
      catObj.items.forEach((itemLabel, itemIdx) => {
        const row = [catObj.cat, itemLabel];
        children.forEach(child => {
          CHECK_DATES.forEach((_, dateIdx) => {
            const key = `${catObj.id}_${itemIdx}_${dateIdx}`;
            const score = (recordMap[child[0]] && recordMap[child[0]][key]) || 0;
            row.push(score > 0 ? score : '');
          });
        });
        dataRows.push(row);
      });
    });

    if (dataRows.length > 0) {
      sheet.getRange(itemsStartRow, 1, dataRows.length, dataRows[0].length).setValues(dataRows);
    }

    // ── 感想欄（項目の下） ──
    const commentsSheet = ss.getSheetByName(SHEET_COMMENTS);
    const commentMap = {};
    if (commentsSheet && commentsSheet.getLastRow() > 1) {
      commentsSheet.getDataRange().getValues().slice(1).forEach(r => {
        if (!commentMap[r[0]]) commentMap[r[0]] = {};
        commentMap[r[0]][Number(r[1])] = r[2] || '';
      });
    }

    const commentSepRow = itemsStartRow + dataRows.length;
    const commentHeaderVals = ['保護者感想', 'チェック日'];
    children.forEach(ch => {
      commentHeaderVals.push(ch[1]);
      for (let d = 1; d < dateCount; d++) commentHeaderVals.push('');
    });
    sheet.appendRow(commentHeaderVals);

    const commentDataStartRow = commentSepRow + 1;
    CHECK_DATES.forEach((date, di) => {
      const row = ['感想', date];
      children.forEach(ch => {
        row.push((commentMap[ch[0]] && commentMap[ch[0]][di]) || '');
        for (let d = 1; d < dateCount; d++) row.push('');
      });
      sheet.appendRow(row);
    });

    // ── 書式設定 ──
    const scoreStartCol = 3;
    const headerBg = className === '赤小梅' ? '#FFCDD2' : '#BBDEFB';

    // 子供名ヘッダーマージ（Row1）
    children.forEach((_, ci) => {
      const sc = scoreStartCol + ci * dateCount;
      if (dateCount > 1) sheet.getRange(1, sc, 1, dateCount).merge();
    });

    // ヘッダー書式
    sheet.getRange(1, 1, 2, row1.length).setBackground(headerBg).setFontWeight('bold');
    sheet.getRange(1, 1, 2, 2).setBackground('#FCE4EC').setFontWeight('bold');

    // 成長度セパレータ (Row 3)
    sheet.getRange(growthSepRow, 1, 1, row1.length)
      .setBackground('#FFC107').setFontWeight('bold').setFontColor('#FFFFFF');

    // 成長度スコア行の書式 (Rows 4〜nCats+4)
    for (let r = 0; r < nCats + 1; r++) {
      const rowNum = growthDataStartRow + r;
      const isTotalRow = r === nCats;
      sheet.getRange(rowNum, 1, 1, 2)
        .setBackground(isTotalRow ? '#FFF3E0' : '#FFF8E1')
        .setFontWeight('bold');
      children.forEach((_, ci) => {
        CHECK_DATES.forEach((_, di) => {
          const col = scoreStartCol + ci * dateCount + di;
          const cell = sheet.getRange(rowNum, col);
          const raw = String(cell.getValue()).replace('%','');
          const val = parseInt(raw) || 0;
          if      (val >= 80) cell.setBackground('#C8E6C9');
          else if (val >= 60) cell.setBackground('#DCEDC8');
          else if (val >= 40) cell.setBackground('#FFE0B2');
          else if (val >  0)  cell.setBackground('#FFCDD2');
          else                cell.setBackground('#F5F5F5');
          cell.setHorizontalAlignment('center').setFontWeight('bold');
        });
      });
    }

    // 空行区切り (Row 10)
    sheet.getRange(itemsSepRow, 1, 1, row1.length).setBackground('#E0E0E0');

    // 項目スコアセルに色を付ける
    children.forEach((child, ci) => {
      const email = child[0];
      ITEM_LABELS.forEach((catObj, catIdx) => {
        let itemStartRow = itemsStartRow;
        for (let k = 0; k < catIdx; k++) itemStartRow += ITEM_LABELS[k].items.length;
        catObj.items.forEach((_, itemIdx) => {
          const dataRow = itemStartRow + itemIdx;
          CHECK_DATES.forEach((_, dateIdx) => {
            const score = (recordMap[email] && recordMap[email][`${catObj.id}_${itemIdx}_${dateIdx}`]) || 0;
            const col = scoreStartCol + ci * dateCount + dateIdx;
            const cell = sheet.getRange(dataRow, col);
            if      (score === 4) cell.setBackground('#C8E6C9');
            else if (score === 3) cell.setBackground('#DCEDC8');
            else if (score === 2) cell.setBackground('#FFE0B2');
            else if (score === 1) cell.setBackground('#FFCDD2');
            else                  cell.setBackground('#F5F5F5');
            cell.setHorizontalAlignment('center');
          });
        });
      });
    });

    // カテゴリ列の背景
    const catBgs = ['#FFF9C4', '#E8F5E9', '#E3F2FD', '#FFF3E0', '#F3E5F5'];
    let catStartRow = itemsStartRow;
    ITEM_LABELS.forEach((catObj, i) => {
      sheet.getRange(catStartRow, 1, catObj.items.length, 1).setBackground(catBgs[i % catBgs.length]);
      catStartRow += catObj.items.length;
    });

    // 感想ヘッダー行
    sheet.getRange(commentSepRow, 1, 1, row1.length)
      .setBackground('#7E57C2').setFontWeight('bold').setFontColor('#FFFFFF');

    CHECK_DATES.forEach((_, di) => {
      const rowNum = commentDataStartRow + di;
      sheet.getRange(rowNum, 1, 1, 2).setBackground('#EDE7F6').setFontWeight('bold');
      children.forEach((_, ci) => {
        const startCol = scoreStartCol + ci * dateCount;
        if (dateCount > 1) sheet.getRange(rowNum, startCol, 1, dateCount).merge();
        sheet.getRange(rowNum, startCol).setWrap(true).setVerticalAlignment('top').setBackground('#FAF8FF');
      });
      sheet.setRowHeight(rowNum, 60);
    });

    // 列幅
    sheet.setColumnWidth(1, 75);
    sheet.setColumnWidth(2, 220);
    children.forEach((_, ci) => {
      for (let d = 0; d < dateCount; d++) {
        sheet.setColumnWidth(scoreStartCol + ci * dateCount + d, 45);
      }
    });

    // 固定（成長度スコアも常に表示）
    sheet.setFrozenRows(itemsSepRow);
    sheet.setFrozenColumns(2);
  });

  return '集計シートを生成しました！スプレッドシートをご確認ください 🌸';
}

// ── 初期セットアップ（一度だけ実行） ───────────
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (!ss.getSheetByName(SHEET_PARENTS)) {
    const s = ss.insertSheet(SHEET_PARENTS);
    s.appendRow(['メールアドレス', 'お子様の名前', 'よみがな', 'クラス', '登録日']);
    s.setFrozenRows(1);
    [250, 150, 150, 80, 120].forEach((w, i) => s.setColumnWidth(i + 1, w));
    s.getRange(1, 1, 1, 5).setBackground('#FCE4EC').setFontWeight('bold');
  }

  if (!ss.getSheetByName(SHEET_RECORDS)) {
    const s = ss.insertSheet(SHEET_RECORDS);
    s.appendRow(['メールアドレス', 'カテゴリ', '項目番号', 'チェック日(0-4)', 'スコア(1-4)', '更新日時']);
    s.setFrozenRows(1);
    [250, 100, 80, 120, 80, 150].forEach((w, i) => s.setColumnWidth(i + 1, w));
    s.getRange(1, 1, 1, 6).setBackground('#E3F2FD').setFontWeight('bold');
  }

  if (!ss.getSheetByName(SHEET_COMMENTS)) {
    const s = ss.insertSheet(SHEET_COMMENTS);
    s.appendRow(['メールアドレス', 'チェック日(0-4)', '感想テキスト', '更新日時']);
    s.setFrozenRows(1);
    [250, 100, 400, 150].forEach((w, i) => s.setColumnWidth(i + 1, w));
    s.getRange(1, 1, 1, 4).setBackground('#F3E5F5').setFontWeight('bold');
  }

  return 'セットアップ完了！';
}
