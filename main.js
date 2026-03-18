document.addEventListener('DOMContentLoaded', () => {
  initIntroAnimation();
  initDataViz();
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
  }, 2200);
}

function initDataViz() {
  const container = document.getElementById('d3-container');
  console.log('D3.js initialized');
}