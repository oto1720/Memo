// ========================================
// ランキング画面の機能
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    loadAndDisplayRankings();
});

// ランキングを読み込んで表示
function loadAndDisplayRankings() {
    const rankings = JSON.parse(localStorage.getItem('weeklyRankings') || '{}');
    const rankingList = document.getElementById('rankingList');
    
    // 週キーでソート（新しい順）
    const sortedRankings = Object.entries(rankings)
        .sort(([a], [b]) => new Date(b) - new Date(a));
    
    if (sortedRankings.length === 0) {
        rankingList.innerHTML = '<div class="no-ranking">まだランキングが作成されていません。</div>';
        return;
    }
    
    rankingList.innerHTML = '';
    
    sortedRankings.forEach(([weekKey, ranking]) => {
        const rankingCard = createRankingCard(ranking, weekKey);
        rankingList.appendChild(rankingCard);
    });
}

// ランキングカードを作成
function createRankingCard(ranking, weekKey) {
    const card = document.createElement('div');
    card.className = 'ranking-card';
    
    const sunday = new Date(weekKey);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    
    card.innerHTML = `
        <div class="ranking-title">${ranking.theme}ワードTOP3</div>
        <div class="ranking-subtitle">
            ${formatDate(sunday)} ～ ${formatDate(saturday)}の期間
        </div>
        
        <div class="podium">
            <div class="first-place">
                <div class="rank-number">1</div>
                <div class="rank-word">${ranking.rank1}</div>
            </div>
            
            <div class="second-third-places">
                <div class="rank-item">
                    <div class="rank-medal second">2</div>
                    <div class="rank-word-text">${ranking.rank2}</div>
                </div>
                
                <div class="rank-item">
                    <div class="rank-medal third">3</div>
                    <div class="rank-word-text">${ranking.rank3}</div>
                </div>
            </div>
        </div>
        
        <div class="wave-decoration"></div>
    `;
    
    return card;
}

// 日付フォーマット
function formatDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
}