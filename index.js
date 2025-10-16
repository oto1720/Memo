// ========================================
// ダッシュボード機能
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
});

// ========================================
// データ読み込みと表示
// ========================================
function loadDashboardData() {
    updateSummaryCards();
    loadRecentMemos();
    loadCurrentRanking();
    loadRecentNotifications();
}

// サマリーカードの更新
function updateSummaryCards() {
    const memos = JSON.parse(localStorage.getItem('memos') || '[]');
    const rankings = JSON.parse(localStorage.getItem('weeklyRankings') || '{}');
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    document.getElementById('memoCount').textContent = memos.length;
    document.getElementById('rankingCount').textContent = Object.keys(rankings).length;
    document.getElementById('notificationCount').textContent = notifications.length;
}

// 最近のメモを表示（最新3件）
function loadRecentMemos() {
    const memos = JSON.parse(localStorage.getItem('memos') || '[]');
    const recentMemosContainer = document.getElementById('recentMemos');
    
    if (memos.length === 0) {
        recentMemosContainer.innerHTML = '<p class="no-data">まだメモがありません</p>';
        return;
    }
    
    const recentMemos = memos.slice(0, 3);
    recentMemosContainer.innerHTML = '';
    
    recentMemos.forEach(memo => {
        const memoElement = document.createElement('div');
        memoElement.className = 'recent-memo';
        
        const preview = memo.content.length > 50 
            ? memo.content.substring(0, 50) + '...' 
            : memo.content;
            
        memoElement.innerHTML = `
            <div class="recent-content">${preview}</div>
            <div class="recent-meta">
                <span class="recent-date">${memo.date}</span>
                <span class="recent-length">${memo.length}文字</span>
            </div>
        `;
        
        recentMemosContainer.appendChild(memoElement);
    });
}

// 今週のランキングを表示
function loadCurrentRanking() {
    const currentWeekKey = getCurrentWeekKey();
    const rankings = JSON.parse(localStorage.getItem('weeklyRankings') || '{}');
    const currentRankingContainer = document.getElementById('currentRanking');
    
    if (!rankings[currentWeekKey]) {
        currentRankingContainer.innerHTML = `
            <div class="no-ranking-dashboard">
                <p>今週のランキングはまだ作成されていません</p>
                <button onclick="location.href='edit.html'" class="create-ranking-btn">
                    ランキングを作成
                </button>
            </div>
        `;
        return;
    }
    
    const ranking = rankings[currentWeekKey];
    currentRankingContainer.innerHTML = `
        <div class="ranking-preview">
            <h4>${ranking.theme}ワードTOP3</h4>
            <div class="ranking-list">
                <div class="rank-preview">🥇 ${ranking.rank1}</div>
                <div class="rank-preview">🥈 ${ranking.rank2}</div>
                <div class="rank-preview">🥉 ${ranking.rank3}</div>
            </div>
        </div>
    `;
}

// 最新の通知を表示（最新3件）
function loadRecentNotifications() {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const recentNotificationsContainer = document.getElementById('recentNotifications');
    
    if (notifications.length === 0) {
        recentNotificationsContainer.innerHTML = '<p class="no-data">まだ通知がありません</p>';
        return;
    }
    
    const recentNotifications = notifications.slice(0, 3);
    recentNotificationsContainer.innerHTML = '';
    
    recentNotifications.forEach(notification => {
        const notificationElement = document.createElement('div');
        notificationElement.className = 'recent-notification';
        
        let icon = '📢';
        if (notification.type === 'ranking_immediate') icon = '🎉';
        else if (notification.type === 'ranking_3day') icon = '📅';
        else if (notification.type === 'ranking_reflection') icon = '✨';
        
        notificationElement.innerHTML = `
            <div class="notification-preview">
                <span class="notification-icon">${icon}</span>
                <span class="notification-title">${notification.title}</span>
            </div>
            <div class="notification-date">${new Date(notification.createdAt).toLocaleDateString('ja-JP')}</div>
        `;
        
        recentNotificationsContainer.appendChild(notificationElement);
    });
}

// 現在の週のキーを取得
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