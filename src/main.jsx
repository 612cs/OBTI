import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

function setRem() {
  const docEl = document.documentElement;
  const clientWidth = docEl.clientWidth;
  if (!clientWidth) return;
  if (clientWidth >= 768) {
    // PC 端和平板横屏固定 1rem = 16px
    docEl.style.fontSize = '16px';
  } else {
    // 移动端以 390px 宽度为基准等比例缩放
    docEl.style.fontSize = `${16 * (clientWidth / 390)}px`;
  }
}

setRem();
window.addEventListener('resize', setRem);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
