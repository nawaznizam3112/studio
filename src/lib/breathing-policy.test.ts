import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCompletionStatus, canAssignProgram, roleGroupForUser, shouldAnonymizeRecord } from './breathing-policy';

test('RBAC role grouping', () => {
  assert.equal(roleGroupForUser('clinician'), 'clinician');
  assert.equal(roleGroupForUser('business'), 'clinician');
  assert.equal(roleGroupForUser('patient'), 'patient');
  assert.equal(roleGroupForUser('customer'), 'patient');
  assert.equal(roleGroupForUser('unknown'), null);
});

test('assignment gating requires explicit hold enablement for advanced programs', () => {
  assert.equal(canAssignProgram(true, false), false);
  assert.equal(canAssignProgram(true, true), true);
  assert.equal(canAssignProgram(false, false), true);
});

test('session completion status tracks active vs completed', () => {
  assert.deepEqual(buildCompletionStatus(10, 4), { completedCount: 4, totalModules: 10, status: 'active' });
  assert.deepEqual(buildCompletionStatus(7, 7), { completedCount: 7, totalModules: 7, status: 'completed' });
});

test('retention policy anonymizes data older than retention window', () => {
  const now = new Date('2026-04-16T00:00:00.000Z');
  assert.equal(shouldAnonymizeRecord(new Date('2024-01-01T00:00:00.000Z'), 12, now), true);
  assert.equal(shouldAnonymizeRecord(new Date('2026-03-30T00:00:00.000Z'), 12, now), false);
});
