// ========================================
// 通知画面の機能
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
        const scheduledTime = new Date(scheduled.scheduledFor);
        
        if (scheduled.type === 'ranking_3day') {
            // 3日後の通知：現在の週と同じ場合のみ処理
            if (scheduled.weekKey === currentWeekKey && now >= scheduledTime) {
                const threeDayNotification = {
                    id: Date.now() + Math.random(),
                    type: 'ranking_3day',
                    title: '今週のランキング再確認',
                    content: `今週の${scheduled.ranking.theme}ワードTOP3は次の三つです：\n1位: ${scheduled.ranking.rank1}\n2位: ${scheduled.ranking.rank2}\n3位: ${scheduled.ranking.rank3}\n\n意識して過ごせていますか？`,
                    createdAt: now.toISOString(),
                    weekKey: scheduled.weekKey
                };
                processedNotifications.push(threeDayNotification);
            } else if (scheduled.weekKey === currentWeekKey) {
                // まだ時間が来ていない場合は保持
                remainingScheduled.push(scheduled);
            }
            // 週が変わった場合は削除（何もしない）
        } else if (scheduled.type === 'ranking_reflection') {
            // 振り返り通知：スケジュール時間が来たら処理
            if (now >= scheduledTime) {
                const encouragingMessages = [
                    'お疲れ様でした！今週も頑張りましたね✨',
                    'すてきな一週間でした！次週も応援しています🌟',
                    'よく頑張りました！継続は力なりです💪',
                    '今週も成長できましたね！次も楽しみです🎉',
                    'ナイスファイト！来週も一緒に頑張りましょう🔥'
                ];
                
                const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
                
                const reflectionNotification = {
                    id: Date.now() + Math.random(),
                    type: 'ranking_reflection',
                    title: '先週の振り返り',
                    content: `先週の${scheduled.ranking.theme}ワードTOP3は次の三つでした！\n1位: ${scheduled.ranking.rank1}\n2位: ${scheduled.ranking.rank2}\n3位: ${scheduled.ranking.rank3}\n\n${randomMessage}`,
                    createdAt: now.toISOString(),
                    weekKey: scheduled.weekKey
                };
                processedNotifications.push(reflectionNotification);
            } else {
                // まだ時間が来ていない場合は保持
                remainingScheduled.push(scheduled);
            }
        }
    });
    
    // 処理された通知を追加
    if (processedNotifications.length > 0) {
        processedNotifications.reverse().forEach(notification => {
            notifications.unshift(notification);
        });
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }
    
    // 残りのスケジュール通知を保存
    localStorage.setItem('scheduledNotifications', JSON.stringify(remainingScheduled));
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
        notificationList.innerHTML = '<p class="empty">通知がまだありません</p>';
        return;
    }
    
    notificationList.innerHTML = '';
    
    // 新しい順に表示（既にunshiftで先頭に追加されているので、そのまま表示）
    notifications.forEach(notification => {
        const notificationElement = createNotificationElement(notification);
        notificationList.appendChild(notificationElement);
    });
}

// 通知要素を作成
function createNotificationElement(notification) {
    const element = document.createElement('div');
    element.className = `notification-item ${notification.type}`;
    
    const createdDate = new Date(notification.createdAt);
    
    // 通知タイプに応じてアイコンを追加
    let icon = '📢';
    if (notification.type === 'ranking_immediate') {
        icon = '🎉';
    } else if (notification.type === 'ranking_3day') {
        icon = '📅';
    } else if (notification.type === 'ranking_reflection') {
        icon = '✨';
    }
    
    element.innerHTML = `
        <div class="notification-header">
            <span class="notification-icon">${icon}</span>
            <span class="notification-title">${notification.title}</span>
        </div>
        <div class="notification-content">${notification.content}</div>
        <div class="notification-date">${createdDate.toLocaleString('ja-JP')}</div>
    `;
    
    return element;
}