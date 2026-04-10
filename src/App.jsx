import { useState } from 'react';

// --- 数据定义：户外测试题 (扩充至30题) ---
const questions = [
  { id: 1, dimension: 'E_I', text: '徒步时，你更喜欢加入热闹的大队伍，一路上结交新朋友。', agree: 'E', disagree: 'I' },
  { id: 2, dimension: 'E_I', text: '只要条件允许，你更愿意一个人在山里默默行走，享受不被打扰的宁静。', agree: 'I', disagree: 'E' },
  { id: 3, dimension: 'E_I', text: '到达露营地放下包后，你的第一反应是去其他帐篷串门聊天。', agree: 'E', disagree: 'I' },
  { id: 4, dimension: 'E_I', text: '相比于团队齐心协力登顶，你更享受一个人在前面偷偷把队友“拉爆”的快感。', agree: 'I', disagree: 'E' },
  { id: 5, dimension: 'E_I', text: '露营的夜晚，比起独自看星星，你更喜欢大家围在篝火旁玩游戏、喝酒。', agree: 'E', disagree: 'I' },
  { id: 6, dimension: 'E_I', text: '你会因为同伴在路上一直喋喋不休而感到烦躁，更希望大家安静爬山。', agree: 'I', disagree: 'E' },
  { id: 7, dimension: 'E_I', text: '你经常会在路上遇到完全不认识的驴友，并迅速和他们打成一片。', agree: 'E', disagree: 'I' },
  { id: 8, dimension: 'E_I', text: '对你来说，去户外的最大动力之一就是为了逃离人类社会的社交。', agree: 'I', disagree: 'E' },

  { id: 9, dimension: 'S_N', text: '你在山里走的时候，眼睛通常紧紧盯着循迹软件，生怕偏离轨迹。', agree: 'S', disagree: 'N' },
  { id: 10, dimension: 'S_N', text: '走着走着，你就容易被奇形怪状的植物或风景吸引，忘了本来要赶路。', agree: 'N', disagree: 'S' },
  { id: 11, dimension: 'S_N', text: '你更喜欢走经典的、路网成熟的百公里徒步路线（如乌孙、狼塔）。', agree: 'S', disagree: 'N' },
  { id: 12, dimension: 'S_N', text: '相比于按部就班的路线，地图上那些没有任何标记的未知垭口更让你兴奋。', agree: 'N', disagree: 'S' },
  { id: 13, dimension: 'S_N', text: '买装备时，你最先看的是它的具体参数（防水指数、克重等）而不是颜值。', agree: 'S', disagree: 'N' },
  { id: 14, dimension: 'S_N', text: '在山里迷路对你来说不是一种灾难，反而是一场计划外的探险。', agree: 'N', disagree: 'S' },
  { id: 15, dimension: 'S_N', text: '你倾向于认为，每一次户外活动都应该有一个明确的目的地和打卡点。', agree: 'S', disagree: 'N' },
  { id: 16, dimension: 'S_N', text: '只要天气好感觉对，就算是一条没有走过的野路你也敢直接切过去找捷径。', agree: 'N', disagree: 'S' },

  { id: 17, dimension: 'T_F', text: '当队友因为体力不支走得很慢时，你会立刻给他分析配速和心率，催他坚持。', agree: 'T', disagree: 'F' },
  { id: 18, dimension: 'T_F', text: '看到队友走不动了，你会立刻停下来陪他，给他提供情绪价值，安慰他慢慢来。', agree: 'F', disagree: 'T' },
  { id: 19, dimension: 'T_F', text: '你非常看重自己在Strava或两步路上的成绩、配速和赛段排名。', agree: 'T', disagree: 'F' },
  { id: 20, dimension: 'T_F', text: '爬山对你来说最重要的是能拍出好看的照片，为了出片可以背很多不必要的道具。', agree: 'F', disagree: 'T' },
  { id: 21, dimension: 'T_F', text: '为了挑战自己的体能极限，即便在极端恶劣的天气下你也愿意继续按原计划冲顶。', agree: 'T', disagree: 'F' },
  { id: 22, dimension: 'T_F', text: '看到风景极美的地方，你会不由自主地产生一种灵魂被洗涤的感动。', agree: 'F', disagree: 'T' },
  { id: 23, dimension: 'T_F', text: '你觉得那些在营地里搞氛围灯、做精致手冲咖啡的人有点“不务正业”。', agree: 'T', disagree: 'F' },

  { id: 24, dimension: 'J_P', text: '出发前一晚，你会对照着装备清单，把所有物资精确分类打包好。', agree: 'J', disagree: 'P' },
  { id: 25, dimension: 'J_P', text: '恶作剧是你的强项，你甚至考虑过（或真的做过）往队友的包里偷偷塞石头。', agree: 'P', disagree: 'J' },
  { id: 26, dimension: 'J_P', text: '行进途中遭遇计划外的暴雨，你会立刻启动预案B，果断执行下撤。', agree: 'J', disagree: 'P' },
  { id: 27, dimension: 'J_P', text: '在路上，如果看到队友的路餐特别诱人，你会忍不住去“偷吃”或者抢一口。', agree: 'P', disagree: 'J' },
  { id: 28, dimension: 'J_P', text: '你喜欢当队伍的主心骨，把控全局的时间表，要求大家严格执行。', agree: 'J', disagree: 'P' },
  { id: 29, dimension: 'J_P', text: '你的背包里永远有一种“塞到哪算哪”的随性，甚至到了登山口才发现忘了带头灯。', agree: 'P', disagree: 'J' },
  { id: 30, dimension: 'J_P', text: '对你来说，没有绝对的“计划”，走到哪里风景好，今晚就在哪里扎营。', agree: 'P', disagree: 'J' },
];

// --- 数据定义：16种户外人格图鉴及对应的AI生图提示词 ---
const baseImagePrompt = 'A 3D cartoon anime style character illustration of a, beautiful outdoor scenery background, high quality, 8k resolution, vibrant colors, unreal engine 5 render, cute and stylized, popmart style figure, cinematic lighting, full body shot';

const personalities = {
  INTJ: { obtiCode: 'WDFZ', title: '未登峰探索者', tags: '战术大师 / 路线规划狂 / 深藏不露', desc: '极度理性，享受孤独。对成熟路线没兴趣，热衷于在等高线地图上寻找未知垭口。为了一个未登峰，可以默默准备半年。', prompt: 'a mysterious cute explorer looking at a topographic map on a snowy unclimbed mountain peak, wearing tactical technical gear' },
  INTP: { obtiCode: 'JZQL', title: '极致轻量化选手', tags: '装备极客 / 克克计较 / 科技玩家', desc: '为了把基础包重降到3kg以内，可以把牙刷柄锯断、不用帐篷睡天幕。脑子里装满了各种高分子材料和装备参数。', prompt: 'a cute tech geek hiker holding a tiny lightweight backpack and a sawed-off toothbrush, wearing futuristic ultralight camping gear, deep in a forest' },
  INFJ: { obtiCode: 'SYCS', title: '山野朝圣者', tags: '环保主义 / LNT无痕山林 / 灵魂共鸣', desc: '把户外视为一种修行。极度爱护环境，经常捡垃圾，还会对着古树进行深度哲学思考。在山里寻找的是内心的平静。', prompt: 'a peaceful cute hiker meditating near an ancient glowing tree in a misty forest, picking up fallen leaves, wearing earthy tone outdoor clothes' },
  INFP: { obtiCode: 'MLZX', title: '迷路哲学家', tags: '精神内耗治愈 / 随波逐流 / 细节控', desc: '最容易在森林里发呆掉队的人。走着走着就会被一朵奇怪的蘑菇吸引。没有明确目的地，爬山全凭当天的感觉。', prompt: 'a dreamy cute poet hiker looking closely at a glowing magical mushroom in an enchanted forest, looking slightly lost but happy' },
  ISTJ: { obtiCode: 'ZZDS', title: '重装大神', tags: '体能怪物 / 移动储物间 / 风雨无阻', desc: '山里最可靠的存在。永远背着60L+的重装大包，里面甚至有铁锅和西瓜。极度自律，严格按路书行进，从不抱怨。', prompt: 'a strong tough cute hiker carrying a massive oversized heavy backpack with a frying pan attached to it, walking confidently in rain on a mountain trail' },
  ISTP: { obtiCode: 'DPZR', title: '独攀之人', tags: '技术流 / 攀冰狂热者 / 机械师', desc: '比起徒步，更喜欢需要技术的硬核运动：阿式攀登、先锋攀岩。话不多，但技术极其扎实，绳结打得比谁都好。', prompt: 'a cool cute solo rock climber scaling a steep rock cliff wall with ropes and shiny carabiners, wearing technical climbing gear and helmet' },
  ESTJ: { obtiCode: 'MGJG', title: '魔鬼教官', tags: '配速狂魔 / 数据控 / FKT收割机', desc: '永远在看运动手表上的心率和配速，热衷刷赛段冠军。组织的局通常非常虐，上了他们的车就别想停下来拍照。', prompt: 'a strict cute fitness coach hiker checking a glowing smartwatch and trail running fast on a rugged mountain path, intense and determined expression' },
  ESTP: { obtiCode: 'QLKT', title: '强驴 / 狂徒', tags: '体能无限 / 冲山王者 / 极限边缘', desc: '天生的运动健将，不管什么局都能无缝切入。热爱速度与激情，喜欢刺激的速降，经常上演“一天速穿”的奇迹。', prompt: 'an energetic cute extreme sports athlete running down a steep mountain dirt trail with dynamic speed lines, wearing bright sporty gear, exciting action pose' },
  ISFJ: { obtiCode: 'GSDC', title: '高山大厨', tags: '团队妈妈 / 移动补给站 / 百宝箱', desc: '团队里神一般的存在！能从包里掏出现切和牛和手冲咖啡。极度照顾他人，带了各种药品，有他们在永远充满安全感。', prompt: 'a friendly smiling cute hiker cooking a delicious hot meal and pouring coffee on a camping stove at a high altitude snowy mountain camp' },
  ISFP: { obtiCode: 'SXMX', title: '山系美学家', tags: '出片狂人 / 日系机能风 / 氛围感', desc: '装备不一定最轻，但一定最好看。搭帐篷必须拉得四角平整，挂上氛围灯。户外对他们来说是一场大型的生活方式展示。', prompt: 'a stylish fashionable cute camper posing in front of a perfectly set up aesthetic beige glamping tent decorated with glowing string lights under a starry night' },
  ESFJ: { obtiCode: 'WPSD', title: '王牌收队', tags: '暖心大白 / 永不抛弃 / 情绪价值', desc: '世界上最靠谱的收队。脾气极好，永远走在队伍最后陪着新手。帮你背包递水，放着欢快的音乐鼓励你前行。', prompt: 'a warm-hearted cute hiker walking at the back of a trail, carrying someone else\'s backpack and offering a water bottle with a big encouraging smile' },
  ESFP: { obtiCode: 'YDPD', title: '营地派对王', tags: '社牛 / 随身DJ / 气氛担当', desc: '有他们在就不会冷场。包里绝对带了蓝牙音箱和酒，能在营地迅速和所有人打成一片，拉着隔壁营地的人一起蹦迪。', prompt: 'an outgoing cute party camper dancing with a glowing portable bluetooth speaker and holding a drink by a cozy bright campfire' },
  ENTJ: { obtiCode: 'TXLD', title: '铁血领队', tags: '控场大师 / 绝对权威 / 安全把控', desc: '天生的商业队大统领。计划周密，掌控全局，雷厉风行。遇到危险会果断下达强制下撤的命令，毫无商量余地。', prompt: 'a commanding cute leader hiker standing on a high rock pointing forward with authority, wearing a bright headlamp lighting the path ahead' },
  ENFJ: { obtiCode: 'HWZW', title: '户外政委', tags: '鸡汤大师 / 团队粘合剂 / 精神领袖', desc: '领队的好帮手，极度关心队员心理状态。能在大家爬绝望坡快要崩溃的时候，灌注源源不断的“精神氮泵”。', prompt: 'an inspiring charismatic cute hiker actively cheering up exhausted teammates on a steep grassy slope, radiating positive warm energy and glowing aura' },
  ENTP: { obtiCode: 'YLZJ', title: '野路子寻怪专家', tags: '不走寻常路 / 好奇心爆棚 / 作死边缘', desc: '常规路线太无聊了，总是喜欢看地图找捷径。经常带队钻进齐腰深的箭竹林，虽然狼狈，但总能发现不一样的风景。', prompt: 'a curious adventurous cute hiker enthusiastically hacking through a thick green bamboo forest with a walking stick, finding a hidden glowing magical path' },
  ENFP: { obtiCode: 'HWSZ', title: '户外双子星', tags: '三分钟热度 / 全能杂家 / 什么都想玩', desc: '兴趣广泛到了极点。春天越野跑，夏天去潜水，冬天去攀冰。今天是冲锋陷阵的先锋，明天就变成了摆烂看风景的咸鱼。', prompt: 'a dynamic happy cute hiker holding a trail running shoe in one hand and a climbing rope in the other, surrounded by various colorful outdoor sports gear' },
};

// --- SVG 图标 ---
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
  Check: ({ size = '16' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
};

// --- 圆圈量表组件 ---
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
      <span className="text-emerald-600 font-bold text-[0.75rem] sm:text-[0.875rem] md:text-[1.125rem] w-[2.5rem] sm:w-[3rem] md:w-[4rem] text-center md:text-left whitespace-nowrap">认同</span>

      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 flex-1">
        {options.map((opt) => {
          const isSelected = value === opt.val;
          const iconSize = Math.abs(opt.val) === 3 ? '20' : Math.abs(opt.val) === 2 ? '16' : '12';

          return (
            <button
              key={opt.val}
              onClick={() => onChange(questionId, opt.val)}
              title={opt.label}
              className={`rounded-full border-[2.5px] transition-all duration-200 flex items-center justify-center flex-shrink-0 cursor-pointer outline-none ${opt.sizeClasses} ${isSelected ? `${opt.activeClasses} scale-110` : opt.defaultClasses}`}
            >
              {isSelected && <Icons.Check size={opt.val === 0 ? '10' : iconSize} />}
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

  const [resultType, setResultType] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [generationError, setGenerationError] = useState(false);

  const startQuiz = () => {
    setAnswers({});
    setStep('quiz');
    setResultType(null);
    setAvatarUrl(null);
    setGenerationError(false);
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const calculateResult = () => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    questions.forEach((q) => {
      const val = answers[q.id];
      if (val === undefined) return;

      if (val > 0) {
        scores[q.agree] += val;
      } else if (val < 0) {
        scores[q.disagree] += Math.abs(val);
      }
    });

    const type = [
      scores.E >= scores.I ? 'E' : 'I',
      scores.S >= scores.N ? 'S' : 'N',
      scores.T >= scores.F ? 'T' : 'F',
      scores.J >= scores.P ? 'J' : 'P',
    ].join('');

    setResultType(type);
    setStep('loading');
    generateAvatar(type);
  };

  const generateAvatar = async (type) => {
    // 这里替换为了你的真实 API Key
    const apiKey = 'AIzaSyBM7xn8jFbgbL2lMK2V3oUuelMKZSFxPfE';
    const promptConfig = personalities[type].prompt;
    const fullPrompt = `${baseImagePrompt}, ${promptConfig}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
    const payload = {
      instances: { prompt: fullPrompt },
      parameters: { sampleCount: 1 },
    };

    const retries = 5;
    let delay = 1000;

    for (let i = 0; i < retries; i += 1) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const data = await response.json();
        if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
          setAvatarUrl(`data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`);
          break;
        } else {
          throw new Error('Invalid format');
        }
      } catch (e) {
        console.error('Image generation attempt failed', e);
        if (i === retries - 1) {
          setGenerationError(true);
        } else {
          await new Promise((res) => {
            setTimeout(res, delay);
          });
          delay *= 2;
        }
      }
    }
    setStep('result');
  };

  const renderWelcome = () => (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 md:p-[2rem]">
      <div className="flex flex-col items-center justify-center w-full max-w-[40rem] bg-white p-[2.5rem] md:p-[4rem] text-center animate-fade-in">
        <img src="/favicon.svg" alt="OBTI Logo" className="w-[6rem] h-[6rem] md:w-[8rem] md:h-[8rem] mb-[2rem] shadow-xl shadow-emerald-900/20 rounded-[1.5rem] md:rounded-[2rem]" />
        <h1 className="text-[2rem] md:text-[3rem] font-black text-emerald-900 mb-[1.5rem] tracking-tight">测测你的山野灵魂</h1>
        <p className="text-[1rem] md:text-[1.125rem] text-slate-600 mb-[2.5rem] max-w-md leading-relaxed">
          抛开传统的MBTI，通过30道极度真实的户外灵魂拷问，测出你专属的 <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded gap-1">OBTI 户外人格</span>，并生成你的 AI 专属3D形象！
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
        <div className="flex flex-col w-full min-h-screen md:min-h-0 md:max-w-[48rem] bg-white animate-fade-in relative md:overflow-hidden">
          <div className="sticky top-0 bg-white/95 backdrop-blur-md z-20 px-[1.5rem] md:px-[2.5rem] py-[1rem] border-b border-gray-100">
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

                <LikertScale
                  questionId={q.id}
                  value={answers[q.id]}
                  onChange={handleAnswer}
                />

                {idx < questions.length - 1 && (
                  <div className="w-[6rem] h-[0.25rem] bg-gray-100 rounded-full mt-[3rem] md:mt-[4rem]"></div>
                )}
              </div>
            ))}
          </div>

          {/* 移动端吸底，PC端absolute */}
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-[1.5rem] text-center">
      <div className="mb-[1.5rem]">
        <Icons.Loader />
      </div>
      <h2 className="text-[1.5rem] font-bold text-emerald-900 mb-[0.5rem]">正在分析你的行为轨迹...</h2>
      <p className="text-emerald-600 animate-pulse text-[1rem]">AI 正在为你绘制专属 3D 动漫形象，请稍候</p>
    </div>
  );

  const renderResult = () => {
    const personality = personalities[resultType];

    return (
      <div className="flex min-h-screen bg-white items-center justify-center p-[1rem] md:p-[2rem]">
        <div className="flex flex-col items-center w-full max-w-[64rem] bg-white p-[1.5rem] pb-[7rem] md:pb-[3rem] md:p-[3rem] animate-fade-in relative">
          <div className="text-center mb-[2rem] mt-[0.5rem]">
            <p className="text-emerald-600 font-bold tracking-widest mb-[0.5rem] text-[0.875rem] md:text-[1rem]">你的专属户外人格 (OBTI)</p>
            <h1 className="text-[2.25rem] md:text-[3.5rem] lg:text-[4rem] font-black text-emerald-900 mb-[1rem]">{personality.title}</h1>
            <div className="inline-block bg-amber-100 text-amber-800 px-[1.25rem] py-[0.375rem] rounded-full text-[0.875rem] md:text-[1rem] font-bold border border-amber-200 tracking-widest shadow-sm">
              {personality.obtiCode}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center w-full gap-[2rem] lg:gap-[3rem]">
            {/* 左侧头像 */}
            <div className="w-full max-w-[28rem] lg:max-w-[26rem] aspect-square bg-slate-50 rounded-[2rem] shadow-2xl overflow-hidden relative border-8 border-white flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={personality.title} className="w-full h-full object-cover animate-fade-in" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-emerald-50">
                  {generationError ? (
                    <>
                      <div className="text-[3.125rem] mb-[1rem]">🏔️</div>
                      <p className="text-emerald-700 font-medium text-[1rem]">哎呀，山里的信号不好，<br />3D形象召唤失败了。<br />但你的灵魂依然闪耀！</p>
                    </>
                  ) : (
                    <Icons.Loader />
                  )}
                </div>
              )}

              <div className="absolute bottom-[1rem] right-[1rem] bg-black/50 backdrop-blur-md text-white text-[0.625rem] px-[0.625rem] py-[0.25rem] rounded-full font-medium tracking-wide">
                AI Generated
              </div>
            </div>

            {/* 右侧文字 */}
            <div className="flex flex-col flex-1 w-full max-w-[28rem] lg:max-w-none">
              <div className="bg-emerald-50/70 p-[1.5rem] md:p-[2rem] rounded-[2rem] shadow-sm border border-emerald-100 relative overflow-hidden flex-1 h-full flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-full h-[0.375rem] bg-emerald-500"></div>
                <div className="flex flex-wrap gap-[0.5rem] mb-[1.5rem]">
                  {personality.tags.split(' / ').map((tag, idx) => (
                    <span key={idx} className="bg-white text-emerald-700 px-[0.75rem] py-[0.375rem] rounded-lg text-[0.875rem] md:text-[1rem] font-bold border border-emerald-200">
                      #{tag}
                    </span>
                  ))}
                </div>
                <p className="text-slate-700 leading-loose text-[0.9375rem] md:text-[1.125rem] font-medium">
                  {personality.desc}
                </p>
              </div>
            </div>
          </div>

          {/* 底部按钮栏 - 移动端吸底，PC端融入容器 */}
          <div className="fixed lg:static bottom-0 left-0 w-full border-t lg:border-none border-gray-100 bg-white/90 lg:bg-transparent backdrop-blur-xl p-[1rem] lg:p-0 lg:mt-[2.5rem] flex justify-center gap-[1rem] z-30 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] lg:shadow-none">
            <button
              onClick={startQuiz}
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-[1.5rem] py-[0.875rem] rounded-full font-bold transition flex-1 lg:flex-none lg:w-[12rem]"
            >
              <Icons.Refresh />
              再测一次
            </button>
            <button
              onClick={() => {
                const text = `我是【${personality.title}】(${personality.obtiCode})！标签：${personality.tags}。快来测测你的专属户外人格~`;
                if (navigator.clipboard && window.isSecureContext) {
                  navigator.clipboard.writeText(text).then(() => {
                    alert('分享文案已复制！长按上方图片即可保存你的专属AI形象哦~');
                  });
                } else {
                  const textArea = document.createElement('textarea');
                  textArea.value = text;
                  document.body.appendChild(textArea);
                  textArea.focus();
                  textArea.select();
                  try {
                    document.execCommand('copy');
                    alert('分享文案已复制！长按上方图片即可保存你的专属AI形象哦~');
                  } catch (err) {
                    alert('复制失败，请手动截图分享~');
                  }
                  document.body.removeChild(textArea);
                }
              }}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-[1.5rem] py-[0.875rem] rounded-full font-bold transition flex-1 lg:flex-none lg:w-[12rem] shadow-lg shadow-emerald-500/30"
            >
              <Icons.Share />
              分享结果
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
