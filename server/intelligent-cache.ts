/**
 * server/intelligent-cache.ts
 *
 * Intelligent Caching Layer (Performance Milestone P2)
 *
 * Provides multi-category, deterministic caching for:
 * 1. Query Embeddings (query_embeddings)
 * 2. Retrieval Results (retrieval_results)
 * 3. Candidate Context (candidate_context)
 * 4. Generated Context (generated_context)
 *
 * Features:
 * - Deterministic Key Generation (string/object payload hashing)
 * - Expiry Support (TTL per entry and category default TTLs)
 * - Invalidation Methods (by key, category, pattern, or full clear)
 * - Cache Hit/Miss Metrics & Response Time Tracking
 *
 * Required Output Format:
 * {
 *   cacheHit: true,
 *   responseTime: "0.15ms"
 * }
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  CacheCategory,
  CacheResponseMetadata,
  IntelligentCacheStats,
} from "@/types/rag";
import {
  CacheResponseMetadataSchema,
  IntelligentCacheStatsSchema,
} from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";

// ---------------------------------------------------------------------------
// Category Default TTLs (in milliseconds)
// ---------------------------------------------------------------------------

export const DEFAULT_CATEGORY_TTLS: Record<CacheCategory, number> = {
  query_embeddings: 60 * 60 * 1000,   // 1 hour
  retrieval_results: 15 * 60 * 1000,  // 15 minutes
  candidate_context: 10 * 60 * 1000,  // 10 minutes
  generated_context: 10 * 60 * 1000,  // 10 minutes
};

// ---------------------------------------------------------------------------
// Cache Entry Contract
// ---------------------------------------------------------------------------

export interface CacheEntry<T> {
  key: string;
  category: string;
  data: T;
  createdAt: number;
  expiresAt: number;
  ttlMs: number;
  hits: number;
}

// ---------------------------------------------------------------------------
// Intelligent Cache Manager Engine
// ---------------------------------------------------------------------------

export class IntelligentCacheManager {
  private cacheMap = new Map<string, CacheEntry<unknown>>();
  private totalHits = 0;
  private totalMisses = 0;

  /**
   * Generates a deterministic cache key from a category and any primitive/object payload.
   *
   * @param category - CacheCategory or custom prefix
   * @param payload - Payload string, object, array, or number
   * @returns Formatted cache key string
   */
  generateKey(category: CacheCategory | string, payload: unknown): string {
    if (typeof payload === "string") {
      const normalized = payload.trim().toLowerCase().replace(/\s+/g, " ");
      return `${category}:${normalized}`;
    }
    try {
      const stringified = JSON.stringify(payload, Object.keys(payload || {}).sort());
      return `${category}:${stringified}`;
    } catch {
      return `${category}:${String(payload)}`;
    }
  }

  /**
   * Retrieves an unexpired item from cache.
   *
   * @param category - Cache category
   * @param payloadOrKey - Payload object/string or direct key
   * @returns Cached data or null on miss/expiry
   */
  get<T>(category: CacheCategory | string, payloadOrKey: unknown): T | null {
    const key =
      typeof payloadOrKey === "string" && payloadOrKey.startsWith(`${category}:`)
        ? payloadOrKey
        : this.generateKey(category, payloadOrKey);

    const entry = this.cacheMap.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.totalMisses++;
      return null;
    }

    // Expiry Check
    if (Date.now() > entry.expiresAt) {
      this.cacheMap.delete(key);
      this.totalMisses++;
      return null;
    }

    entry.hits++;
    this.totalHits++;
    return entry.data;
  }

  /**
   * Stores an item in the cache with a specified TTL.
   *
   * @param category - Cache category
   * @param payloadOrKey - Payload object/string or direct key
   * @param data - Data payload to cache
   * @param customTtlMs - Optional TTL override in ms
   * @returns Formatted cache key
   */
  set<T>(
    category: CacheCategory | string,
    payloadOrKey: unknown,
    data: T,
    customTtlMs?: number
  ): string {
    const key =
      typeof payloadOrKey === "string" && payloadOrKey.startsWith(`${category}:`)
        ? payloadOrKey
        : this.generateKey(category, payloadOrKey);

    const defaultTtl =
      DEFAULT_CATEGORY_TTLS[category as CacheCategory] ?? (10 * 60 * 1000);
    const ttlMs = customTtlMs ?? defaultTtl;

    const now = Date.now();
    const entry: CacheEntry<T> = {
      key,
      category,
      data,
      createdAt: now,
      expiresAt: now + ttlMs,
      ttlMs,
      hits: 0,
    };

    this.cacheMap.set(key, entry as CacheEntry<unknown>);
    return key;
  }

  /**
   * Invalidation Method 1: Invalidates a single specific key.
   */
  invalidateKey(key: string): boolean {
    return this.cacheMap.delete(key);
  }

  /**
   * Invalidation Method 2: Invalidates all entries under a specific category.
   */
  invalidateCategory(category: CacheCategory | string): number {
    let evictedCount = 0;
    for (const [key, entry] of Array.from(this.cacheMap.entries())) {
      if (entry.category === category || key.startsWith(`${category}:`)) {
        this.cacheMap.delete(key);
        evictedCount++;
      }
    }
    return evictedCount;
  }

  /**
   * Invalidation Method 3: Invalidates entries matching a string substring or RegExp pattern.
   */
  invalidatePattern(pattern: string | RegExp): number {
    let evictedCount = 0;
    const regex = typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;

    for (const key of Array.from(this.cacheMap.keys())) {
      if (regex.test(key)) {
        this.cacheMap.delete(key);
        evictedCount++;
      }
    }
    return evictedCount;
  }

  /**
   * Invalidation Method 4: Full cache flush.
   */
  clear(): void {
    this.cacheMap.clear();
    this.totalHits = 0;
    this.totalMisses = 0;
  }

  /**
   * Returns cache metrics, hits/misses, hit ratio, and entry counts per category.
   */
  getStats(): IntelligentCacheStats {
    // Perform cleanup of expired entries
    const now = Date.now();
    for (const [key, entry] of Array.from(this.cacheMap.entries())) {
      if (now > entry.expiresAt) {
        this.cacheMap.delete(key);
      }
    }

    const totalCalls = this.totalHits + this.totalMisses;
    const hitRatio = totalCalls > 0 ? Number((this.totalHits / totalCalls).toFixed(4)) : 0;

    const categories: Record<string, number> = {};
    for (const entry of Array.from(this.cacheMap.values())) {
      categories[entry.category] = (categories[entry.category] || 0) + 1;
    }

    const stats: IntelligentCacheStats = {
      hits: this.totalHits,
      misses: this.totalMisses,
      hitRatio,
      totalEntries: this.cacheMap.size,
      categories,
    };

    return strictValidate(
      IntelligentCacheStatsSchema,
      stats,
      "Intelligent Cache Stats"
    );
  }

  /**
   * High-Level Operation Wrapper:
   * Wraps any async function call with intelligent caching.
   * Measures response time and returns data alongside { cacheHit, responseTime } metadata.
   *
   * @param category - Target CacheCategory
   * @param payload - Function parameters/query key
   * @param fetcher - Async fetcher function
   * @param customTtlMs - Optional TTL override
   * @returns Object containing data and CacheResponseMetadata
   */
  async wrap<T>(
    category: CacheCategory | string,
    payload: unknown,
    fetcher: () => Promise<T>,
    customTtlMs?: number
  ): Promise<{ data: T; metadata: CacheResponseMetadata }> {
    const startTime = performance.now();
    const cachedData = this.get<T>(category, payload);

    if (cachedData !== null) {
      const elapsed = (performance.now() - startTime).toFixed(2);
      const metadata: CacheResponseMetadata = {
        cacheHit: true,
        responseTime: `${elapsed}ms`,
        category,
        ttlMs: customTtlMs ?? (DEFAULT_CATEGORY_TTLS[category as CacheCategory] || 600000),
      };

      strictValidate(CacheResponseMetadataSchema, metadata, "Cache Metadata (Hit)");

      return {
        data: cachedData,
        metadata,
      };
    }

    // Cache Miss -> Execute fetcher
    const freshData = await fetcher();
    this.set(category, payload, freshData, customTtlMs);
    const elapsed = (performance.now() - startTime).toFixed(2);

    const metadata: CacheResponseMetadata = {
      cacheHit: false,
      responseTime: `${elapsed}ms`,
      category,
      ttlMs: customTtlMs ?? (DEFAULT_CATEGORY_TTLS[category as CacheCategory] || 600000),
    };

    strictValidate(CacheResponseMetadataSchema, metadata, "Cache Metadata (Miss)");

    return {
      data: freshData,
      metadata,
    };
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultIntelligentCache = new IntelligentCacheManager();
