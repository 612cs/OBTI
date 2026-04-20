import { useState } from 'react';
import Icons from './Icons.jsx';

export default function ResultScreen({
  result,
  isSharingPoster,
  onSharePoster,
  onShareCopy,
  onRestart,
}) {
  const [imageStatus, setImageStatus] = useState('loading'); // 'loading', 'loaded', 'error'

  if (!result) return null;

  const { personality, analysis, avatarUrl, type } = result;

  return (
    <div className="flex min-h-screen bg-white items-start justify-center px-[0.5rem] py-[1.25rem] md:px-[1.25rem] md:py-[1rem] font-zh">
      <div className="w-full max-w-[64rem] bg-white overflow-hidden animate-fade-in relative pb-[8rem] md:pb-[4rem]">
        <div className="p-[1rem] md:p-[1.25rem] bg-white text-slate-900">
          <div className="grid lg:grid-cols-[22rem_1fr] gap-[1rem] md:gap-[1.25rem] items-start">
            <div className="rounded-[1.5rem] overflow-hidden bg-transparent h-[330px] relative flex justify-center items-center">
              {imageStatus === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent z-10">
                  <div className="w-[2.5rem] h-[2.5rem] border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mb-[0.75rem]"></div>
                  <span className="text-emerald-700 font-medium text-[0.9rem] animate-pulse">图片生成中...</span>
                </div>
              )}
              {imageStatus === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent z-10 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-[0.5rem]"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  <span className="text-[0.95rem] font-medium">图片加载失败</span>
                </div>
              )}
              <img 
                src={avatarUrl} 
                alt={personality.title} 
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageStatus('loaded')}
                onError={() => setImageStatus('error')}
              />
            </div>

            <div className="flex flex-col gap-[0.75rem]">
              <div>
                <div className="flex items-end gap-[0.6rem] mt-[0.5rem]">
                  <h1 className="text-[2rem] md:text-[3rem] font-black leading-tight text-emerald-900">{personality.title}</h1>
                  <span className="inline-flex items-center bg-purple-50 text-purple-600 border border-purple-200 rounded-[0.6rem] px-[0.55rem] py-[0.2rem] text-[0.8rem] md:text-[0.9rem] font-bold mb-[0.25rem]">{type}</span>
                </div>
                <p className="text-emerald-700 font-semibold text-[1.25rem] mt-[0.25rem]">匹配度 {analysis.matchPercent}%</p>
              </div>

              <div className="bg-emerald-50 rounded-[1rem] border border-emerald-200 px-[1.25rem] py-[1rem]">
                <p className="font-bold text-[1.125rem] text-emerald-900">匹配度 {analysis.matchPercent}% · 精准命中 {analysis.hitCount}/15 维</p>
                <p className="text-emerald-800 text-[0.95rem] mt-[0.5rem] leading-relaxed">{analysis.summaryText}</p>
              </div>

              <div className="flex flex-wrap gap-[0.5rem]">
                {personality.tags.split(' / ').map((tag) => (
                  <span key={tag} className="bg-white border border-emerald-200 text-emerald-700 px-[0.8rem] py-[0.35rem] rounded-full text-[0.85rem] shadow-sm font-medium">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-[1rem] md:p-[1.25rem] grid lg:grid-cols-[1.3fr_1fr] gap-[1rem] md:gap-[1rem] mt-[0.5rem] md:mt-[0.25rem]">
          <section className="rounded-[1.5rem] border border-slate-200 bg-transparent p-[1.5rem] md:p-[2rem]">
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

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-[1.5rem] md:p-[2rem] mb-[1rem]">
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

        <div className="fixed md:absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl p-[1rem] md:p-[1.5rem] flex flex-wrap md:flex-nowrap justify-center gap-[0.75rem] z-30">
          <button
            onClick={onSharePoster}
            disabled={isSharingPoster}
            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-[0.75rem] sm:px-[1.5rem] py-[0.85rem] rounded-full font-bold transition flex-1 md:flex-none md:w-[13rem] disabled:opacity-60 shadow-lg shadow-emerald-500/20 whitespace-nowrap text-[0.95rem] md:text-[1.05rem]"
          >
            <Icons.Share />
            {isSharingPoster ? '生成中...' : '分享海报'}
          </button>
          <button
            onClick={onShareCopy}
            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-[0.75rem] sm:px-[1.5rem] py-[0.85rem] rounded-full font-bold transition flex-1 md:flex-none md:w-[13rem] whitespace-nowrap text-[0.95rem] md:text-[1.05rem]"
          >
            <Icons.Copy />
            复制链接
          </button>
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-[0.75rem] sm:px-[1.5rem] py-[0.85rem] rounded-full font-bold transition md:flex-none md:w-[13rem] md:mt-0 w-full whitespace-nowrap text-[0.95rem] md:text-[1.05rem]"
          >
            <Icons.Refresh />
            再测一次
          </button>
        </div>
      </div>
    </div>
  );
}
