const fs = require('fs');
const appFile = './src/App.jsx';
let content = fs.readFileSync(appFile, 'utf8');

const resultStart = content.indexOf('  const renderResult = () => {');
const resultEnd = content.indexOf('  return (\n    <>\n      {step === \'welcome\'');

if (resultStart === -1 || resultEnd === -1) {
  console.log('Cannot find renderResult bounds');
  process.exit(1);
}

const newRenderResult = `  const renderResult = () => {
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
                  <div className="mt-[1rem] rounded-[1rem] border border-amber-200 bg-amber-50 px-[1rem] py-[0.75rem] text-amber-900 text-[0.9rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="font-medium">3D 生图失败，当前使用兜底图。</span>
                    <button
                      onClick={handleRetryAvatar}
                      disabled={isRetryingAvatar}
                      className="shrink-0 rounded-full bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-[0.8rem] font-bold disabled:opacity-60 transition"
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
                           <div className="h-full bg-emerald-500 rounded-full" style={{ width: \`\${item.scorePercent}%\` }}></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[1rem] bg-amber-50 border border-amber-100 p-[1rem]">
                  <p className="font-bold text-amber-900 mb-[0.75rem] text-[1.05rem]">拓展潜能</p>
                  <ul className="space-y-[0.75rem]">
                    {analysis.watchouts.slice(0, 3).map((item) => (
                      <li key={item.id} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-amber-800 text-[0.9rem] font-semibold">
                          <span>{item.name}</span>
                          <span>{item.scorePercent}%</span>
                        </div>
                        <div className="h-[0.3rem] bg-amber-200/50 rounded-full overflow-hidden">
                           <div className="h-full bg-amber-400 rounded-full" style={{ width: \`\${item.scorePercent}%\` }}></div>
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
                      <p className={\`font-bold \${item.isHit ? 'text-emerald-600' : 'text-amber-600'}\`}>{item.scoreText}</p>
                    </div>
                    <div className="h-[0.35rem] rounded-full bg-slate-200 mt-[0.5rem] overflow-hidden">
                      <div
                        className={\`h-full rounded-full transition-all duration-1000 \${item.isHit ? 'bg-emerald-500' : 'bg-amber-400'}\`}
                        style={{ width: \`\${item.scorePercent}%\` }}
                      ></div>
                    </div>
                    <p className="text-[0.75rem] text-slate-500 mt-[0.4rem]">{item.tag}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="fixed md:absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 p-[1rem] md:p-[1.5rem] flex flex-wrap md:flex-nowrap justify-center xl:justify-center gap-[0.75rem] z-30">
            <button
              onClick={handleSharePoster}
              disabled={isSharingPoster}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-[1.5rem] py-[0.85rem] rounded-full font-bold transition flex-1 md:flex-none md:w-[13rem] disabled:opacity-60 shadow-lg shadow-emerald-500/20"
            >
              <Icons.Share />
              {isSharingPoster ? '生成中...' : '分享海报'}
            </button>
            <button
              onClick={handleShareCopy}
              className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-[1.5rem] py-[0.85rem] rounded-full font-bold transition flex-1 md:flex-none md:w-[13rem]"
            >
              <Icons.Copy />
              复制链接
            </button>
            <button
              onClick={startQuiz}
              className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-[1.5rem] py-[0.85rem] rounded-full font-bold transition flex-1 md:flex-none md:w-[13rem] mt-2 md:mt-0 w-full"
            >
              <Icons.Refresh />
              再测一次
            </button>
          </div>
        </div>
      </div>
    );
  };
`;

content = content.substring(0, resultStart) + newRenderResult + '\n' + content.substring(resultEnd);
fs.writeFileSync(appFile, content, 'utf8');
console.log('done!');
