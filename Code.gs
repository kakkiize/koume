// =============================================
// 🌸 梅乃園幼稚園 小梅クラス 成長チェックアプリ
// Code.gs — Google Apps Script サーバー側処理
// =============================================

const SHEET_PARENTS     = '保護者リスト';
const SHEET_RECORDS     = 'チェック記録';
const SHEET_COMMENTS    = '感想記録';
const CHECK_DATES       = ['5/6', '7/20', '8/30', '1/9', '2/28'];
const BACKUP_FOLDER_ID  = '1lNVko9n-kPFqOorTaZSWOe-02wb7Udfp';
const MAX_CHILDREN      = 3; // 1アカウントに登録できるお子様の最大人数

// スコアの背景色（集計シート共通）
const SCORE_BG = { 0:'F5F5F5', 1:'FFCDD2', 2:'FFE0B2', 3:'DCEDC8', 4:'C8E6C9' };

// 成長度換算
const SCORE_WEIGHTS_GAS = { 1:0, 2:28, 3:67, 4:100 };

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

// =============================================
// 📄 メインページ
// =============================================

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('🌸 成長チェック | 梅乃園幼稚園')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}

// =============================================
// 👪 保護者・子供情報
// シート列構成（保護者リスト）:
//   [email, childIdx, name, kana, class, registrationDate]
// =============================================

/**
 * このアカウントに登録されている子供の一覧を返す
 * @returns { children: [{childIdx, name, kana, cls, regDate}], email }
 */
function getParentInfo() {
  var email  = Session.getActiveUser().getEmail();
  var sheet  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PARENTS);
  if (!sheet) return { children: [], email: email };

  var rows     = sheet.getDataRange().getValues().slice(1);
  var children = [];
  rows.forEach(function(r) {
    if (r[0] === email) {
      children.push({
        childIdx: Number(r[1]),
        name:     r[2],
        kana:     r[3],
        cls:      r[4],
        regDate:  r[5] ? r[5].toISOString() : null
      });
    }
  });
  // childIdxの昇順に並べる
  children.sort(function(a, b){ return a.childIdx - b.childIdx; });
  return { children: children, email: email };
}

/**
 * 子供を登録（新規 or 更新）
 * @param {number} childIdx - 0〜2
 */
function registerChild(childIdx, childName, childKana, childClass) {
  var email = Session.getActiveUser().getEmail();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PARENTS);
  var idx   = Number(childIdx);

  var rows     = sheet.getDataRange().getValues().slice(1);
  var rowIndex = -1;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][0] === email && Number(rows[i][1]) === idx) { rowIndex = i; break; }
  }

  if (rowIndex >= 0) {
    // 既存行を更新（名前・よみがな・クラスのみ。登録日は保持）
    sheet.getRange(rowIndex + 2, 3, 1, 3).setValues([[childName, childKana, childClass]]);
  } else {
    sheet.appendRow([email, idx, childName, childKana, childClass, new Date()]);
  }
  return { success: true };
}

// =============================================
// 📋 チェック記録
// シート列構成（チェック記録）:
//   [email, childIdx, catId, itemIdx, dateIdx, score, timestamp]
// =============================================

function getRecords(childIdx) {
  var email = Session.getActiveUser().getEmail();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RECORDS);
  var idx   = Number(childIdx);
  if (!sheet) return {};

  var records = {};
  sheet.getDataRange().getValues().slice(1)
    .filter(function(r){ return r[0] === email && Number(r[1]) === idx; })
    .forEach(function(r){ records[r[2] + '_' + r[3] + '_' + r[4]] = Number(r[5]); });
  return records;
}

function saveRecord(childIdx, category, itemIdx, dateIdx, score) {
  var email = Session.getActiveUser().getEmail();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RECORDS);
  var idx   = Number(childIdx);

  var rows     = sheet.getDataRange().getValues().slice(1);
  var rowIndex = -1;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][0] === email && Number(rows[i][1]) === idx &&
        rows[i][2] === category &&
        Number(rows[i][3]) === Number(itemIdx) &&
        Number(rows[i][4]) === Number(dateIdx)) {
      rowIndex = i; break;
    }
  }

  if (rowIndex >= 0) {
    sheet.getRange(rowIndex + 2, 6, 1, 2).setValues([[score, new Date()]]);
  } else {
    sheet.appendRow([email, idx, category, itemIdx, dateIdx, score, new Date()]);
  }
  return { success: true };
}

function saveRecordAndUpdate(childIdx, category, itemIdx, dateIdx, score, isComplete) {
  saveRecord(childIdx, category, itemIdx, dateIdx, score);
  if (isComplete) {
    generateSummarySheetsSmart();
  }
  return { success: true };
}

// =============================================
// 💬 感想
// シート列構成（感想記録）:
//   [email, childIdx, dateIdx, text, timestamp]
// =============================================

function getComments(childIdx) {
  var email = Session.getActiveUser().getEmail();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_COMMENTS);
  var idx   = Number(childIdx);
  if (!sheet) return {};

  var comments = {};
  sheet.getDataRange().getValues().slice(1)
    .filter(function(r){ return r[0] === email && Number(r[1]) === idx; })
    .forEach(function(r){ comments[Number(r[2])] = r[3] || ''; });
  return comments;
}

function saveComment(childIdx, dateIdx, text) {
  var email = Session.getActiveUser().getEmail();
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_COMMENTS);
  var idx   = Number(childIdx);

  var rows     = sheet.getDataRange().getValues().slice(1);
  var rowIndex = -1;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][0] === email && Number(rows[i][1]) === idx &&
        Number(rows[i][2]) === Number(dateIdx)) { rowIndex = i; break; }
  }

  if (rowIndex >= 0) {
    sheet.getRange(rowIndex + 2, 4, 1, 2).setValues([[text, new Date()]]);
  } else {
    sheet.appendRow([email, idx, dateIdx, text, new Date()]);
  }
  generateSummarySheets();
  return { success: true };
}

// =============================================
// 📊 集計シート生成（フル再生成）
// =============================================

function generateSummarySheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var parentsSheet = ss.getSheetByName(SHEET_PARENTS);
  var recordsSheet = ss.getSheetByName(SHEET_RECORDS);
  if (!parentsSheet || !recordsSheet) return '先に setupSheets() を実行してください';

  // 保護者リスト: [email, childIdx, name, kana, class, date]
  var allParents = parentsSheet.getDataRange().getValues().slice(1);

  // チェック記録: [email, childIdx, catId, itemIdx, dateIdx, score, timestamp]
  var allRecords = recordsSheet.getDataRange().getValues().slice(1);

  // childKey(email|childIdx) → { catId_itemIdx_dateIdx: score } マップ
  var recordMap = {};
  allRecords.forEach(function(r) {
    var key = r[0] + '|' + r[1];
    if (!recordMap[key]) recordMap[key] = {};
    recordMap[key][r[2] + '_' + r[3] + '_' + r[4]] = Number(r[5]);
  });

  // 感想マップ: childKey → { dateIdx: text }
  var commentMap = {};
  var commentsSheet = ss.getSheetByName(SHEET_COMMENTS);
  if (commentsSheet && commentsSheet.getLastRow() > 1) {
    commentsSheet.getDataRange().getValues().slice(1).forEach(function(r) {
      var key = r[0] + '|' + r[1];
      if (!commentMap[key]) commentMap[key] = {};
      commentMap[key][Number(r[2])] = r[3] || '';
    });
  }

  ['赤小梅', '白小梅'].forEach(function(className) {
    // 同クラスの全子供をよみがな順に
    var children = allParents
      .filter(function(p){ return p[4] === className; })
      .sort(function(a, b){ return String(a[3]).localeCompare(String(b[3]), 'ja'); });
    // childKeyを付与
    children = children.map(function(p){
      return { key: p[0] + '|' + p[1], name: p[2], kana: p[3] };
    });

    var sheetName = className + '特別シート';
    var sheet = ss.getSheetByName(sheetName);
    if (children.length === 0) {
      if (sheet) { sheet.clearContents(); sheet.clearFormats(); }
      return;
    }

    if (sheet) {
      sheet.clearContents();
      sheet.clearFormats();
    } else {
      sheet = ss.insertSheet(sheetName);
    }

    var dateCount      = CHECK_DATES.length;
    var totalItemCount = ITEM_LABELS.reduce(function(n, c){ return n + c.items.length; }, 0);
    var nCats          = ITEM_LABELS.length;
    var scoreStartCol  = 3;

    // ── Row 1: 名前ヘッダー ──
    var row1 = ['カテゴリ', '項目'];
    children.forEach(function(child) {
      row1.push(child.name);
      for (var d = 1; d < dateCount; d++) row1.push('');
    });
    sheet.appendRow(row1);

    // ── Row 2: 日付ヘッダー ──
    var row2 = ['', ''];
    children.forEach(function(){ CHECK_DATES.forEach(function(d){ row2.push(d); }); });
    sheet.appendRow(row2);

    // ── Row 3: 成長度セパレータ ──
    var growthSepVals = ['成長度スコア', ''];
    children.forEach(function(){ CHECK_DATES.forEach(function(){ growthSepVals.push(''); }); });
    sheet.appendRow(growthSepVals);

    var growthDataStartRow = 4;

    // ── Rows 4〜8: カテゴリ別成長度 ──
    ITEM_LABELS.forEach(function(catObj) {
      var row = ['成長度', catObj.cat];
      children.forEach(function(child) {
        CHECK_DATES.forEach(function(_, di) {
          var total = 0;
          catObj.items.forEach(function(_, ii) {
            var s = (recordMap[child.key] && recordMap[child.key][catObj.id + '_' + ii + '_' + di]) || 0;
            total += SCORE_WEIGHTS_GAS[s] || 0;
          });
          row.push(Math.round(total / catObj.items.length) + '%');
        });
      });
      sheet.appendRow(row);
    });

    // ── Row 9: 総合成長度 ──
    var totalGrowthRow = ['成長度', '総合'];
    children.forEach(function(child) {
      CHECK_DATES.forEach(function(_, di) {
        var total = 0;
        ITEM_LABELS.forEach(function(catObj) {
          catObj.items.forEach(function(_, ii) {
            var s = (recordMap[child.key] && recordMap[child.key][catObj.id + '_' + ii + '_' + di]) || 0;
            total += SCORE_WEIGHTS_GAS[s] || 0;
          });
        });
        totalGrowthRow.push(Math.round(total / totalItemCount) + '%');
      });
    });
    sheet.appendRow(totalGrowthRow);

    // ── Row 10: 区切り ──
    var itemsSepRow   = growthDataStartRow + nCats + 1;
    sheet.appendRow(['']);
    var itemsStartRow = itemsSepRow + 1;

    // ── Rows 11〜: 項目データ ──
    var dataRows = [];
    ITEM_LABELS.forEach(function(catObj) {
      catObj.items.forEach(function(itemLabel, itemIdx) {
        var row = [catObj.cat, itemLabel];
        children.forEach(function(child) {
          CHECK_DATES.forEach(function(_, dateIdx) {
            var score = (recordMap[child.key] && recordMap[child.key][catObj.id + '_' + itemIdx + '_' + dateIdx]) || 0;
            row.push(score > 0 ? score : '');
          });
        });
        dataRows.push(row);
      });
    });
    if (dataRows.length > 0) {
      sheet.getRange(itemsStartRow, 1, dataRows.length, dataRows[0].length).setValues(dataRows);
    }

    // ── 感想欄 ──
    var commentSepRow = itemsStartRow + dataRows.length;
    var commentHeaderVals = ['保護者感想', 'チェック日'];
    children.forEach(function(ch) {
      commentHeaderVals.push(ch.name);
      for (var d = 1; d < dateCount; d++) commentHeaderVals.push('');
    });
    sheet.appendRow(commentHeaderVals);

    var commentDataStartRow = commentSepRow + 1;
    CHECK_DATES.forEach(function(date, di) {
      var row = ['感想', date];
      children.forEach(function(ch) {
        row.push((commentMap[ch.key] && commentMap[ch.key][di]) || '');
        for (var d = 1; d < dateCount; d++) row.push('');
      });
      sheet.appendRow(row);
    });

    // ── 書式設定 ──
    var headerBg = (className === '赤小梅') ? '#FFCDD2' : '#BBDEFB';

    children.forEach(function(_, ci) {
      var sc = scoreStartCol + ci * dateCount;
      if (dateCount > 1) sheet.getRange(1, sc, 1, dateCount).merge();
    });
    sheet.getRange(1, 1, 2, row1.length).setBackground(headerBg).setFontWeight('bold');
    sheet.getRange(1, 1, 2, 2).setBackground('#FCE4EC').setFontWeight('bold');

    sheet.getRange(3, 1, 1, row1.length)
      .setBackground('#FFC107').setFontWeight('bold').setFontColor('#FFFFFF');

    for (var r = 0; r <= nCats; r++) {
      var rowNum    = growthDataStartRow + r;
      var isTotal   = (r === nCats);
      sheet.getRange(rowNum, 1, 1, 2)
        .setBackground(isTotal ? '#FFF3E0' : '#FFF8E1').setFontWeight('bold');
      children.forEach(function(child, ci) {
        CHECK_DATES.forEach(function(_, di) {
          var col  = scoreStartCol + ci * dateCount + di;
          var cell = sheet.getRange(rowNum, col);
          var val  = parseInt(String(cell.getValue()).replace('%','')) || 0;
          if      (val >= 80) cell.setBackground('#C8E6C9');
          else if (val >= 60) cell.setBackground('#DCEDC8');
          else if (val >= 40) cell.setBackground('#FFE0B2');
          else if (val >  0)  cell.setBackground('#FFCDD2');
          else                cell.setBackground('#F5F5F5');
          cell.setHorizontalAlignment('center').setFontWeight('bold');
        });
      });
    }

    sheet.getRange(itemsSepRow, 1, 1, row1.length).setBackground('#E0E0E0');

    children.forEach(function(child, ci) {
      ITEM_LABELS.forEach(function(catObj, catIdx) {
        var catItemStartRow = itemsStartRow;
        for (var k = 0; k < catIdx; k++) catItemStartRow += ITEM_LABELS[k].items.length;
        catObj.items.forEach(function(_, itemIdx) {
          var dataRow = catItemStartRow + itemIdx;
          CHECK_DATES.forEach(function(_, dateIdx) {
            var score = (recordMap[child.key] && recordMap[child.key][catObj.id + '_' + itemIdx + '_' + dateIdx]) || 0;
            var col   = scoreStartCol + ci * dateCount + dateIdx;
            var cell  = sheet.getRange(dataRow, col);
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

    var catBgs      = ['#FFF9C4', '#E8F5E9', '#E3F2FD', '#FFF3E0', '#F3E5F5'];
    var catStartRow = itemsStartRow;
    ITEM_LABELS.forEach(function(catObj, i) {
      sheet.getRange(catStartRow, 1, catObj.items.length, 1).setBackground(catBgs[i % catBgs.length]);
      catStartRow += catObj.items.length;
    });

    sheet.getRange(commentSepRow, 1, 1, row1.length)
      .setBackground('#7E57C2').setFontWeight('bold').setFontColor('#FFFFFF');

    CHECK_DATES.forEach(function(_, di) {
      var rn = commentDataStartRow + di;
      sheet.getRange(rn, 1, 1, 2).setBackground('#EDE7F6').setFontWeight('bold');
      children.forEach(function(_, ci) {
        var sc2 = scoreStartCol + ci * dateCount;
        if (dateCount > 1) sheet.getRange(rn, sc2, 1, dateCount).merge();
        sheet.getRange(rn, sc2).setWrap(true).setVerticalAlignment('top').setBackground('#FAF8FF');
      });
      sheet.setRowHeight(rn, 60);
    });

    sheet.setColumnWidth(1, 75);
    sheet.setColumnWidth(2, 220);
    children.forEach(function(_, ci) {
      for (var d = 0; d < dateCount; d++) {
        sheet.setColumnWidth(scoreStartCol + ci * dateCount + d, 45);
      }
    });

    sheet.setFrozenRows(itemsSepRow);
    sheet.setFrozenColumns(2);
  });

  return '集計シートを生成しました！🌸';
}

// =============================================
// ⚡ 差分更新
// =============================================

function generateSummarySheetsSmart() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var props = PropertiesService.getScriptProperties();

  var lastRunStr  = props.getProperty('lastSummaryRun');
  var lastRunDate = lastRunStr ? new Date(lastRunStr) : new Date(0);

  var recordsSheet = ss.getSheetByName(SHEET_RECORDS);
  var parentsSheet = ss.getSheetByName(SHEET_PARENTS);
  if (!recordsSheet || !parentsSheet) return;

  // [email, childIdx, catId, itemIdx, dateIdx, score, timestamp]
  var allRecords = recordsSheet.getDataRange().getValues().slice(1);

  var changedRecords = allRecords.filter(function(r) {
    if (!r[6]) return false;
    var ts = (r[6] instanceof Date) ? r[6] : new Date(r[6]);
    return ts > lastRunDate;
  });

  if (changedRecords.length === 0) {
    props.setProperty('lastSummaryRun', new Date().toISOString());
    return;
  }

  // 変更があった childKey を収集
  var changedKeys = {};
  changedRecords.forEach(function(r){ changedKeys[r[0] + '|' + r[1]] = true; });

  // 変更のある子供のスコアをまとめる
  var recordMap = {};
  allRecords
    .filter(function(r){ return changedKeys[r[0] + '|' + r[1]]; })
    .forEach(function(r) {
      var key = r[0] + '|' + r[1];
      if (!recordMap[key]) recordMap[key] = {};
      recordMap[key][r[2] + '_' + r[3] + '_' + r[4]] = Number(r[5]);
    });

  var allParents = parentsSheet.getDataRange().getValues().slice(1);

  ['赤小梅', '白小梅'].forEach(function(className) {
    var sheetName  = className + '特別シート';
    var allInClass = allParents
      .filter(function(p){ return p[4] === className; })
      .sort(function(a, b){ return String(a[3]).localeCompare(String(b[3]), 'ja'); });

    if (allInClass.length === 0) return;

    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      generateSummarySheets();
      sheet = ss.getSheetByName(sheetName);
      if (!sheet) return;
    }

    allInClass
      .filter(function(p){ return changedKeys[p[0] + '|' + p[1]]; })
      .forEach(function(parentRow) {
        var childKey = parentRow[0] + '|' + parentRow[1];
        var childIdx = -1;
        for (var i = 0; i < allInClass.length; i++) {
          if (allInClass[i][0] + '|' + allInClass[i][1] === childKey) { childIdx = i; break; }
        }
        if (childIdx < 0) return;

        var startCol = 3 + childIdx * CHECK_DATES.length;
        _updateChildColumns(sheet, startCol, recordMap[childKey] || {});
      });
  });

  props.setProperty('lastSummaryRun', new Date().toISOString());
}

function _updateChildColumns(sheet, startCol, scores) {
  var nd         = CHECK_DATES.length;
  var totalItems = ITEM_LABELS.reduce(function(n, c){ return n + c.items.length; }, 0);
  var vals = [], bgs = [], fws = [], fcs = [];

  ITEM_LABELS.forEach(function(cat) {
    cat.items.forEach(function(_, itemIdx) {
      var rv = [], rb = [], rfw = [], rfc = [];
      CHECK_DATES.forEach(function(_, di) {
        var score = scores[cat.id + '_' + itemIdx + '_' + di] || 0;
        rv.push(score > 0 ? score : '');
        rb.push('#' + (SCORE_BG[score] || 'F5F5F5'));
        rfw.push(score === 4 ? 'bold' : 'normal');
        rfc.push(score === 4 ? '#2E7D32' : '#000000');
      });
      vals.push(rv); bgs.push(rb); fws.push(rfw); fcs.push(rfc);
    });
  });

  var range = sheet.getRange(11, startCol, totalItems, nd);
  range.setValues(vals);
  range.setBackgrounds(bgs);
  range.setFontWeights(fws);
  range.setFontColors(fcs);
  range.setHorizontalAlignments(
    Array.apply(null, Array(totalItems)).map(function(){
      return Array.apply(null, Array(nd)).map(function(){ return 'center'; });
    })
  );
}

// =============================================
// ⏰ トリガー管理
// =============================================

function setupDailyTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(function(t){ return t.getHandlerFunction() === 'generateSummarySheetsSmart'; })
    .forEach(function(t){ ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('generateSummarySheetsSmart')
    .timeBased().everyDays(1).atHour(6).create();
  return '✅ 毎朝6時の自動更新トリガーを設定しました！';
}

function deleteDailyTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(function(t){ return t.getHandlerFunction() === 'generateSummarySheetsSmart'; })
    .forEach(function(t){ ScriptApp.deleteTrigger(t); });
  return '🗑 トリガーを削除しました';
}

// =============================================
// 💾 年度末バックアップ＆クリア
// =============================================

function setupYearEndTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(function(t){ return t.getHandlerFunction() === 'yearEndBackupAndClear'; })
    .forEach(function(t){ ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('yearEndBackupAndClear')
    .timeBased().onMonthDay(31).atHour(23).create();
  return '✅ 年度末トリガーを設定しました（毎月31日23時→3月のみ実行）';
}

function yearEndBackupAndClear() {
  var now   = new Date();
  var month = now.getMonth() + 1;
  var day   = now.getDate();
  if (month !== 3 || day !== 31) {
    console.log('3月31日以外のためスキップ: ' + month + '/' + day);
    return;
  }
  _backupAndClear();
}

function manualBackupAndClear() {
  _backupAndClear();
}

function _backupAndClear() {
  var ss     = SpreadsheetApp.getActiveSpreadsheet();
  var file   = DriveApp.getFileById(ss.getId());
  var folder = DriveApp.getFolderById(BACKUP_FOLDER_ID);

  var now     = new Date();
  var reiwaYr = now.getFullYear() - 2018;
  var mm      = String(now.getMonth() + 1).padStart(2, '0');
  var dd      = String(now.getDate()).padStart(2, '0');
  var bkName  = '小梅クラス 成長チェック記録 R' + reiwaYr + '.' + mm + '.' + dd;

  var copy = file.makeCopy(bkName, folder);
  console.log('バックアップ: ' + bkName + ' (ID: ' + copy.getId() + ')');

  [SHEET_PARENTS, SHEET_RECORDS, SHEET_COMMENTS].forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) return;
    var last = sheet.getLastRow();
    if (last > 1) sheet.getRange(2, 1, last - 1, sheet.getLastColumn()).clearContent();
  });

  ss.getSheets().forEach(function(sheet) {
    if (sheet.getName().indexOf('特別シート') !== -1) {
      sheet.clearContents();
      sheet.clearFormats();
    }
  });

  PropertiesService.getScriptProperties().deleteProperty('lastSummaryRun');
  return 'バックアップ完了: ' + bkName + '\nデータをクリアしました。';
}

// =============================================
// 🔧 初期セットアップ
// =============================================

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (!ss.getSheetByName(SHEET_PARENTS)) {
    var s = ss.insertSheet(SHEET_PARENTS);
    s.appendRow(['メールアドレス', 'お子様番号(0-2)', 'お子様の名前', 'よみがな', 'クラス', '登録日']);
    s.setFrozenRows(1);
    [250, 80, 150, 150, 80, 120].forEach(function(w, i){ s.setColumnWidth(i + 1, w); });
    s.getRange(1, 1, 1, 6).setBackground('#FCE4EC').setFontWeight('bold');
  }

  if (!ss.getSheetByName(SHEET_RECORDS)) {
    var s2 = ss.insertSheet(SHEET_RECORDS);
    s2.appendRow(['メールアドレス', 'お子様番号(0-2)', 'カテゴリ', '項目番号', 'チェック日(0-4)', 'スコア(1-4)', '更新日時']);
    s2.setFrozenRows(1);
    [250, 80, 100, 80, 120, 80, 150].forEach(function(w, i){ s2.setColumnWidth(i + 1, w); });
    s2.getRange(1, 1, 1, 7).setBackground('#E3F2FD').setFontWeight('bold');
  }

  if (!ss.getSheetByName(SHEET_COMMENTS)) {
    var s3 = ss.insertSheet(SHEET_COMMENTS);
    s3.appendRow(['メールアドレス', 'お子様番号(0-2)', 'チェック日(0-4)', '感想テキスト', '更新日時']);
    s3.setFrozenRows(1);
    [250, 80, 100, 400, 150].forEach(function(w, i){ s3.setColumnWidth(i + 1, w); });
    s3.getRange(1, 1, 1, 5).setBackground('#F3E5F5').setFontWeight('bold');
  }

  return 'セットアップ完了！';
}

// =============================================
// 🧪 テストデータ挿入（テスト専用）
// =============================================

/** テストちゃん（白小梅・childIdx=0）を挿入 */
function addTestRecordsForTester() {
  var email = Session.getActiveUser().getEmail();
  _insertTestData(email, 0, 'テストちゃん', 'てすとちゃん', '白小梅',
    [2,3,2,2,3,3,2,2,2,2,3,2,3,3,3,2,1,2,3,2,2,2,2,2,2,1,1,2,2,1,1,1,1,2,3,3,3,2,1,2,3,3,3,3,3,2,3,3,3,3,2,3,2,2,3,2,2,2,3,3,3,3,2,2,2,2,2,3,3,2,2,2,2,2,2,2,3,2,2,3,2,2,2,3,1,2,3,3,2,2,2,2,2,2,2,2,2,3,2,1,2,3,2,2,3,2,2,2,2,1,2,2,2,1,2,1,3,3,3],
    [3,4,3,3,4,4,3,3,3,3,4,3,4,4,4,3,2,3,4,3,3,3,3,3,3,2,2,3,3,2,2,2,2,3,4,4,4,3,2,3,4,4,4,4,4,3,4,4,4,4,3,4,3,3,4,3,3,3,4,4,4,4,3,3,3,3,3,4,4,3,3,3,3,3,3,3,4,3,3,4,3,3,3,4,2,3,4,4,3,3,3,3,3,3,3,3,3,4,3,2,3,4,3,3,4,3,3,3,3,2,3,3,3,2,3,2,4,4,4]
  );
  return '完了！テストちゃん（白小梅）を登録しました';
}

/** 梅本花子（赤小梅・childIdx=0、ダミーメール）を挿入 */
function addTestRecordsForHanako() {
  _insertTestData('hanako.ume@test.example', 0, '梅本 花子', 'うめもと はなこ', '赤小梅',
    [4,4,3,3,4,4,3,3,3,4,4,3,4,4,4,3,2,3,2,2,1,1,2,2,2,1,1,1,1,1,1,1,1,2,2,2,2,1,1,1,2,2,2,2,2,1,2,2,2,2,1,2,1,1,2,1,1,1,4,4,4,3,2,2,2,2,2,3,3,2,2,2,2,1,2,2,4,3,3,4,3,3,3,4,2,3,4,4,3,3,2,2,3,3,2,3,3,4,3,2,3,4,3,2,4,3,3,3,3,2,2,2,2,1,2,1,4,4,3],
    [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,3,3,2,2,3,3,3,2,2,2,2,2,2,2,2,3,3,3,3,2,2,2,3,3,3,3,3,2,3,3,3,3,2,3,2,2,3,2,2,2,4,4,4,4,3,3,3,3,3,4,4,3,3,3,3,2,3,3,4,4,4,4,4,4,4,4,3,4,4,4,4,4,3,3,4,4,3,4,4,4,4,3,4,4,4,3,4,4,4,4,4,3,3,3,3,2,3,2,4,4,4]
  );
  return '完了！梅本花子（赤小梅）を登録しました';
}

function _insertTestData(email, childIdx, name, kana, cls, scores56, scores720) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 保護者リスト登録
  var pSheet = ss.getSheetByName(SHEET_PARENTS);
  var pRows  = pSheet.getDataRange().getValues().slice(1);
  var pIdx   = -1;
  for (var i = 0; i < pRows.length; i++) {
    if (pRows[i][0] === email && Number(pRows[i][1]) === childIdx) { pIdx = i; break; }
  }
  if (pIdx >= 0) {
    pSheet.getRange(pIdx + 2, 1, 1, 6).setValues([[email, childIdx, name, kana, cls, new Date()]]);
  } else {
    pSheet.appendRow([email, childIdx, name, kana, cls, new Date()]);
  }

  // チェック記録：同email+childIdxのデータを除いて再構築
  var rSheet  = ss.getSheetByName(SHEET_RECORDS);
  var allData = rSheet.getDataRange().getValues();
  var others  = allData.slice(1).filter(function(r){
    return !(r[0] === email && Number(r[1]) === childIdx);
  });
  var rLast = rSheet.getLastRow();
  if (rLast > 1) rSheet.getRange(2, 1, rLast - 1, allData[0].length).clearContent();
  if (others.length > 0) rSheet.getRange(2, 1, others.length, others[0].length).setValues(others);

  // スコアを一括挿入
  var cats = [
    { id: 'kotoba', count: 18 }, { id: 'seikatsu', count: 40 },
    { id: 'shokuji', count: 18 }, { id: 'rikai', count: 24 }, { id: 'undo', count: 19 }
  ];
  var rows = [];
  var now  = new Date();
  var idx  = 0;
  cats.forEach(function(cat) {
    for (var i = 0; i < cat.count; i++) {
      rows.push([email, childIdx, cat.id, i, 0, scores56[idx],  now]);
      rows.push([email, childIdx, cat.id, i, 1, scores720[idx], now]);
      idx++;
    }
  });
  var newLast = rSheet.getLastRow();
  rSheet.getRange(newLast + 1, 1, rows.length, 7).setValues(rows);

  generateSummarySheets();
}
