// ========================================
// 編集画面の機能
// ========================================

let currentWeekKey = '';
let availableWords = [];

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', function() {
    currentWeekKey = getCurrentWeekKey();
    updateWeekInfo();
    checkEditPermission();
    loadAvailableWords();
    setupEventListeners();
});

// 現在の週のキーを取得（日曜日開始）
function getCurrentWeekKey() {
    const now = new Date();
    const sunday = new Date(now);
    const dayOfWeek = now.getDay();
    sunday.setDate(now.getDate() - dayOfWeek);
    
    const year = sunday.getFullYear();
    const month = sunday.getMonth() + 1;
    const date = sunday.getDate();
    
    return `${year}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
}

// 週情報の表示を更新
function updateWeekInfo() {
    const weekInfo = document.getElementById('weekInfo');
    const sunday = new Date(currentWeekKey);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    
    weekInfo.textContent = `対象期間: ${formatDate(sunday)} ～ ${formatDate(saturday)}`;
}

// 日付フォーマット
function formatDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 編集権限をチェック
function checkEditPermission() {
    const rankings = JSON.parse(localStorage.getItem('weeklyRankings') || '{}');
    const editStatus = document.getElementById('editStatus');
    const saveButton = document.getElementById('saveRankingButton');
    
    if (rankings[currentWeekKey]) {
        editStatus.textContent = '今週のランキングは既に設定済みです。来週まで編集できません。';
        editStatus.style.color = '#f44336';
        saveButton.disabled = true;
        disableAllInputs();
    } else {
        editStatus.textContent = '今週のランキングを設定できます。';
        editStatus.style.color = '#4CAF50';
    }
}

// 全ての入力を無効化
function disableAllInputs() {
    document.getElementById('themeInput').disabled = true;
    document.getElementById('rank1').disabled = true;
    document.getElementById('rank2').disabled = true;
    document.getElementById('rank3').disabled = true;
}

// メモからワードを抽出
function loadAvailableWords() {
    const memos = JSON.parse(localStorage.getItem('memos') || '[]');
    const wordSet = new Set();
    
    // メモの内容からワードを抽出（ひらがな、カタカナ、漢字、英数字）
    memos.forEach(memo => {
        const words = memo.content.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBFa-zA-Z0-9]+/g);
        if (words) {
            words.forEach(word => {
                if (word.length >= 2) { // 2文字以上のワードのみ
                    wordSet.add(word);
                }
            });
        }
    });
    
    availableWords = Array.from(wordSet);
    displayAvailableWords();
    updateSelectOptions();
}

// 利用可能なワードを表示
function displayAvailableWords() {
    const container = document.getElementById('availableWords');
    container.innerHTML = '';
    
    if (availableWords.length === 0) {
        container.innerHTML = '<p class="no-words">メモからワードが見つかりませんでした。先にメモを作成してください。</p>';
        return;
    }
    
    availableWords.forEach(word => {
        const wordElement = document.createElement('span');
        wordElement.className = 'word-tag';
        wordElement.textContent = word;
        container.appendChild(wordElement);
    });
}

// セレクトボックスの選択肢を更新
function updateSelectOptions() {
    const selects = ['rank1', 'rank2', 'rank3'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">選択してください</option>';
        
        availableWords.forEach(word => {
            const option = document.createElement('option');
            option.value = word;
            option.textContent = word;
            select.appendChild(option);
        });
    });
}

// イベントリスナーの設定
function setupEventListeners() {
    const themeInput = document.getElementById('themeInput');
    const saveButton = document.getElementById('saveRankingButton');
    const debugDeleteButton = document.getElementById('debugDeleteButton');
    const debugDeleteAllButton = document.getElementById('debugDeleteAllButton');
    const selects = ['rank1', 'rank2', 'rank3'];
    
    // テーマ入力の監視
    themeInput.addEventListener('input', checkFormCompletion);
    
    // ランキング選択の監視
    selects.forEach(selectId => {
        document.getElementById(selectId).addEventListener('change', function(event) {
            checkDuplicateSelection(event.target);
            checkFormCompletion();
        });
    });
    
    // 保存ボタン
    saveButton.addEventListener('click', saveRanking);

    // デバッグ用削除ボタン
    debugDeleteButton.addEventListener('click', deleteCurrentWeekRanking);
    debugDeleteAllButton.addEventListener('click', deleteAllRankings);
}

// 重複選択のチェック
function checkDuplicateSelection(changedSelect = null) {
    const rank1 = document.getElementById('rank1').value;
    const rank2 = document.getElementById('rank2').value;
    const rank3 = document.getElementById('rank3').value;
    
    const values = [rank1, rank2, rank3].filter(v => v !== '');
    const uniqueValues = new Set(values);
    
    if (values.length !== uniqueValues.size) {
        alert('同じワードを複数回選択することはできません。');
        
        // 最後に変更されたセレクトボックスをリセット
        if (changedSelect) {
            changedSelect.value = '';
        }
        
        return false;
    }
    return true;
}

// フォーム完成度のチェック
function checkFormCompletion() {
    const theme = document.getElementById('themeInput').value.trim();
    const rank1 = document.getElementById('rank1').value;
    const rank2 = document.getElementById('rank2').value;
    const rank3 = document.getElementById('rank3').value;
    const saveButton = document.getElementById('saveRankingButton');
    
    if (theme && rank1 && rank2 && rank3) {
        saveButton.disabled = false;
    } else {
        saveButton.disabled = true;
    }
}

// ランキングを保存
function saveRanking() {
    if (!checkDuplicateSelection()) return;
    
    const theme = document.getElementById('themeInput').value.trim();
    const ranking = {
        theme: theme,
        rank1: document.getElementById('rank1').value,
        rank2: document.getElementById('rank2').value,
        rank3: document.getElementById('rank3').value,
        createdAt: new Date().toISOString(),
        weekKey: currentWeekKey
    };
    
    // ランキングを保存
    const rankings = JSON.parse(localStorage.getItem('weeklyRankings') || '{}');
    rankings[currentWeekKey] = ranking;
    localStorage.setItem('weeklyRankings', JSON.stringify(rankings));
    
    // 通知を作成
    createNotification(ranking);
    
    alert('今週のランキングが保存されました！');
    checkEditPermission(); // 編集状態を更新
}

// 通知を作成
function createNotification(ranking) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    // 即座の通知を作成
    const immediateNotification = {
        id: Date.now(),
        type: 'ranking_immediate',
        title: `今週のランキングが決定しました！`,
        content: `今週の${ranking.theme}ワードTOP3は次の三つです：\n1位: ${ranking.rank1}\n2位: ${ranking.rank2}\n3位: ${ranking.rank3}`,
        createdAt: new Date().toISOString(),
        weekKey: currentWeekKey,
        ranking: ranking
    };
    
    // 新しい通知を先頭に追加
    notifications.unshift(immediateNotification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // 3日後の通知をスケジュール
    scheduleThreeDayNotification(ranking);
    
    // 次週の振り返り通知をスケジュール
    scheduleNextWeekReflection(ranking);
}

// 3日後の通知をスケジュール
function scheduleThreeDayNotification(ranking) {
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    
    const scheduledNotifications = JSON.parse(localStorage.getItem('scheduledNotifications') || '[]');
    
    const threeDayNotification = {
        id: `3day_${currentWeekKey}_${Date.now()}`,
        type: 'ranking_3day',
        weekKey: currentWeekKey,
        scheduledFor: threeDaysLater.toISOString(),
        ranking: ranking
    };
    
    scheduledNotifications.push(threeDayNotification);
    localStorage.setItem('scheduledNotifications', JSON.stringify(scheduledNotifications));
}

// 次週の振り返り通知をスケジュール
function scheduleNextWeekReflection(ranking) {
    const nextSunday = new Date(currentWeekKey);
    nextSunday.setDate(nextSunday.getDate() + 7);
    
    const scheduledNotifications = JSON.parse(localStorage.getItem('scheduledNotifications') || '[]');
    
    const reflectionNotification = {
        id: `reflection_${currentWeekKey}_${Date.now()}`,
        type: 'ranking_reflection',
        weekKey: currentWeekKey,
        scheduledFor: nextSunday.toISOString(),
        ranking: ranking
    };
    
    scheduledNotifications.push(reflectionNotification);
    localStorage.setItem('scheduledNotifications', JSON.stringify(scheduledNotifications));
}

// ========================================
// デバッグ用機能
// ========================================

// 今週のランキングを削除
function deleteCurrentWeekRanking() {
    if (!confirm('今週のランキングを削除しますか？\nこの操作は元に戻せません。')) {
        return;
    }
    
    const rankings = JSON.parse(localStorage.getItem('weeklyRankings') || '{}');
    
    if (rankings[currentWeekKey]) {
        delete rankings[currentWeekKey];
        localStorage.setItem('weeklyRankings', JSON.stringify(rankings));
        
        // 関連する通知も削除
        deleteRelatedNotifications(currentWeekKey);
        
        alert('今週のランキングを削除しました。');
        
        // 画面を更新
        checkEditPermission();
        clearForm();
    } else {
        alert('今週のランキングは存在しません。');
    }
}

// 全てのランキングを削除
function deleteAllRankings() {
    if (!confirm('全てのランキングを削除しますか？\nこの操作は元に戻せません。')) {
        return;
    }
    
    if (!confirm('本当に全てのランキングを削除しますか？\n最終確認です。')) {
        return;
    }
    
    // 全てのランキングを削除
    localStorage.removeItem('weeklyRankings');
    
    // 全てのランキング関連通知を削除
    deleteAllRankingNotifications();
    
    alert('全てのランキングを削除しました。');
    
    // 画面を更新
    checkEditPermission();
    clearForm();
}

// 特定週のランキングに関連する通知を削除
function deleteRelatedNotifications(weekKey) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const filteredNotifications = notifications.filter(notification => 
        notification.type !== 'ranking' || notification.weekKey !== weekKey
    );
    localStorage.setItem('notifications', JSON.stringify(filteredNotifications));
}

// 全てのランキング関連通知を削除
function deleteAllRankingNotifications() {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const filteredNotifications = notifications.filter(notification => 
        notification.type !== 'ranking'
    );
    localStorage.setItem('notifications', JSON.stringify(filteredNotifications));
}

// フォームをクリア
function clearForm() {
    document.getElementById('themeInput').value = '';
    document.getElementById('rank1').value = '';
    document.getElementById('rank2').value = '';
    document.getElementById('rank3').value = '';
    checkFormCompletion();
}