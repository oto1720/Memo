// ========================================
// 1. HTML要素を取得する
// ========================================
const memoContent = document.getElementById('memoContent');
const saveButton = document.getElementById('saveButton');
const memoList = document.getElementById('memoList');

// フィルター関連の要素
const searchInput = document.getElementById('searchInput');
const dateFilter = document.getElementById('dateFilter');
const customDateRange = document.getElementById('customDateRange');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const lengthFilter = document.getElementById('lengthFilter');
const sortOrder = document.getElementById('sortOrder');
const clearFilterButton = document.getElementById('clearFilters');
const totalCount = document.getElementById('totalCount');

// ========================================
// 2. メモを保存する配列
// ========================================
let memos = [];
let filteredMemos = []; // フィルター済みメモを保存する配列

// ========================================
// 3. ページを開いたときに実行する
// ========================================
// ローカルストレージからメモを読み込む
loadMemos();
// フィルターイベントリスナーを設定
setupFilterListeners();
// メモを画面に表示する
applyFilters();

// ========================================
// 4. 保存ボタンを押したときの処理
// ========================================
saveButton.addEventListener('click', function() {
  // 入力された値を取得
  const content = memoContent.value;

  // 内容が空だったら保存しない
  if (content === '') {
    alert('メモの内容を入力してください');
    return;
  }

  // 新しいメモを作る
  const newMemo = {
    id: Date.now(), // IDは現在時刻を使う
    content: content,
    date: new Date().toLocaleString('ja-JP'), // 日付と時刻
    dateObj: new Date(), // 日付オブジェクト（フィルター用）
    length: content.length // 内容の文字数（フィルター用）
  };

  // メモを配列の先頭に追加
  memos.unshift(newMemo);

  // ローカルストレージに保存
  saveMemos();

  // 入力欄を空にする
  memoContent.value = '';

  // 画面を更新
  // フィルターを適用して表示
  applyFilters();
});

// ========================================
// 5. フィルターイベントリスナーの設定
// ========================================
function setupFilterListeners() {
  // 検索入力
  searchInput.addEventListener('input', applyFilters);

  // 日付フィルター
  dateFilter.addEventListener('change', function() {
    // カスタム範囲が選ばれたら日付入力欄を表示
    if (dateFilter.value === 'custom') {
      customDateRange.style.display = 'block';
    } else {
      customDateRange.style.display = 'none';
    }
    applyFilters();
  });

  // カスタム日付入力
  startDate.addEventListener('change', applyFilters);
  endDate.addEventListener('change', applyFilters);
  
  // 文字数・並び順フィルター
  lengthFilter.addEventListener('change', applyFilters);
  sortOrder.addEventListener('change', applyFilters);

  // フィルタークリアボタン
  clearFilterButton.addEventListener('click', clearAllFilters);
}

// ========================================
// 6. フィルターを適用する関数
// ========================================
function applyFilters() {
  filteredMemos = [...memos]; // 元の配列をコピー

  // キーワード検索
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm) {
    filteredMemos = filteredMemos.filter(memo =>
      memo.content.toLowerCase().includes(searchTerm)
    );
  }

  // 日付フィルター
  const dateFilterValue = dateFilter.value;
  if (dateFilterValue !== 'all') {
    filteredMemos = filteredMemos.filter(memo => {
      const memoDate = new Date(memo.dateObj);
      const now = new Date();

      switch (dateFilterValue) {
        case 'today':
          return memoDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return memoDate >= weekAgo;
        case 'month':
          return memoDate.getMonth() === now.getMonth() && memoDate.getFullYear() === now.getFullYear();
        case 'custom':
          const start = startDate.value ? new Date(startDate.value) : null;
          const end = endDate.value ? new Date(endDate.value + 'T23:59:59') : null;
          
          if (start && end) {
            return memoDate >= start && memoDate <= end;
          } else if (start) {
            return memoDate >= start;
          } else if (end) {
            return memoDate <= end;
          }
          return true;
        default:
          return true;
      }
    });
  }

  // 文字数フィルター
  const lengthFilterValue = lengthFilter.value;
  if (lengthFilterValue !== 'all') {
    filteredMemos = filteredMemos.filter(memo => {
      switch (lengthFilterValue) {
        case 'short':
          return memo.length <= 10;
        case 'medium':
          return memo.length > 10 && memo.length <= 50;
        case 'long':
          return memo.length > 50;
        default:
          return true;
      }
    });
  }
  

  // 並び順フィルター
  const sortValue = sortOrder.value;
  filteredMemos.sort((a, b) => {
    switch (sortValue) {
      case 'newest':
        return b.id - a.id;
      case 'oldest':
        return a.id - b.id;
      case 'shortest':
        return a.length - b.length;
      case 'longest':
        return b.length - a.length;
      default:
        return b.id - a.id;
    }
  });
  
  // 結果を表示
  showFilteredMemos();
  updateFilterCount();
}

// ========================================
// 7. フィルター済みメモを画面に表示する関数
// ========================================
function showFilteredMemos() {
  // メモ表示エリアを一度空にする
  memoList.innerHTML = '';
  // フィルター結果が0件の場合の処理
  if (filteredMemos.length === 0) {
    // 元のメモ自体が0件の場合
    if (memos.length === 0) {
      memoList.innerHTML = '<p class="empty">メモがまだありません</p>';
    } else {
      // メモはあるがフィルター条件に一致するものがない場合
      memoList.innerHTML = '<p class="empty">条件に一致するメモがありません</p>';
    }
    return;
  }

  // フィルター済みメモを1つずつ処理して画面に表示
  filteredMemos.forEach(function(memo) {
    const card = document.createElement('div');
    card.className = 'memo-card';

    // 内容（検索ハイライト付き）
    const contentElement = document.createElement('p');
    contentElement.innerHTML = highlightSearchTerm(memo.content, searchInput.value);

    // 日付と文字数
    const metaElement = document.createElement('div');
    metaElement.className = 'memo-meta';
    metaElement.innerHTML = `
      <span class="date">${memo.date}</span>
      <span class="char-count">${memo.length}文字</span>
    `;

    // 削除ボタン
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', function() {
      deleteMemo(memo.id);
    });

    card.appendChild(contentElement);
    card.appendChild(metaElement);
    card.appendChild(deleteButton);
    memoList.appendChild(card);
  });
}

// ========================================
// 8. 検索ワードをハイライトする関数
// ========================================
function highlightSearchTerm(text, searchTerm) {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// ========================================
// 9. フィルター件数を更新する関数
// ========================================
function updateFilterCount() {
  totalCount.textContent = filteredMemos.length;
}

// ========================================
// 10. 全フィルターをクリアする関数
// ========================================
function clearAllFilters() {
  searchInput.value = '';
  dateFilter.value = 'all';
  customDateRange.style.display = 'none';
  startDate.value = '';
  endDate.value = '';
  lengthFilter.value = 'all';
  sortOrder.value = 'newest';
  applyFilters();
}

// ========================================
// 11. メモを削除する関数（修正）
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

  // 画面を更新（フィルターを再適用）
  applyFilters();
}

// ========================================
// 12. メモをローカルストレージに保存する関数
// ========================================
function saveMemos() {
  // 配列を文字列に変換して保存
  localStorage.setItem('memos', JSON.stringify(memos));
}

// ========================================
// 13. メモをローカルストレージから読み込む関数
// ========================================
function loadMemos() {
  // ローカルストレージから読み込む
  const saved = localStorage.getItem('memos');

  // 保存されていたら配列に戻す
  if (saved) {
    memos = JSON.parse(saved);
    // 古いメモにdateObjとlengthがない場合は追加
    memos = memos.map(memo => ({
      ...memo,
      dateObj: memo.dateObj ? new Date(memo.dateObj) : new Date(),
      length: memo.length || memo.content.length
    }));
  }
}

// ========================================
//  拡張アイデア（チャレンジ課題）
// ========================================
// - 検索機能を追加する
// - メモを編集できるようにする
// - タグやカテゴリを追加する
// - 色を変えられるようにする
// - 重要度をつけられるようにする
