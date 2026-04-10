import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const rootDir = process.cwd();
const appPath = path.join(rootDir, 'src', 'App.jsx');
const source = fs.readFileSync(appPath, 'utf8');

function extractLiteral(source, constName, startToken) {
  const start = source.indexOf(startToken);
  assert.notEqual(start, -1, `未找到常量 ${constName}`);

  const literalStart = start + startToken.length;
  let i = literalStart;
  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;

  for (; i < source.length; i++) {
    const ch = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        inString = false;
        quote = '';
      }
      continue;
    }

    if (ch === '"' || ch === '\'' || ch === '`') {
      inString = true;
      quote = ch;
      continue;
    }

    if (ch === '[' || ch === '{') {
      depth++;
      continue;
    }

    if (ch === ']' || ch === '}') {
      depth--;
      if (depth === 0) {
        return source.slice(literalStart, i + 1);
      }
    }
  }

  throw new Error(`解析 ${constName} 失败`);
}

function evalLiteral(literal) {
  return vm.runInNewContext(`(${literal})`, Object.create(null));
}

const questions = evalLiteral(extractLiteral(source, 'questions', 'const questions = '));
const personalities = evalLiteral(extractLiteral(source, 'personalities', 'const personalities = '));
const validTypes = new Set(Object.keys(personalities));

function calculateType(answers) {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  for (const q of questions) {
    const val = answers[q.id];
    if (val === undefined) continue;

    if (val > 0) {
      scores[q.agree] += val;
    } else if (val < 0) {
      scores[q.disagree] += Math.abs(val);
    }
  }

  return [
    scores.E >= scores.I ? 'E' : 'I',
    scores.S >= scores.N ? 'S' : 'N',
    scores.T >= scores.F ? 'T' : 'F',
    scores.J >= scores.P ? 'J' : 'P',
  ].join('');
}

function createRng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function randomAnswer(rng) {
  // 与页面量表一致：[-3, -2, -1, 0, 1, 2, 3]
  const values = [-3, -2, -1, 0, 1, 2, 3];
  return values[Math.floor(rng() * values.length)];
}

function runSimulation(seed, sampleCount = 1000) {
  const rng = createRng(seed);
  const counts = Object.fromEntries([...validTypes].map(t => [t, 0]));

  for (let i = 0; i < sampleCount; i++) {
    const answers = {};
    for (const q of questions) {
      answers[q.id] = randomAnswer(rng);
    }

    const type = calculateType(answers);
    assert.equal(validTypes.has(type), true, `出现非法类型 ${type}`);
    counts[type] += 1;
  }

  const nonZeroTypes = Object.values(counts).filter(n => n > 0).length;
  const maxCount = Math.max(...Object.values(counts));

  return { counts, nonZeroTypes, maxCount };
}

function runTests() {
  assert.equal(questions.length, 30, '题量应为30，随机分布测试依赖该规模');
  assert.equal(validTypes.size, 16, '人格字典应包含16型');

  const seeds = [7, 42, 2026];
  const results = seeds.map(seed => runSimulation(seed, 1000));

  for (const [idx, result] of results.entries()) {
    assert.equal(result.nonZeroTypes >= 12, true, `第${idx + 1}组随机样本覆盖类型过少: ${result.nonZeroTypes}`);
    assert.equal(result.maxCount <= 400, true, `第${idx + 1}组随机样本出现异常集中: ${result.maxCount}`);
  }

  const first = results[0].counts;
  const sorted = Object.entries(first).sort((a, b) => b[1] - a[1]);
  const top5 = sorted.slice(0, 5).map(([t, c]) => `${t}:${c}`).join(', ');

  console.log('Random distribution test passed (1000 samples x 3 seeds).');
  console.log(`Seed=7 top5 => ${top5}`);
}

runTests();
