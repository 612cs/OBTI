const options = [
  { val: 3, label: '强烈认同', sizeClasses: 'w-[2.5rem] h-[2.5rem] md:w-[3.5rem] md:h-[3.5rem]', defaultClasses: 'border-emerald-500 text-emerald-500 hover:bg-emerald-50', activeClasses: 'bg-emerald-500 text-white border-emerald-500 shadow-md' },
  { val: 2, label: '认同', sizeClasses: 'w-[2rem] h-[2rem] md:w-[3rem] md:h-[3rem]', defaultClasses: 'border-emerald-400 text-emerald-400 hover:bg-emerald-50', activeClasses: 'bg-emerald-400 text-white border-emerald-400 shadow-md' },
  { val: 1, label: '稍稍认同', sizeClasses: 'w-[1.5rem] h-[1.5rem] md:w-[2.5rem] md:h-[2.5rem]', defaultClasses: 'border-emerald-300 text-emerald-300 hover:bg-emerald-50', activeClasses: 'bg-emerald-300 text-white border-emerald-300 shadow-md' },
  { val: 0, label: '中立', sizeClasses: 'w-[1.25rem] h-[1.25rem] md:w-[2rem] md:h-[2rem]', defaultClasses: 'border-gray-300 text-gray-300 hover:bg-gray-100', activeClasses: 'bg-gray-400 text-white border-gray-400 shadow-md' },
  { val: -1, label: '稍稍反对', sizeClasses: 'w-[1.5rem] h-[1.5rem] md:w-[2.5rem] md:h-[2.5rem]', defaultClasses: 'border-purple-300 text-purple-300 hover:bg-purple-50', activeClasses: 'bg-purple-300 text-white border-purple-300 shadow-md' },
  { val: -2, label: '反对', sizeClasses: 'w-[2rem] h-[2rem] md:w-[3rem] md:h-[3rem]', defaultClasses: 'border-purple-400 text-purple-400 hover:bg-purple-50', activeClasses: 'bg-purple-400 text-white border-purple-400 shadow-md' },
  { val: -3, label: '强烈反对', sizeClasses: 'w-[2.5rem] h-[2.5rem] md:w-[3.5rem] md:h-[3.5rem]', defaultClasses: 'border-purple-500 text-purple-500 hover:bg-purple-50', activeClasses: 'bg-purple-500 text-white border-purple-500 shadow-md' },
];

export default function LikertScale({ questionId, value, onChange }) {
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
}
