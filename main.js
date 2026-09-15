document.addEventListener('DOMContentLoaded', () => {
  initWorkModals();
  loadArticles();
  initHeroParallax();
  initScrollReveal();
  initLogoBurst();
});

// 見出し・カード・バッジなどをスクロールで画面に入ったタイミングでふわっと表示する
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal, h2, .bars-reveal');
  if (targets.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      if (el.classList.contains('reveal') && el.parentElement) {
        const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
        const index = siblings.indexOf(el);
        el.style.transitionDelay = `${Math.min(index, 8) * 0.08}s`;
      }

      el.classList.add('is-visible');
      observer.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => observer.observe(el));
}

// スクロールに応じてヒーローのアイコンが下に移動していく演出(薄くはならない)
function initHeroParallax() {
  const hero = document.getElementById('hero');
  const visual = document.querySelector('.hero-visual');
  if (!hero || !visual) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  function update() {
    const progress = Math.min(window.scrollY / hero.offsetHeight, 1);
    visual.style.transform = `translateY(${progress * 160}px)`;
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

// ヒーローのロゴブロックをクリック(またはEnter/Space)すると、そのブロックだけがぷにっと弾けて消え、少し間を置いて元に戻る
function initLogoBurst() {
  const logo = document.getElementById('hero-logo');
  if (!logo) return;

  const blocks = Array.from(logo.querySelectorAll('.hero-logo-block:not(.empty)'));

  function burstBlock(block) {
    if (block.classList.contains('popped') || block.classList.contains('popping-in')) return;
    block.classList.add('popped');
    setTimeout(() => {
      block.classList.remove('popped');
      block.classList.add('popping-in');
      setTimeout(() => {
        block.classList.remove('popping-in');
      }, 500);
    }, 1100);
  }

  logo.addEventListener('click', (e) => {
    const block = e.target.closest('.hero-logo-block:not(.empty)');
    if (block) burstBlock(block);
  });

  blocks.forEach((block) => {
    block.setAttribute('tabindex', '0');
    block.setAttribute('role', 'button');
    block.setAttribute('aria-label', 'クリックすると弾けます');
    block.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        burstBlock(block);
      }
    });
  });
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
      card.className = 'article-card reveal';
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
    // articles.json から差し替えた新しいカードにも、スクロールで表示するアニメーションを効かせる
    initScrollReveal();
  } catch (err) {
    // fetchに失敗しても、HTMLに書かれている静的な記事カードをそのまま残す
    console.warn('articles.json を取得できなかったため、静的な記事一覧を表示しています。', err);
  }
}