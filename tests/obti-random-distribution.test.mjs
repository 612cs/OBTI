import assert from 'node:assert/strict';
import {
  analyzeAnswers,
  calculateTypeFromAnswers,
  personalities,
  questions,
} from '../src/analysis.js';

const validTypes = new Set(Object.keys(personalities));

function createRng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function randomAnswer(rng) {
  const values = [-3, -2, -1, 0, 1, 2, 3];
  return values[Math.floor(rng() * values.length)];
}

function percentile(values, q) {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor((sorted.length - 1) * q);
  return sorted[idx];
}

function runSimulation(seed, sampleCount = 1000) {
  const rng = createRng(seed);
  const typeCounts = Object.fromEntries([...validTypes].map(t => [t, 0]));
  const matchPercentSeries = [];
  const hitCountSeries = [];

  for (let i = 0; i < sampleCount; i++) {
    const answers = {};
    for (const q of questions) {
      answers[q.id] = randomAnswer(rng);
    }

    const type = calculateTypeFromAnswers(answers);
    assert.equal(validTypes.has(type), true, `出现非法类型 ${type}`);
    typeCounts[type] += 1;

    const analysis = analyzeAnswers(answers, type);
    assert.equal(analysis.dimensionBreakdown.length, 15, '必须返回15维分析');
    assert.equal(analysis.matchPercent >= 0 && analysis.matchPercent <= 100, true, '匹配度越界');
    assert.equal(analysis.hitCount >= 0 && analysis.hitCount <= 15, true, '命中维度越界');

    matchPercentSeries.push(analysis.matchPercent);
    hitCountSeries.push(analysis.hitCount);
  }

  const nonZeroTypes = Object.values(typeCounts).filter(n => n > 0).length;
  const maxTypeCount = Math.max(...Object.values(typeCounts));

  return {
    typeCounts,
    nonZeroTypes,
    maxTypeCount,
    matchP10: percentile(matchPercentSeries, 0.1),
    matchP90: percentile(matchPercentSeries, 0.9),
    hitP10: percentile(hitCountSeries, 0.1),
    hitP90: percentile(hitCountSeries, 0.9),
  };
}

function runTests() {
  assert.equal(questions.length, 30, '题量应为30，随机分布测试依赖该规模');
  assert.equal(validTypes.size, 16, '人格字典应包含16型');

  const seeds = [7, 42, 2026];
  const results = seeds.map(seed => runSimulation(seed, 1000));

  for (const [idx, result] of results.entries()) {
    assert.equal(result.nonZeroTypes >= 12, true, `第${idx + 1}组随机样本覆盖类型过少: ${result.nonZeroTypes}`);
    assert.equal(result.maxTypeCount <= 400, true, `第${idx + 1}组随机样本出现异常集中: ${result.maxTypeCount}`);

    assert.equal(result.matchP90 > result.matchP10, true, `第${idx + 1}组匹配度分布异常`);
    assert.equal(result.hitP90 > result.hitP10, true, `第${idx + 1}组命中维度分布异常`);
  }

  const first = results[0].typeCounts;
  const sorted = Object.entries(first).sort((a, b) => b[1] - a[1]);
  const top5 = sorted.slice(0, 5).map(([t, c]) => `${t}:${c}`).join(', ');

  console.log('Random distribution test passed (1000 samples x 3 seeds).');
  console.log(`Seed=7 top5 => ${top5}`);
}

runTests();
