import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { createCache } from "@/lib/cache";
import { rateLimiter } from "@/lib/rate-limit";
import { User } from "@/models/User";
import { Project } from "@/models/Project";
import { Skill } from "@/models/Skill";

/**
 * GET /api/search?q=react&type=freelancers|projects|skills&page=1
 *
 * MongoDB $text search with $meta textScore relevance ranking across the three
 * searchable collections (each has a text index defined in its schema —
 * without those indexes $text queries fail outright).
 *
 * - `type` omitted → unified results grouped by type (freelancers, projects, skills)
 * - `type` given   → only that group, paginated via `page`
 * - Matching terms are wrapped in **bold** markers for the frontend
 * - Payloads cached in-process for 60s; 30 req/min/IP rate limit
 */

const limiter = rateLimiter({ limit: 30, window: 60 });
const searchCache = createCache<SearchPayload>("search", 300);

const PAGE_SIZE = 10;
const CACHE_TTL_SECONDS = 60;
const VALID_TYPES = ["freelancers", "projects", "skills"] as const;
type SearchType = (typeof VALID_TYPES)[number];

interface SearchHit {
  id: string;
  type: SearchType;
  /** Relevance from $meta textScore (higher = better match). */
  score: number;
  title: string;
  /** Snippet with **term** highlight markers. */
  excerpt: string;
  image?: string | null;
  href: string;
  meta?: Record<string, unknown>;
}

interface SearchPayload {
  query: string;
  results: Record<SearchType, { items: SearchHit[]; total: number }>;
  page: number;
}

export async function GET(request: Request) {
  const blocked = limiter.check(request);
  if (blocked) return blocked;

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim().slice(0, 100);
    const rawType = searchParams.get("type");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

    if (q.length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters." },
        { status: 400 }
      );
    }

    const type: SearchType | null = VALID_TYPES.includes(rawType as SearchType)
      ? (rawType as SearchType)
      : null;

    const cacheKey = `${q.toLowerCase()}|${type ?? "all"}|${page}`;
    const cached = searchCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(
        { data: cached },
        { headers: { "X-Cache": "HIT" } }
      );
    }

    await connectToDatabase();

    const wanted: SearchType[] = type ? [type] : [...VALID_TYPES];
    // In unified mode show the top 5 of each group; in single-type mode, a
    // full paginated page.
    const perGroup = type ? PAGE_SIZE : 5;
    const skip = type ? (page - 1) * PAGE_SIZE : 0;

    const [freelancers, projects, skills] = await Promise.all([
      wanted.includes("freelancers")
        ? searchFreelancers(q, perGroup, skip)
        : emptyGroup(),
      wanted.includes("projects")
        ? searchProjects(q, perGroup, skip)
        : emptyGroup(),
      wanted.includes("skills") ? searchSkills(q, perGroup, skip) : emptyGroup(),
    ]);

    const payload: SearchPayload = {
      query: q,
      page,
      results: { freelancers, projects, skills },
    };

    searchCache.set(cacheKey, payload, CACHE_TTL_SECONDS);
    return NextResponse.json({ data: payload }, { headers: { "X-Cache": "MISS" } });
  } catch (error) {
    console.error("[GET /api/search]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/*                              Per-type searches                             */
/* -------------------------------------------------------------------------- */

function emptyGroup(): Promise<{ items: SearchHit[]; total: number }> {
  return Promise.resolve({ items: [], total: 0 });
}

/** Shared shape of a $text query with relevance sort. */
const textQuery = (q: string) => ({ $text: { $search: q } });
const scoreMeta = { score: { $meta: "textScore" } } as const;

async function searchFreelancers(q: string, limit: number, skip: number) {
  const filter = {
    ...textQuery(q),
    role: "freelancer" as const,
    banned: { $ne: true },
  };
  const [docs, total] = await Promise.all([
    User.find(filter, scoreMeta)
      .select("name headline bio skills image averageRating totalReviews")
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit)
      .lean<Array<Record<string, unknown> & { _id: unknown; score: number }>>(),
    User.countDocuments(filter),
  ]);

  const items: SearchHit[] = docs.map((d) => ({
    id: String(d._id),
    type: "freelancers",
    score: d.score,
    title: highlight(String(d.name ?? ""), q),
    excerpt: highlight(
      truncate(String(d.headline || d.bio || ""), 160),
      q
    ),
    image: (d.image as string | null) ?? null,
    href: `/freelancers/${String(d._id)}`,
    meta: {
      skills: d.skills,
      averageRating: d.averageRating,
      totalReviews: d.totalReviews,
    },
  }));

  return { items, total };
}

async function searchProjects(q: string, limit: number, skip: number) {
  const filter = { ...textQuery(q), status: "open" as const };
  const [docs, total] = await Promise.all([
    Project.find(filter, scoreMeta)
      .select("title description skills budgetType budgetMin budgetMax hourlyRate")
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit)
      .lean<Array<Record<string, unknown> & { _id: unknown; score: number }>>(),
    Project.countDocuments(filter),
  ]);

  const items: SearchHit[] = docs.map((d) => ({
    id: String(d._id),
    type: "projects",
    score: d.score,
    title: highlight(String(d.title ?? ""), q),
    excerpt: highlight(truncate(String(d.description ?? ""), 160), q),
    href: `/projects/${String(d._id)}`,
    meta: {
      skills: d.skills,
      budgetType: d.budgetType,
      budgetMin: d.budgetMin,
      budgetMax: d.budgetMax,
      hourlyRate: d.hourlyRate,
    },
  }));

  return { items, total };
}

async function searchSkills(q: string, limit: number, skip: number) {
  const filter = { ...textQuery(q), isPublished: true };
  const [docs, total] = await Promise.all([
    Skill.find(filter, scoreMeta)
      .select("title description slug category level hourlyRate rating reviewCount")
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit)
      .lean<Array<Record<string, unknown> & { _id: unknown; score: number }>>(),
    Skill.countDocuments(filter),
  ]);

  const items: SearchHit[] = docs.map((d) => ({
    id: String(d._id),
    type: "skills",
    score: d.score,
    title: highlight(String(d.title ?? ""), q),
    excerpt: highlight(truncate(String(d.description ?? ""), 160), q),
    href: `/skills/${String(d.slug ?? d._id)}`,
    meta: {
      category: d.category,
      level: d.level,
      hourlyRate: d.hourlyRate,
      rating: d.rating,
      reviewCount: d.reviewCount,
    },
  }));

  return { items, total };
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/**
 * Wrap each search term in **bold** markers (Markdown-style) for the frontend.
 * Terms are matched case-insensitively on word prefixes; regex special chars
 * in user input are escaped so "c++" can't break the pattern.
 */
function highlight(text: string, query: string): string {
  if (!text) return text;
  const terms = query
    .split(/\s+/)
    .filter((t) => t.length >= 2)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (terms.length === 0) return text;
  const pattern = new RegExp(`\\b(${terms.join("|")})`, "gi");
  return text.replace(pattern, "**$1**");
}
