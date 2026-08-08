import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreMockTest, summarizeScore } from './mock-test-utils.js';

test('scoreMockTest counts correct answers and calculates percentage', () => {
  const questions = [
    { id: 'q1', answer: 'A' },
    { id: 'q2', answer: 'B' },
    { id: 'q3', answer: 'C' },
  ];

  const result = scoreMockTest(questions, { q1: 'A', q2: 'X', q3: 'C' });

  assert.equal(result.correctCount, 2);
  assert.equal(result.totalQuestions, 3);
  assert.equal(result.percentage, 66.67);
});

test('summarizeScore returns a detailed result label', () => {
  assert.equal(summarizeScore(90).label, 'Ajoyib natija');
  assert.equal(summarizeScore(45).label, 'Yana bir oz mashq qiling');
});
