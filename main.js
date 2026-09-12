document.addEventListener('DOMContentLoaded', () => {
  initIntroAnimation();
  initWorkModals();
  loadArticles();
  initHeroParallax();
});

// スクロールに応じてヒーローのアイコンが下に移動しながらフェードアウトしていく演出
function initHeroParallax() {
  const hero = document.getElementById('hero');
  const visual = document.querySelector('.hero-visual');
  if (!hero || !visual) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  function update() {
    const progress = Math.min(window.scrollY / hero.offsetHeight, 1);
    visual.style.transform = `translateY(${progress * 160}px)`;
    visual.style.opacity = String(1 - progress * 0.85);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}

function initIntroAnimation() {
  const overlay = document.createElement('div');
  overlay.id = 'intro-overlay';
  document.body.appendChild(overlay);

  const logoContainer = document.createElement('div');
  logoContainer.className = 'intro-logo-container';
  overlay.appendChild(logoContainer);

  const pattern = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [0, 1, 0]
  ];

  pattern.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col === 1) {
        const block = document.createElement('div');
        block.className = 'intro-logo-block';
        block.style.gridColumn = colIndex + 1;
        block.style.gridRow = rowIndex + 1;
        
        const delay = (rowIndex * 0.1) + (colIndex * 0.05);
        block.style.animationDelay = `${delay}s`;
        logoContainer.appendChild(block);
      }
    });
  });

  setTimeout(() => {
    overlay.classList.add('slide-out');
    
    setTimeout(() => {
      overlay.remove();
    }, 800);
  }, 1000);
}

function initWorkModals() {
  const works = document.querySelectorAll('.work-item');
  const modal = document.getElementById('work-modal');
  const closeBtn = document.getElementById('modal-close');
  const titleEl = document.getElementById('modal-title');
  const descEl = document.getElementById('modal-desc');
  const articleLink = document.getElementById('modal-article-link');
  const appLink = document.getElementById('modal-app-link');

  works.forEach(work => {
    work.addEventListener('click', () => {
      // HTMLのdata属性から情報を取得してモーダルにセット
      titleEl.textContent = work.dataset.title;
      descEl.textContent = work.dataset.desc;
      
      // 記事URLがある場合のみボタンを表示
      if(work.dataset.article) {
        articleLink.href = work.dataset.article;
        articleLink.style.display = "block";
      } else {
        articleLink.style.display = "none";
      }
      
      appLink.href = work.dataset.app;
      
      // モーダルを表示
      modal.classList.remove('hidden');
    });
  });

  // バツボタンで閉じる
  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // モーダルの背景クリックで閉じる
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
}

// note の最新記事を articles.json (GitHub Actionsが定期更新) から読み込んで表示する。
// HTMLには最新記事を静的にも書いてあるので、fetchが失敗しても(file://で開いた場合など)
// 記事一覧が空になったりエラー表示になったりしない — 取得できたときだけ最新化する。
async function loadArticles() {
  const grid = document.getElementById('articles-grid');
  if (!grid) return;

  try {
    const res = await fetch('articles.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('articles.json not found');
    const articles = await res.json();

    if (!Array.isArray(articles) || articles.length === 0) {
      throw new Error('no articles');
    }

    grid.innerHTML = '';
    articles.slice(0, 3).forEach(article => {
      const card = document.createElement('a');
      card.className = 'article-card';
      card.href = article.link;
      card.target = '_blank';
      card.rel = 'noopener';

      card.innerHTML = `
        <div class="a-thumb"><img src="" alt="" loading="lazy"></div>
        <h3 class="a-title"></h3>
      `;
      card.querySelector('.a-thumb img').src = article.thumbnail || '';
      card.querySelector('.a-title').textContent = article.title || '';

      grid.appendChild(card);
    });
  } catch (err) {
    // fetchに失敗しても、HTMLに書かれている静的な記事カードをそのまま残す
    console.warn('articles.json を取得できなかったため、静的な記事一覧を表示しています。', err);
  }
}