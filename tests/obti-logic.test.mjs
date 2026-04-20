import assert from 'node:assert/strict';
import {
  allTypes,
  analyzeAnswers,
  buildIdealAnswersForType,
  calculateTypeFromAnswers,
  DIMENSION_HIT_THRESHOLD,
  dimensionProfiles,
  personalities,
  questions,
} from '../src/analysis.js';

const validDimensions = new Set(['E_I', 'S_N', 'T_F', 'J_P']);

function runTests() {
  // 1) 数据完整性
  assert.equal(Array.isArray(questions), true, 'questions 必须为数组');
  assert.equal(questions.length, 30, '题目数量应为 30');

  const ids = questions.map(q => q.id);
  const uniqueIds = new Set(ids);
  assert.equal(uniqueIds.size, 30, '题目 id 必须唯一');
  for (let i = 1; i <= 30; i++) {
    assert.equal(uniqueIds.has(i), true, `缺少题目 id: ${i}`);
  }

  for (const q of questions) {
    assert.equal(validDimensions.has(q.dimension), true, `非法维度: ${q.dimension}`);
    const pair = q.dimension.split('_');
    assert.equal(pair.includes(q.agree), true, `题目 ${q.id} agree 与维度不匹配`);
    assert.equal(pair.includes(q.disagree), true, `题目 ${q.id} disagree 与维度不匹配`);
    assert.notEqual(q.agree, q.disagree, `题目 ${q.id} agree/disagree 不能相同`);
  }

  // 2) 人格配置完整性
  const expectedTypes = allTypes();
  const personalityKeys = Object.keys(personalities).sort();
  assert.equal(personalityKeys.length, 16, 'personality 类型应为 16');
  assert.deepEqual(personalityKeys, [...expectedTypes].sort(), 'personality 键必须覆盖全部16型');

  for (const type of personalityKeys) {
    const p = personalities[type];
    for (const key of ['obtiCode', 'title', 'tags', 'desc', 'prompt']) {
      assert.equal(typeof p[key], 'string', `${type}.${key} 必须是字符串`);
      assert.equal(p[key].trim().length > 0, true, `${type}.${key} 不能为空`);
    }
  }

  // 3) 15维映射完整性
  assert.equal(dimensionProfiles.length, 15, '必须定义15个子维度');
  const mappedIds = [];
  for (const profile of dimensionProfiles) {
    assert.equal(Array.isArray(profile.questionIds), true, `${profile.id} questionIds 必须为数组`);
    assert.equal(profile.questionIds.length, 2, `${profile.id} 必须映射2道题`);
    profile.questionIds.forEach((questionId) => {
      assert.equal(Number.isInteger(questionId), true, `${profile.id} 题号必须为整数`);
      mappedIds.push(questionId);
    });
  }

  const mappedSet = new Set(mappedIds);
  assert.equal(mappedSet.size, 30, '15维映射应覆盖30道不重复题目');
  for (let i = 1; i <= 30; i++) {
    assert.equal(mappedSet.has(i), true, `15维映射缺少题号: ${i}`);
  }

  assert.equal(DIMENSION_HIT_THRESHOLD >= 0.5 && DIMENSION_HIT_THRESHOLD <= 1, true, '命中阈值应在合理范围');

  // 4) 核心目标：16 型全部可达 + 分析边界
  for (const type of expectedTypes) {
    const answers = buildIdealAnswersForType(type);
    const actual = calculateTypeFromAnswers(answers);
    assert.equal(actual, type, `人格 ${type} 不可达，实际得到 ${actual}`);

    const analysis = analyzeAnswers(answers, type);
    assert.equal(analysis.matchPercent, 100, `${type} 理想作答匹配度应为100`);
    assert.equal(analysis.hitCount, 15, `${type} 理想作答命中维度应为15`);
    assert.equal(analysis.dimensionBreakdown.length, 15, `${type} 应返回15维分析`);

    analysis.dimensionBreakdown.forEach((item) => {
      assert.equal(item.score >= 0 && item.score <= 1, true, `${type} ${item.id} score范围非法`);
      assert.equal(item.scorePercent >= 0 && item.scorePercent <= 100, true, `${type} ${item.id} scorePercent范围非法`);
    });
  }

  // 5) 空答案和中立答案边界
  const emptyType = calculateTypeFromAnswers({});
  assert.equal(emptyType, 'ESTJ', '空答案应按 tie-break 规则得到 ESTJ');

  const neutralAnswers = Object.fromEntries(questions.map(q => [q.id, 0]));
  const neutralType = calculateTypeFromAnswers(neutralAnswers);
  assert.equal(neutralType, 'ESTJ', '全中立应得到 ESTJ');

  const neutralAnalysis = analyzeAnswers(neutralAnswers, neutralType);
  assert.equal(neutralAnalysis.matchPercent >= 0 && neutralAnalysis.matchPercent <= 100, true, '中立答案匹配度范围非法');
  assert.equal(neutralAnalysis.hitCount >= 0 && neutralAnalysis.hitCount <= 15, true, '中立答案命中维度范围非法');

  console.log('All tests passed: 16型可达，15维分析映射正确，匹配度/命中维度边界正常。');
}

runTests();
