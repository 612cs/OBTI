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

const validDimensions = new Set(['E_I', 'S_N', 'T_F', 'J_P']);
const dimensionTypeIndex = {
  E_I: 0,
  S_N: 1,
  T_F: 2,
  J_P: 3,
};

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

function buildAnswersForType(type) {
  const answers = {};

  for (const q of questions) {
    const dimIndex = dimensionTypeIndex[q.dimension];
    const targetLetter = type[dimIndex];

    if (q.agree === targetLetter) {
      answers[q.id] = 3;
    } else if (q.disagree === targetLetter) {
      answers[q.id] = -3;
    } else {
      throw new Error(`题目 ${q.id} 维度映射异常`);
    }
  }

  return answers;
}

function allTypes() {
  const a = ['E', 'I'];
  const b = ['S', 'N'];
  const c = ['T', 'F'];
  const d = ['J', 'P'];
  const result = [];

  for (const i of a) {
    for (const j of b) {
      for (const k of c) {
        for (const m of d) {
          result.push(`${i}${j}${k}${m}`);
        }
      }
    }
  }

  return result;
}

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

  // 3) 评分边界行为
  assert.equal(calculateType({}), 'ESTJ', '空答案应按 tie-break 规则得到 ESTJ');
  assert.equal(calculateType(Object.fromEntries(questions.map(q => [q.id, 0]))), 'ESTJ', '全中立应得到 ESTJ');

  // 4) 核心目标：16 型全部可达
  for (const type of expectedTypes) {
    const answers = buildAnswersForType(type);
    const actual = calculateType(answers);
    assert.equal(actual, type, `人格 ${type} 不可达，实际得到 ${actual}`);
  }

  // 5) 分页参数一致性（基于页面逻辑）
  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  assert.equal(totalPages, 6, '30题 + 每页5题，应为6页');

  console.log('All tests passed: 16种人格可达，且核心逻辑与数据完整性校验通过。');
}

runTests();
