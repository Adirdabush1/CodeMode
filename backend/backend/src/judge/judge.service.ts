// src/judge/judge.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { QuestionsService } from '../questions/questions.service';

type RunResult = {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  status?: unknown;
  message?: string;
  output?: string;
  result?: string;
};

type TestItem = {
  input: string;
  output: string;
  hidden?: boolean;
};

type QuestionLike = {
  tests?: TestItem[];
  examples?: TestItem[];
};

/**
 * JudgeService
 * מריץ קוד מול ה-runner ומחזיר תוצאות בדיקה מפורטות.
 */
@Injectable()
export class JudgeService {
  private readonly logger = new Logger(JudgeService.name);

  constructor(private readonly questionsService: QuestionsService) {}

  async checkAnswer(
    code: string,
    language: string,
    questionId: string,
  ): Promise<
    { success: boolean; results: any[] } | { success: false; error: string }
  > {
    const questionRaw = (await this.questionsService.findById(
      questionId,
    )) as QuestionLike | null;

    if (!questionRaw) {
      return { success: false, error: 'Question not found' };
    }

    const rawTests: TestItem[] =
      Array.isArray(questionRaw.tests) && questionRaw.tests.length > 0
        ? questionRaw.tests
        : Array.isArray(questionRaw.examples) && questionRaw.examples.length > 0
          ? questionRaw.examples.map((e) => ({ ...e, hidden: !!e.hidden }))
          : [{ input: '', output: '' }];

    const results: Array<Record<string, unknown>> = [];
    let allPassed = true;

    for (let i = 0; i < rawTests.length; i += 1) {
      const t = rawTests[i];
      const input = String(t.input ?? '');
      const expectedRaw = String(t.output ?? '');
      const hidden = !!t.hidden;

      try {
        const runOut = await this.runCode(code, language, input);

        const runObj: RunResult =
          typeof runOut === 'string' ? { stdout: runOut } : (runOut ?? {});

        const actual = (
          typeof runObj.stdout === 'string'
            ? runObj.stdout
            : typeof runObj.output === 'string'
              ? runObj.output
              : typeof runObj.result === 'string'
                ? runObj.result
                : ''
        ).trim();
        const expected = expectedRaw.trim();

        const compilePresent =
          (typeof runObj.compile_output === 'string' &&
            runObj.compile_output.trim() !== '') ||
          (typeof runObj.stderr === 'string' && runObj.stderr.trim() !== '');

        if (compilePresent) {
          allPassed = false;
          results.push({
            index: i,
            input,
            expected: hidden ? undefined : expected,
            actual: hidden ? undefined : actual,
            passed: false,
            compile_output: runObj.compile_output,
            stderr: runObj.stderr,
            status: runObj.status,
            message: runObj.message,
          });
          continue;
        }

        const passed = this.compareOutputs(expected, actual, 'trim');

        if (!passed) allPassed = false;

        results.push({
          index: i,
          input,
          expected: hidden ? undefined : expected,
          actual: hidden ? undefined : actual,
          passed,
        });
      } catch (unknownErr) {
        const errMsg =
          unknownErr instanceof Error
            ? unknownErr.message
            : typeof unknownErr === 'string'
              ? unknownErr
              : JSON.stringify(unknownErr);

        this.logger.error(
          `Error running test #${i} for question ${questionId}: ${errMsg}`,
        );

        allPassed = false;
        results.push({
          index: i,
          input,
          expected: hidden ? undefined : expectedRaw,
          actual: hidden ? undefined : undefined,
          passed: false,
          error: errMsg,
        });
      }
    }

    return { success: allPassed, results };
  }

  private async runCode(
    code: string,
    language: string,
    input: string,
  ): Promise<RunResult | string> {
    const RUNNER_URL =
      process.env.RUNNER_URL ??
      process.env.BACKEND_RUN_URL ??
      'http://localhost:3000';
    const TIMEOUT_MS = Number(process.env.RUNNER_TIMEOUT_MS ?? '15000');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${RUNNER_URL}/judge/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, stdin: input }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Runner returned HTTP ${res.status}: ${txt}`);
      }

      const rawData: unknown = await res.json();

      if (typeof rawData !== 'object' || rawData === null) {
        throw new Error('Invalid runner response');
      }

      // ✅ לא anyData, אלא אובייקט בטיפוס נכון
      const obj = rawData as Record<string, unknown>;

      const data: RunResult = {
        stdout: typeof obj.stdout === 'string' ? obj.stdout : undefined,
        stderr: typeof obj.stderr === 'string' ? obj.stderr : undefined,
        compile_output:
          typeof obj.compile_output === 'string'
            ? obj.compile_output
            : undefined,
        status: obj.status,
        message: typeof obj.message === 'string' ? obj.message : undefined,
        output: typeof obj.output === 'string' ? obj.output : undefined,
        result: typeof obj.result === 'string' ? obj.result : undefined,
      };

      return data;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Runner timeout after ${TIMEOUT_MS} ms`);
      }
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : JSON.stringify(err);
      throw new Error(msg);
    } finally {
      clearTimeout(timeout);
    }
  }

  private compareOutputs(
    expected: string,
    actual: string,
    mode: 'exact' | 'trim' | 'ignoreWhitespace' | 'json' | 'numeric' = 'trim',
    tol = 1e-9,
  ): boolean {
    if (mode === 'exact') return expected === actual;
    if (mode === 'trim') return expected.trim() === actual.trim();
    if (mode === 'ignoreWhitespace') {
      const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
      return norm(expected) === norm(actual);
    }
    if (mode === 'json') {
      try {
        const a: unknown = JSON.parse(expected);
        const b: unknown = JSON.parse(actual);
        return JSON.stringify(a) === JSON.stringify(b);
      } catch {
        return expected.trim() === actual.trim();
      }
    }
    if (mode === 'numeric') {
      try {
        const a: unknown = JSON.parse(expected);
        const b: unknown = JSON.parse(actual);
        return this.numericDeepCompare(a, b, tol);
      } catch {
        const ne = Number(expected);
        const na = Number(actual);
        if (!Number.isNaN(ne) && !Number.isNaN(na))
          return Math.abs(ne - na) <= tol;
        return expected.trim() === actual.trim();
      }
    }
    return expected.trim() === actual.trim();
  }

  private numericDeepCompare(a: unknown, b: unknown, tol: number): boolean {
    if (typeof a === 'number' && typeof b === 'number')
      return Math.abs(a - b) <= tol;
    if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
      return a.every((v, i) => this.numericDeepCompare(v, b[i], tol));
    }
    if (this.isPlainObject(a) && this.isPlainObject(b)) {
      const ka = Object.keys(a).sort();
      const kb = Object.keys(b).sort();
      if (ka.length !== kb.length) return false;
      for (const k of ka) {
        const va = a[k];
        const vb = b[k];
        if (!this.numericDeepCompare(va, vb, tol)) return false;
      }
      return true;
    }
    return a === b;
  }

  private isPlainObject(x: unknown): x is Record<string, unknown> {
    return !!x && typeof x === 'object' && !Array.isArray(x);
  }
}
