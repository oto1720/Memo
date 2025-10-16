// ========================================
// 1. HTML要素を取得する
// ========================================
// const memoTitle = document.getElementById('memoTitle');
const memoContent = document.getElementById('memoContent');
const saveButton = document.getElementById('saveButton');
const memoList = document.getElementById('memoList');

// ========================================
// 2. メモを保存する配列
// ========================================
let memos = [];

// ========================================
// 3. ページを開いたときに実行する
// ========================================
// ローカルストレージからメモを読み込む
loadMemos();
// メモを画面に表示する
showMemos();

// ========================================
// 4. 保存ボタンを押したときの処理
// ========================================
saveButton.addEventListener('click', function() {
  // 入力された値を取得
  // const title = memoTitle.value;
  const content = memoContent.value;

  // 内容が空だったら保存しない
  if (content === '') {
    alert('メモの内容を入力してください');
    return;
  }

  // 新しいメモを作る
  const newMemo = {
    id: Date.now(), // IDは現在時刻を使う
    // title: title || '無題', // タイトルが空なら「無題」にする
    content: content,
    date: new Date().toLocaleString('ja-JP') // 日付と時刻
  };

  // メモを配列の先頭に追加
  memos.unshift(newMemo);

  // ローカルストレージに保存
  saveMemos();

  // 入力欄を空にする
  // memoTitle.value = '';
  memoContent.value = '';

  // 画面を更新
  showMemos();
});

// ========================================
// 5. メモを画面に表示する関数
// ========================================
function showMemos() {
  // 一旦表示をクリア
  memoList.innerHTML = '';

  // メモがない場合
  if (memos.length === 0) {
    memoList.innerHTML = '<p class="empty">メモがまだありません</p>';
    return;
  }

  // メモを1つずつ表示
  memos.forEach(function(memo) {
    // メモカードを作る
    const card = document.createElement('div');
    card.className = 'memo-card';

    // タイトル
    // const titleElement = document.createElement('h3');
    // titleElement.textContent = memo.title;

    // 内容
    const contentElement = document.createElement('p');
    contentElement.textContent = memo.content;

    // 日付
    const dateElement = document.createElement('div');
    dateElement.className = 'date';
    dateElement.textContent = memo.date;

    // 削除ボタン
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', function() {
      deleteMemo(memo.id);
    });

    // カードに要素を追加
    // card.appendChild(titleElement);
    card.appendChild(contentElement);
    card.appendChild(dateElement);
    card.appendChild(deleteButton);

    // リストに追加
    memoList.appendChild(card);
  });
}

// ========================================
// 6. メモを削除する関数
// ========================================
function deleteMemo(id) {
  // 確認
  if (!confirm('このメモを削除しますか？')) {
    return;
  }

  // IDが一致しないメモだけ残す（=削除）
  memos = memos.filter(function(memo) {
    return memo.id !== id;
  });

  // ローカルストレージに保存
  saveMemos();

  // 画面を更新
  showMemos();
}

// ========================================
// 7. メモをローカルストレージに保存する関数
// ========================================
function saveMemos() {
  // 配列を文字列に変換して保存
  localStorage.setItem('memos', JSON.stringify(memos));
}

// ========================================
// 8. メモをローカルストレージから読み込む関数
// ========================================
function loadMemos() {
  // ローカルストレージから読み込む
  const saved = localStorage.getItem('memos');

  // 保存されていたら配列に戻す
  if (saved) {
    memos = JSON.parse(saved);
  }
}

// ========================================
// 9. 拡張アイデア（チャレンジ課題）
// ========================================
// - 検索機能を追加する
// - メモを編集できるようにする
// - タグやカテゴリを追加する
// - 色を変えられるようにする
// - 重要度をつけられるようにする
