// ========================================
// 通知画面の機能（共有機能修正版）
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    checkAndProcessScheduledNotifications();
    loadAndDisplayNotifications();
});

// スケジュールされた通知をチェックして処理
function checkAndProcessScheduledNotifications() {
    const scheduledNotifications = JSON.parse(localStorage.getItem('scheduledNotifications') || '[]');
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const now = new Date();
    const currentWeekKey = getCurrentWeekKey();
    
    const processedNotifications = [];
    const remainingScheduled = [];
    
    scheduledNotifications.forEach(scheduled => {
        const triggerDate = new Date(scheduled.triggerDate);
        
        if (now >= triggerDate) {
            // 通知を実際の通知リストに追加
            const actualNotification = {
                id: Date.now() + Math.random(),
                title: scheduled.title,
                content: scheduled.content,
                type: scheduled.type,
                weekKey: scheduled.weekKey,
                createdAt: now.toISOString()
            };
            
            processedNotifications.push(actualNotification);
        } else {
            remainingScheduled.push(scheduled);
        }
    });
    
    if (processedNotifications.length > 0) {
        const updatedNotifications = [...processedNotifications, ...notifications];
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        localStorage.setItem('scheduledNotifications', JSON.stringify(remainingScheduled));
    }
}

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

// 通知を読み込んで表示
function loadAndDisplayNotifications() {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notificationList = document.getElementById('notificationList');
    
    if (notifications.length === 0) {
        notificationList.innerHTML = '<p class="empty">通知がありません</p>';
        return;
    }
    
    notificationList.innerHTML = '';
    
    // 新しい順にソート
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    notifications.forEach(notification => {
        const notificationElement = createNotificationElement(notification);
        notificationList.appendChild(notificationElement);
    });
}

// 通知要素を作成（共有機能追加版）
function createNotificationElement(notification) {
    const element = document.createElement('div');
    element.className = `notification-item ${notification.type}`;
    
    let icon = '📢';
    if (notification.type === 'ranking_immediate') icon = '🎉';
    else if (notification.type === 'ranking_3day') icon = '📅';
    else if (notification.type === 'ranking_reflection') icon = '✨';
    
    element.innerHTML = `
        <div class="notification-header">
            <span class="notification-icon">${icon}</span>
            <span class="notification-title">${notification.title}</span>
            <div class="notification-actions">
                <button class="share-btn" onclick="shareNotification('${notification.id}')" title="共有">
                    📤
                </button>
                <button class="delete-notification-btn" onclick="deleteNotification('${notification.id}')" title="削除">
                    🗑️
                </button>
            </div>
        </div>
        <div class="notification-content">${notification.content}</div>
        <div class="notification-date">${new Date(notification.createdAt).toLocaleDateString('ja-JP')}</div>
    `;
    
    return element;
}

// ========================================
// 共有機能（URL削除版）
// ========================================

// 通知を共有する
function shareNotification(notificationId) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notification = notifications.find(n => n.id == notificationId);
    
    if (!notification) {
        alert('通知が見つかりません');
        return;
    }
    
    const shareText = formatNotificationForShare(notification);
    
    // Web Share API が利用可能かチェック
    if (navigator.share) {
        shareWithWebAPI(notification, shareText);
    } else {
        // フォールバック：クリップボードにコピー
        shareWithClipboard(shareText);
    }
}

// Web Share API で共有（URL削除版）
function shareWithWebAPI(notification, shareText) {
    const shareData = {
        title: `メモアプリ通知: ${notification.title}`,
        text: shareText
        // URLを削除：ローカルファイルは共有できないため
    };
    
    navigator.share(shareData)
        .then(() => {
            showShareSuccess('共有しました！');
        })
        .catch((error) => {
            console.error('共有エラー:', error);
            // エラーの場合はクリップボードにフォールバック
            shareWithClipboard(shareText);
        });
}

// クリップボードにコピーして共有
function shareWithClipboard(shareText) {
    navigator.clipboard.writeText(shareText)
        .then(() => {
            showShareSuccess('通知内容をクリップボードにコピーしました！\n他のアプリで貼り付けて共有してください。');
        })
        .catch((error) => {
            console.error('クリップボードエラー:', error);
            // 最終フォールバック：テキスト選択
            showTextToShare(shareText);
        });
}

// 共有用テキストのフォーマット（改良版）
function formatNotificationForShare(notification) {
    let typeText = '';
    let emoji = '';
    
    switch (notification.type) {
        case 'ranking_immediate':
            typeText = 'ランキング完成';
            emoji = '🎉';
            break;
        case 'ranking_3day':
            typeText = '3日後振り返り';
            emoji = '📅';
            break;
        case 'ranking_reflection':
            typeText = '週末振り返り';
            emoji = '✨';
            break;
        default:
            typeText = '通知';
            emoji = '📢';
    }
    
    const date = new Date(notification.createdAt).toLocaleDateString('ja-JP');
    
    return `${emoji} 【${typeText}】${notification.title}

${notification.content}

━━━━━━━━━━━━━━━━━━━━
📅 ${date} | 📱 メモアプリより`;
}

// 共有成功メッセージを表示
function showShareSuccess(message) {
    // 既存の成功メッセージがあれば削除
    const existingMessage = document.querySelector('.share-success-message');
    if (existingMessage) {
        document.body.removeChild(existingMessage);
    }
    
    // 新しい成功メッセージを表示
    const successDiv = document.createElement('div');
    successDiv.className = 'share-success-message';
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    // 3秒後に自動で消去
    setTimeout(() => {
        if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
        }
    }, 3000);
}

// テキストを表示してユーザーが手動でコピーできるようにする（最終フォールバック）
function showTextToShare(shareText) {
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
        <div class="share-modal-content">
            <h3>📤 共有用テキスト</h3>
            <p>以下のテキストを選択してコピーしてください：</p>
            <textarea readonly class="share-textarea">${shareText}</textarea>
            <div class="share-modal-buttons">
                <button onclick="selectShareText()" class="select-text-btn">📋 テキストを選択</button>
                <button onclick="closeShareModal()" class="close-modal-btn">✕ 閉じる</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 共有テキストを選択
function selectShareText() {
    const textarea = document.querySelector('.share-textarea');
    if (textarea) {
        textarea.select();
        textarea.setSelectionRange(0, 99999); // モバイル対応
        
        // 選択後にコピーを試行
        try {
            document.execCommand('copy');
            showShareSuccess('テキストをコピーしました！');
            closeShareModal();
        } catch (err) {
            console.error('コピーエラー:', err);
        }
    }
}

// 共有モーダルを閉じる
function closeShareModal() {
    const modal = document.querySelector('.share-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// ========================================
// 通知削除機能
// ========================================

// 通知を削除する
function deleteNotification(notificationId) {
    if (!confirm('この通知を削除しますか？')) {
        return;
    }
    
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = notifications.filter(n => n.id != notificationId);
    
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    // 画面を再読み込み
    loadAndDisplayNotifications();
    
    showShareSuccess('通知を削除しました');
}