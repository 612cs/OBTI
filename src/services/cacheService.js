const CACHE_KEY = 'OBTI_QUIZ_DRAFT';

export const cacheService = {
  // 保存进度到 localStorage
  saveDraft: (answers) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(answers));
    } catch (error) {
      console.warn('缓存保存失败:', error);
    }
  },

  // 读取缓存的进度
  loadDraft: () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('缓存读取失败:', error);
      return null;
    }
  },

  // 清空缓存
  clearDraft: () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.warn('缓存清空失败:', error);
    }
  },

  // 判断是否有缓存存在
  hasDraft: () => {
    try {
      return localStorage.getItem(CACHE_KEY) !== null;
    } catch (error) {
      console.warn('缓存检查失败:', error);
      return false;
    }
  },
};
