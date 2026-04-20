import LikertScale from './LikertScale.jsx';

export default function QuizScreen({ questions, answers, onAnswer, onSubmit }) {
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
              <LikertScale questionId={q.id} value={answers[q.id]} onChange={onAnswer} />
              {idx < questions.length - 1 && (
                <div className="w-[6rem] h-[0.25rem] bg-gray-100 rounded-full mt-[3rem] md:mt-[4rem]"></div>
              )}
            </div>
          ))}
        </div>

        <div className="fixed md:absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-100 p-[1rem] md:p-[1.5rem] flex justify-center z-20">
          <button
            disabled={!isAllQuestionsComplete}
            onClick={onSubmit}
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
}
