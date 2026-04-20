import Icons from './Icons.jsx';

export default function WelcomeScreen({ onStart }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 md:p-[2rem]">
      <div className="flex flex-col items-center justify-center w-full max-w-[40rem] bg-white p-[2.5rem] md:p-[4rem] text-center animate-fade-in">
        <img src="/favicon.svg" alt="OBTI Logo" className="w-[6rem] h-[6rem] md:w-[8rem] md:h-[8rem] mb-[2rem] shadow-xl shadow-emerald-900/20 rounded-[1.5rem] md:rounded-[2rem]" />
        <h1 className="text-[2rem] md:text-[3rem] font-black text-emerald-900 mb-[1.5rem] tracking-tight">测测你的山野灵魂</h1>
        <p className="text-[1rem] md:text-[1.125rem] text-slate-600 mb-[2.5rem] max-w-md leading-relaxed">
          通过 30 道极度真实的户外场景，测出你的 <span className="inline-block bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-bold mx-1">OBTI 户外人格</span>，并生成 3D 专属形象！
        </p>
        <button
          onClick={onStart}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-[2.5rem] py-[1rem] w-full md:w-auto rounded-full font-bold text-[1.25rem] shadow-lg shadow-emerald-500/30 transform transition hover:scale-105 active:scale-95"
        >
          <Icons.Compass />
          开始探索
        </button>
      </div>
    </div>
  );
}
