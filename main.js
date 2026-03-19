document.addEventListener('DOMContentLoaded', () => {
  initIntroAnimation();
  initWorkModals();
});

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