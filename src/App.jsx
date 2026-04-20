import { useMemo, useState } from 'react';
import {
  analyzeAnswers,
  baseImagePrompt,
  calculateTypeFromAnswers,
  personalities,
  questions,
} from './analysis.js';

const websiteUrl = 'https://obti.climbersheng.me';
const qrCodeUrl = '/OBTIERWEIMA.png';
const AVATAR_REQUEST_TIMEOUT_MS = 12000;

const Icons = {
  Compass: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
  ),
  Loader: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-emerald-500"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
  ),
  Share: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
  ),
  Refresh: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
  ),
  Copy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
  ),
};

const avatarFallbackEmoji = {
  INTJ: '🧭', INTP: '🧪', INFJ: '🌲', INFP: '🍄', ISTJ: '🎒', ISTP: '🧗', ESTJ: '⌚', ESTP: '⚡',
  ISFJ: '🍳', ISFP: '📸', ESFJ: '🤝', ESFP: '🎵', ENTJ: '🗺️', ENFJ: '🔥', ENTP: '🧨', ENFP: '🎉',
};

const buildFallbackAvatarDataUrl = (type) => {
  const emoji = avatarFallbackEmoji[type] || '🏔️';
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="100%" stop-color="#1f2937" />
    </linearGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#bg)" />
  <circle cx="600" cy="600" r="230" fill="#ffffff22" />
  <text x="600" y="600" text-anchor="middle" dominant-baseline="central" font-size="260">${emoji}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  img.src = src;
});

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
};

const wrapText = (ctx, text, x, y, maxWidth, lineHeight, maxLines = Infinity) => {
  const chars = [...text];
  const lines = [];
  let current = '';

  chars.forEach((char) => {
    const next = current + char;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      return;
    }

    if (current) lines.push(current);
    current = char;
  });

  if (current) lines.push(current);

  const limited = lines.slice(0, maxLines);
  limited.forEach((line, idx) => {
    ctx.fillText(line, x, y + lineHeight * idx);
  });

  return limited.length;
};

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});



async function generatePoster(result) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;

  const ctx = canvas.getContext('2d');
  const { personality, analysis, avatarUrl, type } = result;

  // Background
  ctx.fillStyle = '#F8F9FA'; // Minimalist light gray
  ctx.fillRect(0, 0, 1080, 1920);


  // Header Title
  ctx.fillStyle = '#0F172A';
  ctx.font = '800 36px Avenir Next, PingFang SC, Hiragino Sans GB, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('OBTI 户外人格测试', 540, 120);
  
  ctx.fillStyle = '#64748B';
  ctx.font = '400 24px Avenir Next, PingFang SC, sans-serif';
  ctx.fillText('DISCOVER YOUR OUTDOOR SOUL', 540, 160);

  // Divider
  ctx.beginPath();
  ctx.moveTo(340, 190);
  ctx.lineTo(740, 190);
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Avatar Image
  try {
    const avatarImage = await loadImage(avatarUrl);
    const boxSize = 800;
    const avatarBox = { x: 140, y: 260, width: boxSize, height: boxSize };
    
    // Draw shadow behind image
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    drawRoundedRect(ctx, avatarBox.x, avatarBox.y, avatarBox.width, avatarBox.height, 24);
    ctx.fillStyle = '#FFF';
    ctx.fill();
    ctx.shadowColor = 'transparent'; // reset shadow

    const imageRatio = avatarImage.width / avatarImage.height;
    let drawWidth = boxSize, drawHeight = boxSize, drawX = avatarBox.x, drawY = avatarBox.y;

    if (imageRatio > 1) {
      drawWidth = boxSize * imageRatio;
      drawX -= (drawWidth - boxSize) / 2;
    } else {
      drawHeight = boxSize / imageRatio;
      drawY -= (drawHeight - boxSize) / 2;
    }

    ctx.save();
    drawRoundedRect(ctx, avatarBox.x, avatarBox.y, avatarBox.width, avatarBox.height, 24);
    ctx.clip();
    ctx.drawImage(avatarImage, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  } catch {
    ctx.fillStyle = '#E2E8F0';
    drawRoundedRect(ctx, 140, 260, 800, 800, 24);
    ctx.fill();
  }

  // Type Code (e.g. INTJ)
  ctx.fillStyle = '#065F46'; // Emerald 800
  ctx.font = '900 120px Avenir Next, ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(personality.obtiCode, 540, 1220);

  // Personality Title
  ctx.fillStyle = '#0F172A';
  ctx.font = '800 64px PingFang SC, Hiragino Sans GB, sans-serif';
  ctx.fillText(personality.title, 540, 1310);

  // Tags
  ctx.fillStyle = '#475569';
  ctx.font = '500 32px PingFang SC, Hiragino Sans GB, sans-serif';
  ctx.fillText(personality.tags.split(' / ').map(t => `#${t}`).join('   '), 540, 1370);

  // Divider
  ctx.beginPath();
  ctx.moveTo(140, 1430);
  ctx.lineTo(940, 1430);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Match info
  ctx.fillStyle = '#0F172A';
  ctx.font = '700 36px font-serif, "Times New Roman", serif';
  ctx.textAlign = 'left';
  ctx.fillText('核心特质', 140, 1500);

  ctx.fillStyle = '#334155';
  ctx.font = '400 32px PingFang SC, Hiragino Sans GB, sans-serif';
  let yPos = 1560;
  analysis.strengths.slice(0, 3).forEach((item) => {
    ctx.fillText(`• ${item.name}`, 140, yPos);
    yPos += 50;
  });

  // QR Code Area
  const qrImage = await loadImage(qrCodeUrl);
  ctx.drawImage(qrImage, 780, 1480, 160, 160);
  
  ctx.fillStyle = '#64748B';
  ctx.font = '400 24px PingFang SC, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('扫码解锁你的户外人格', 860, 1680);

  // Watermark
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '400 24px Avenir Next, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(websiteUrl, 540, 1850);

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((output) => {
      if (output) resolve(output);
      else reject(new Error('Poster generation failed'));
    }, 'image/png', 0.95);
  });

  return { blob, dataUrl };
}

async function sharePoster(result) {
  const { blob } = await generatePoster(result);
  const fileName = `OBTI-${result.type}-report.png`;

  if (navigator.share) {
    try {
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${result.personality.title} | OBTI 户外人格`,
          text: `${result.analysis.summaryText} ${websiteUrl}`,
          files: [file],
        });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
    }
  }

  downloadBlob(blob, fileName);
}

const LikertScale = ({ questionId, value, onChange }) => {
  const options = [
    { val: 3, label: '强烈认同', sizeClasses: 'w-[2.5rem] h-[2.5rem] md:w-[3.5rem] md:h-[3.5rem]', defaultClasses: 'border-emerald-500 text-emerald-500 hover:bg-emerald-50', activeClasses: 'bg-emerald-500 text-white border-emerald-500 shadow-md' },
    { val: 2, label: '认同', sizeClasses: 'w-[2rem] h-[2rem] md:w-[3rem] md:h-[3rem]', defaultClasses: 'border-emerald-400 text-emerald-400 hover:bg-emerald-50', activeClasses: 'bg-emerald-400 text-white border-emerald-400 shadow-md' },
    { val: 1, label: '稍稍认同', sizeClasses: 'w-[1.5rem] h-[1.5rem] md:w-[2.5rem] md:h-[2.5rem]', defaultClasses: 'border-emerald-300 text-emerald-300 hover:bg-emerald-50', activeClasses: 'bg-emerald-300 text-white border-emerald-300 shadow-md' },
    { val: 0, label: '中立', sizeClasses: 'w-[1.25rem] h-[1.25rem] md:w-[2rem] md:h-[2rem]', defaultClasses: 'border-gray-300 text-gray-300 hover:bg-gray-100', activeClasses: 'bg-gray-400 text-white border-gray-400 shadow-md' },
    { val: -1, label: '稍稍反对', sizeClasses: 'w-[1.5rem] h-[1.5rem] md:w-[2.5rem] md:h-[2.5rem]', defaultClasses: 'border-purple-300 text-purple-300 hover:bg-purple-50', activeClasses: 'bg-purple-300 text-white border-purple-300 shadow-md' },
    { val: -2, label: '反对', sizeClasses: 'w-[2rem] h-[2rem] md:w-[3rem] md:h-[3rem]', defaultClasses: 'border-purple-400 text-purple-400 hover:bg-purple-50', activeClasses: 'bg-purple-400 text-white border-purple-400 shadow-md' },
    { val: -3, label: '强烈反对', sizeClasses: 'w-[2.5rem] h-[2.5rem] md:w-[3.5rem] md:h-[3.5rem]', defaultClasses: 'border-purple-500 text-purple-500 hover:bg-purple-50', activeClasses: 'bg-purple-500 text-white border-purple-500 shadow-md' },
  ];

  return (
    <div className="flex items-center justify-between w-full mt-[1.5rem] px-1 sm:px-2 md:px-4 max-w-2xl mx-auto relative gap-1 sm:gap-2">
      <span className="text-emerald-700 font-bold text-[0.75rem] sm:text-[0.875rem] md:text-[1.125rem] w-[2.5rem] sm:w-[3rem] md:w-[4rem] text-center md:text-left whitespace-nowrap">认同</span>
      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 flex-1">
        {options.map((opt) => {
          const isSelected = value === opt.val;

          return (
            <button
              key={opt.val}
              onClick={() => onChange(questionId, opt.val)}
              title={opt.label}
              className={`rounded-full border-[2.5px] transition-all duration-200 flex items-center justify-center flex-shrink-0 cursor-pointer outline-none ${opt.sizeClasses} ${isSelected ? `${opt.activeClasses} scale-110` : opt.defaultClasses}`}
            >
              {isSelected ? '✓' : ''}
            </button>
          );
        })}
      </div>
      <span className="text-purple-600 font-bold text-[0.75rem] sm:text-[0.875rem] md:text-[1.125rem] w-[2.5rem] sm:w-[3rem] md:w-[4rem] text-center md:text-right whitespace-nowrap">不认同</span>
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState('welcome');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [generationError, setGenerationError] = useState(false);
  const [isSharingPoster, setIsSharingPoster] = useState(false);
  const [isRetryingAvatar, setIsRetryingAvatar] = useState(false);

  const shareText = useMemo(() => {
    if (!result) return '';
    return `我是【${result.personality.title}】(${result.personality.obtiCode})，匹配度${result.analysis.matchPercent}% ，精准命中${result.analysis.hitCount}/15维。快来测测你的 OBTI 户外人格：${websiteUrl}`;
  }, [result]);

  const startQuiz = () => {
    setAnswers({});
    setResult(null);
    setGenerationError(false);
    setIsSharingPoster(false);
    setStep('quiz');
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const generateAvatar = async (type) => {
    const promptConfig = personalities[type].prompt;
    const fullPrompt = `${baseImagePrompt}, ${promptConfig}`;
    const fallbackAvatar = buildFallbackAvatarDataUrl(type);

    const retries = 3;
    let delay = 800;

    for (let i = 0; i < retries; i += 1) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, AVATAR_REQUEST_TIMEOUT_MS);

        let response;
        try {
          response = await fetch('/api/generate-avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              prompt: fullPrompt,
              sampleCount: 1,
            }),
          });
        } finally {
          clearTimeout(timeoutId);
        }

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const detail = typeof data?.detail === 'string' ? data.detail : `HTTP error: ${response.status}`;
          if (data?.retryable === false) {
            console.warn('[avatar] non-retryable generation failure', { status: response.status, detail });
            return { avatarUrl: fallbackAvatar, isFallbackAvatar: true };
          }
          throw new Error(detail);
        }

        const imageBase64 = data?.imageBase64;
        if (imageBase64) {
          return {
            avatarUrl: `data:image/png;base64,${imageBase64}`,
            isFallbackAvatar: false,
          };
        }

        throw new Error('Invalid image format');
      } catch (error) {
        console.warn('[avatar] generation attempt failed', { attempt: i + 1, error });

        if (i === retries - 1) {
          return { avatarUrl: fallbackAvatar, isFallbackAvatar: true };
        }

        await wait(delay);
        delay *= 2;
      }
    }

    return { avatarUrl: fallbackAvatar, isFallbackAvatar: true };
  };

  const calculateResult = async () => {
    const type = calculateTypeFromAnswers(answers);
    const personality = personalities[type];
    const analysis = analyzeAnswers(answers, type);
    const fallbackAvatar = buildFallbackAvatarDataUrl(type);

    setResult({
      type,
      personality,
      analysis,
      avatarUrl: fallbackAvatar,
      isFallbackAvatar: true,
    });

    setStep('loading');
    setGenerationError(false);

    try {
      const avatarState = await generateAvatar(type);
      setResult((prev) => ({
        ...prev,
        avatarUrl: avatarState.avatarUrl,
        isFallbackAvatar: avatarState.isFallbackAvatar,
      }));
      setGenerationError(avatarState.isFallbackAvatar);
    } catch (error) {
      console.error('[avatar] generation failed unexpectedly', error);
      setGenerationError(true);
    } finally {
      setStep('result');
    }
  };

  const handleShareCopy = async () => {
    if (!result) return;

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareText);
      alert('分享文案已复制。');
      return;
    }

    const textArea = document.createElement('textarea');
    textArea.value = shareText;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('分享文案已复制。');
  };

  const handleSharePoster = async () => {
    if (!result) return;

    setIsSharingPoster(true);
    try {
      await sharePoster(result);
      alert('海报已准备好，可直接分享或保存。');
    } catch (error) {
      console.error(error);
      alert('海报生成失败，请稍后重试。');
    } finally {
      setIsSharingPoster(false);
    }
  };

  const handleRetryAvatar = async () => {
    if (!result) return;
    setIsRetryingAvatar(true);
    setGenerationError(false);
    try {
      const avatarState = await generateAvatar(result.type);
      setResult((prev) => ({
        ...prev,
        avatarUrl: avatarState.avatarUrl,
        isFallbackAvatar: avatarState.isFallbackAvatar,
      }));
      setGenerationError(avatarState.isFallbackAvatar);
    } finally {
      setIsRetryingAvatar(false);
    }
  };

  const renderWelcome = () => (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 md:p-[2rem]">
      <div className="flex flex-col items-center justify-center w-full max-w-[40rem] bg-white p-[2.5rem] md:p-[4rem] text-center animate-fade-in">
        <img src="/favicon.svg" alt="OBTI Logo" className="w-[6rem] h-[6rem] md:w-[8rem] md:h-[8rem] mb-[2rem] shadow-xl shadow-emerald-900/20 rounded-[1.5rem] md:rounded-[2rem]" />
        <h1 className="text-[2rem] md:text-[3rem] font-black text-emerald-900 mb-[1.5rem] tracking-tight">测测你的山野灵魂</h1>
        <p className="text-[1rem] md:text-[1.125rem] text-slate-600 mb-[2.5rem] max-w-md leading-relaxed">
          抛开传统 MBTI，通过 30 道极度真实场景测出你的 <span className="inline-block bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-bold mx-1">OBTI 户外人格</span>，并生成 3D 专属形象！
        </p>
        <button
          onClick={startQuiz}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-[2.5rem] py-[1rem] w-full md:w-auto rounded-full font-bold text-[1.25rem] shadow-lg shadow-emerald-500/30 transform transition hover:scale-105 active:scale-95"
        >
          <Icons.Compass />
          开始探索
        </button>
      </div>
    </div>
  );

  const renderQuiz = () => {
    const progress = (Object.keys(answers).length / questions.length) * 100;
    const isAllQuestionsComplete = questions.every((q) => answers[q.id] !== undefined);

    return (
      <div className="flex min-h-screen bg-white justify-center md:py-[4rem]">
        <div className="flex flex-col w-full min-h-screen md:min-h-0 md:max-w-[48rem] bg-white animate-fade-in relative">
          <div className="sticky top-0 bg-white/95 backdrop-blur-md z-20 px-[1.5rem] md:px-[2.5rem] py-[1rem] border-b border-slate-100">
            <div className="flex justify-between items-end mb-[0.75rem]">
              <span className="text-emerald-700 font-bold tracking-wider text-[0.875rem]">测试进度</span>
              <span className="text-emerald-600 font-black text-[0.875rem]">{Object.keys(answers).length} / {questions.length}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-[0.5rem] overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="flex flex-col px-[1rem] md:px-[4rem] py-[2.5rem] pb-[8rem] gap-[3rem] md:gap-[4rem] flex-1">
            {questions.map((q, idx) => (
              <div key={q.id} className="flex flex-col items-center">
                <h3 className="text-[1.125rem] md:text-[1.5rem] font-bold text-slate-800 mb-[0.5rem] text-center leading-relaxed max-w-xl">
                  {q.text}
                </h3>
                <LikertScale questionId={q.id} value={answers[q.id]} onChange={handleAnswer} />
                {idx < questions.length - 1 && (
                  <div className="w-[6rem] h-[0.25rem] bg-gray-100 rounded-full mt-[3rem] md:mt-[4rem]"></div>
                )}
              </div>
            ))}
          </div>

          <div className="fixed md:absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-100 p-[1rem] md:p-[1.5rem] flex justify-center z-20">
            <button
              disabled={!isAllQuestionsComplete}
              onClick={calculateResult}
              className={`flex items-center justify-center gap-2 w-full max-w-[28rem] px-[1.5rem] py-[1rem] rounded-full font-bold text-[1.125rem] transition-all duration-300
                        ${isAllQuestionsComplete
    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 transform hover:-translate-y-1'
    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              提交答案
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-[1.5rem] text-center">
      <div className="mb-[1.5rem]"><Icons.Loader /></div>
      <h2 className="text-[1.5rem] font-bold text-emerald-900 mb-[0.5rem]">正在生成你的 OBTI 报告...</h2>
      <p className="text-emerald-700 animate-pulse text-[1rem]">AI 正在绘制 3D 形象并计算 15 维画像，请稍候</p>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;

    const { personality, analysis, avatarUrl } = result;

    return (
      <div className="flex min-h-screen bg-white items-start justify-center px-[0.5rem] py-[1.25rem] md:px-[2rem] md:py-[2rem]">
        <div className="w-full max-w-[64rem] bg-white overflow-hidden animate-fade-in relative pb-[8rem] md:pb-[4rem]">
          {/* Header Banner - unified with project theme */}
          <div className="p-[1rem] md:p-[2rem] bg-white text-slate-900 border-b border-emerald-100">
            <div className="grid lg:grid-cols-[22rem_1fr] gap-[1.25rem] md:gap-[2rem] items-stretch">
              <div className="rounded-[1.5rem] overflow-hidden bg-emerald-50 border border-emerald-200 min-h-[17rem] md:min-h-[22rem] shadow-sm">
                <img src={avatarUrl} alt={personality.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-emerald-600 font-bold text-[0.875rem] tracking-[0.2em] uppercase">OBTI Result</p>
                  <h1 className="text-[2rem] md:text-[3rem] font-black mt-[0.5rem] leading-tight text-emerald-900">{personality.title}</h1>
                  <p className="text-emerald-700 font-semibold text-[1.25rem] mt-[0.25rem]">{personality.obtiCode}</p>
                </div>

                <div className="mt-[1rem] md:mt-[1.5rem] bg-emerald-50 rounded-[1rem] border border-emerald-200 px-[1.25rem] py-[1rem]">
                  <p className="font-bold text-[1.125rem] text-emerald-900">匹配度 {analysis.matchPercent}% · 精准命中 {analysis.hitCount}/15 维</p>
                  <p className="text-emerald-800 text-[0.95rem] mt-[0.5rem] leading-relaxed">{analysis.summaryText}</p>
                </div>

                <div className="flex flex-wrap gap-[0.5rem] mt-[1.25rem] md:mt-[1.5rem]">
                  {personality.tags.split(' / ').map((tag) => (
                    <span key={tag} className="bg-white border border-emerald-200 text-emerald-700 px-[0.8rem] py-[0.35rem] rounded-full text-[0.85rem] shadow-sm font-medium">#{tag}</span>
                  ))}
                </div>
                
                {generationError && (
                  <div className="mt-[1rem] rounded-[1rem] border border-purple-200 bg-purple-50 px-[1rem] py-[0.75rem] text-purple-900 text-[0.9rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="font-medium">3D 生图失败，当前使用兜底图。</span>
                    <button
                      onClick={handleRetryAvatar}
                      disabled={isRetryingAvatar}
                      className="shrink-0 rounded-full bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 text-[0.8rem] font-bold disabled:opacity-60 transition"
                    >
                      {isRetryingAvatar ? '重试中...' : '重试生图'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-[1rem] md:p-[2rem] grid lg:grid-cols-[1.3fr_1fr] gap-[1rem] md:gap-[1.5rem] mt-[1rem]">
            <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-[1.5rem] md:p-[2rem]">
              <h2 className="text-[1.25rem] md:text-[1.5rem] font-extrabold text-emerald-900 mb-[1rem]">人格解读</h2>
              <p className="text-slate-700 leading-relaxed text-[1rem] md:text-[1.05rem] font-medium">{personality.desc}</p>

              <div className="mt-[1.5rem] grid md:grid-cols-2 gap-[1rem]">
                <div className="rounded-[1rem] bg-emerald-50 border border-emerald-100 p-[1rem]">
                  <p className="font-bold text-emerald-900 mb-[0.75rem] text-[1.05rem]">突出强项</p>
                  <ul className="space-y-[0.75rem]">
                    {analysis.strengths.slice(0, 3).map((item) => (
                      <li key={item.id} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-emerald-800 text-[0.9rem] font-semibold">
                          <span>{item.name}</span>
                          <span>{item.scorePercent}%</span>
                        </div>
                        <div className="h-[0.3rem] bg-emerald-200/50 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.scorePercent}%` }}></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[1rem] bg-purple-50 border border-purple-100 p-[1rem]">
                  <p className="font-bold text-purple-900 mb-[0.75rem] text-[1.05rem]">拓展潜能</p>
                  <ul className="space-y-[0.75rem]">
                    {analysis.watchouts.slice(0, 3).map((item) => (
                      <li key={item.id} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-purple-800 text-[0.9rem] font-semibold">
                          <span>{item.name}</span>
                          <span>{item.scorePercent}%</span>
                        </div>
                        <div className="h-[0.3rem] bg-purple-200/50 rounded-full overflow-hidden">
                           <div className="h-full bg-purple-400 rounded-full" style={{ width: `${item.scorePercent}%` }}></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-[1.5rem] md:p-[2rem]">
              <h2 className="text-[1.25rem] md:text-[1.5rem] font-extrabold text-emerald-900 mb-[1rem]">十五维全景画像</h2>
              <div className="space-y-[0.75rem] max-h-[35rem] overflow-y-auto pr-2 custom-scrollbar">
                {analysis.dimensionBreakdown.map((item) => (
                  <div key={item.id} className="rounded-[1rem] border border-slate-100 p-[0.75rem] bg-slate-50/50">
                    <div className="flex items-center justify-between text-[0.9rem]">
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className={`font-bold ${item.isHit ? 'text-emerald-600' : 'text-purple-600'}`}>{item.scoreText}</p>
                    </div>
                    <div className="h-[0.35rem] rounded-full bg-slate-200 mt-[0.5rem] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${item.isHit ? 'bg-emerald-500' : 'bg-purple-400'}`}
                        style={{ width: `${item.scorePercent}%` }}
                      ></div>
                    </div>
                    <p className="text-[0.75rem] text-slate-500 mt-[0.4rem]">{item.tag}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="fixed md:absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 p-[1rem] md:p-[1.5rem] flex flex-wrap md:flex-nowrap justify-center gap-[0.75rem] z-30">
            <button
              onClick={handleSharePoster}
              disabled={isSharingPoster}
              className="flex items-center justify-center gap-1.5 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-[0.75rem] sm:px-[1.5rem] py-[0.85rem] rounded-full font-bold transition flex-1 md:flex-none md:w-[13rem] disabled:opacity-60 shadow-lg shadow-emerald-500/20 whitespace-nowrap text-[0.95rem] md:text-[1.05rem]"
            >
              <Icons.Share />
              {isSharingPoster ? '生成中...' : '分享海报'}
            </button>
            <button
              onClick={handleShareCopy}
              className="flex items-center justify-center gap-1.5 sm:gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-[0.75rem] sm:px-[1.5rem] py-[0.85rem] rounded-full font-bold transition flex-1 md:flex-none md:w-[13rem] whitespace-nowrap text-[0.95rem] md:text-[1.05rem]"
            >
              <Icons.Copy />
              复制链接
            </button>
            <button
              onClick={startQuiz}
              className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-[0.75rem] sm:px-[1.5rem] py-[0.85rem] rounded-full font-bold transition md:flex-none md:w-[13rem] md:mt-0 w-full md:w-auto whitespace-nowrap text-[0.95rem] md:text-[1.05rem]"
            >
              <Icons.Refresh />
              再测一次
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {step === 'welcome' && renderWelcome()}
      {step === 'quiz' && renderQuiz()}
      {step === 'loading' && renderLoading()}
      {step === 'result' && renderResult()}
    </>
  );
}
