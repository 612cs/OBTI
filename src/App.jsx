import { useEffect, useMemo, useState } from 'react';
import {
  analyzeAnswers,
  calculateTypeFromAnswers,
  personalities,
  questions,
} from './analysis.js';
import QuizScreen from './components/QuizScreen.jsx';
import ResultScreen from './components/ResultScreen.jsx';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import { sharePoster, websiteUrl } from './services/posterService.js';
import { cacheService } from './services/cacheService.js';

export default function App() {
  const [step, setStep] = useState('welcome');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [isSharingPoster, setIsSharingPoster] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // 初始化时检查是否有缓存草稿
  useEffect(() => {
    const draft = cacheService.loadDraft();
    if (draft && Object.keys(draft).length > 0) {
      setHasDraft(true);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const shareText = useMemo(() => {
    if (!result) return '';
    return `我是【${result.personality.title}】，匹配度${result.analysis.matchPercent}% ，精准命中${result.analysis.hitCount}/15维。快来测测你的 OBTI 户外人格：${websiteUrl}`;
  }, [result]);

  const startQuiz = () => {
    setAnswers({});
    setResult(null);
    cacheService.clearDraft();
    setStep('quiz');
  };

  // 继续上次的测试
  const continueDraft = () => {
    const draft = cacheService.loadDraft();
    if (draft) {
      setAnswers(draft);
      setStep('quiz');
    }
  };

  const handleAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    // 每次答案变化时保存到缓存
    cacheService.saveDraft(newAnswers);
  };

  const generateAvatar = async (type) => {
    const imageFile = personalities[type].image;
    const avatarUrl = `/images/${imageFile}`;
    return { avatarUrl, isFallbackAvatar: false };
  };

  const calculateResult = async () => {
    const type = calculateTypeFromAnswers(answers);
    const personality = personalities[type];
    const analysis = analyzeAnswers(answers, type);
    const avatarState = await generateAvatar(type);

    setResult({
      type,
      personality,
      analysis,
      avatarUrl: avatarState.avatarUrl,
    });

    // 提交时清空缓存
    cacheService.clearDraft();
    setStep('result');
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

  if (step === 'welcome') {
    return <WelcomeScreen onStart={startQuiz} onContinueDraft={continueDraft} hasDraft={hasDraft} />;
  }

  if (step === 'quiz') {
    return (
      <QuizScreen
        questions={questions}
        answers={answers}
        onAnswer={handleAnswer}
        onSubmit={calculateResult}
      />
    );
  }

  return (
    <ResultScreen
      result={result}
      isSharingPoster={isSharingPoster}
      onSharePoster={handleSharePoster}
      onShareCopy={handleShareCopy}
      onRestart={startQuiz}
    />
  );
}
