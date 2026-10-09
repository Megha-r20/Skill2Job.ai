import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { aiCache, canonicalize, generateCacheKey } from '../lib/cache/aiCache.js';
import { aiService } from '../lib/services/aiService.js';
import { resumeService } from '../lib/services/resumeService.js';

describe('AI Caching Layer & Telemetry Suite', () => {
    beforeEach(() => {
        aiCache.clear();
    });

    describe('1. Deterministic Keying & Canonicalization', () => {
        it('canonicalize sorts keys recursively regardless of property definition order', () => {
            const obj1 = { z: 1, a: 2, nested: { y: 'bar', x: 'foo' } };
            const obj2 = { a: 2, z: 1, nested: { x: 'foo', y: 'bar' } };

            const str1 = canonicalize(obj1);
            const str2 = canonicalize(obj2);

            assert.strictEqual(str1, str2, 'Both objects must produce identical canonical JSON strings');
            assert.strictEqual(str1, '{"a":2,"nested":{"x":"foo","y":"bar"},"z":1}');
        });

        it('generateCacheKey produces consistent SHA-256 prefixed keys', () => {
            const key1 = generateCacheKey('resume_analysis', { text: 'Python developer with React' }, 'gemini-2.0-flash');
            const key2 = generateCacheKey('resume_analysis', { text: 'Python developer with React' }, 'gemini-2.0-flash');
            const keyDifferentModel = generateCacheKey('resume_analysis', { text: 'Python developer with React' }, 'gemini-1.5-pro');

            assert.strictEqual(key1, key2);
            assert.ok(key1.startsWith('aicache:resume_analysis:'));
            assert.notStrictEqual(key1, keyDifferentModel, 'Keys must differ when model changes');
        });
    });

    describe('2. In-Memory LRU & TTL Operations', () => {
        it('sets and retrieves values from cache', async () => {
            await aiCache.set('test:key1', { result: 'fast' }, 60);
            const val = await aiCache.get('test:key1');

            assert.deepStrictEqual(val, { result: 'fast' });
        });

        it('returns null on cache miss', async () => {
            const val = await aiCache.get('test:nonexistent');
            assert.strictEqual(val, null);
        });

        it('invalidates cache entries by namespace or pattern', async () => {
            await aiCache.set('aicache:test_ns:1', { data: 1 });
            await aiCache.set('aicache:test_ns:2', { data: 2 });
            await aiCache.set('aicache:other_ns:3', { data: 3 });

            const removed = await aiCache.invalidate('test_ns');
            assert.strictEqual(removed, 2);

            assert.strictEqual(await aiCache.get('aicache:test_ns:1'), null);
            assert.deepStrictEqual(await aiCache.get('aicache:other_ns:3'), { data: 3 });
        });
    });

    describe('3. aiCache.wrap Execution & Cost Telemetry', () => {
        it('executes computeFn on miss, and serves cached data on subsequent call', async () => {
            let computeCount = 0;
            const expensiveComputation = async () => {
                computeCount++;
                return { analysis: 'Highly optimized resume' };
            };

            const payload = { resume: 'Candidate profile 123' };

            // First call -> Cache MISS
            const res1 = await aiCache.wrap('resume_test', payload, expensiveComputation);
            assert.strictEqual(res1.cached, false);
            assert.strictEqual(computeCount, 1);
            assert.deepStrictEqual(res1.data, { analysis: 'Highly optimized resume' });

            // Second call with same payload -> Cache HIT
            const res2 = await aiCache.wrap('resume_test', payload, expensiveComputation);
            assert.strictEqual(res2.cached, true);
            assert.strictEqual(computeCount, 1, 'computeFn must NOT be invoked again on cache hit');
            assert.deepStrictEqual(res2.data, { analysis: 'Highly optimized resume' });

            // Telemetry inspection
            const stats = aiCache.getStats();
            assert.strictEqual(stats.hits >= 1, true);
            assert.strictEqual(stats.misses >= 1, true);
            assert.ok(stats.estimatedCostSavingsUsd.startsWith('$'));
        });

        it('honors forceRefresh option to bypass cache and recompute', async () => {
            let computeCount = 0;
            const computation = async () => {
                computeCount++;
                return { count: computeCount };
            };

            const payload = { id: 42 };

            const res1 = await aiCache.wrap('refresh_test', payload, computation);
            assert.strictEqual(res1.cached, false);
            assert.strictEqual(res1.data.count, 1);

            // With forceRefresh: true -> recomputes
            const res2 = await aiCache.wrap('refresh_test', payload, computation, { forceRefresh: true });
            assert.strictEqual(res2.cached, false);
            assert.strictEqual(res2.data.count, 2);
            assert.strictEqual(computeCount, 2);
        });
    });

    describe('4. End-to-End Service Integration with AI Caching', () => {
        it('caches aiService.analyzeResume calls across invocations', async () => {
            const sampleResume = `
                Alex Rivera
                alex.rivera@example.com
                Software Engineer with 3 years experience in Python, React, and PostgreSQL.
            `;

            // Initial call
            const analysis1 = await aiService.analyzeResume(sampleResume);
            assert.ok(analysis1.name);
            assert.ok(analysis1.skills.length > 0);

            const initialHits = aiCache.getStats().hits;

            // Second call with identical content should hit cache
            const analysis2 = await aiService.analyzeResume(sampleResume);
            assert.deepStrictEqual(analysis1, analysis2);

            const postHits = aiCache.getStats().hits;
            assert.strictEqual(postHits, initialHits + 1, 'Cache hit count must increment on second call');
        });

        it('caches resumeService.rewriteBulletPoint calls', async () => {
            const rawBullet = 'Worked on backend APIs with Node.js and Express to improve performance';

            const result1 = await resumeService.rewriteBulletPoint(rawBullet, {
                role: 'Backend Engineer',
                technologies: 'Node.js, Express'
            });

            assert.ok(result1.rewrittenBullets.length >= 3);

            const initialHits = aiCache.getStats().hits;

            // Second call with identical bullet
            const result2 = await resumeService.rewriteBulletPoint(rawBullet, {
                role: 'Backend Engineer',
                technologies: 'Node.js, Express'
            });

            assert.deepStrictEqual(result1, result2);
            assert.strictEqual(aiCache.getStats().hits, initialHits + 1);
        });
    });
});
