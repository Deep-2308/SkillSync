import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { rateLimiter, clientIp } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

describe("rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should extract client IP", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.1" },
    });
    expect(clientIp(req)).toBe("192.168.1.1");

    const req2 = new Request("http://localhost", {
      headers: { "x-real-ip": "10.0.0.1" },
    });
    expect(clientIp(req2)).toBe("10.0.0.1");

    const req3 = new Request("http://localhost");
    expect(clientIp(req3)).toBe("unknown");
  });

  it("should allow requests under the limit", () => {
    const limiter = rateLimiter({ limit: 2, window: 60 });
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "127.0.0.1" },
    });

    const res1 = limiter.check(req);
    expect(res1).toBeNull();

    const res2 = limiter.check(req);
    expect(res2).toBeNull();
  });

  it("should block requests over the limit and include retry-after headers", () => {
    const limiter = rateLimiter({ limit: 2, window: 60 });
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "127.0.0.2" },
    });

    limiter.check(req);
    limiter.check(req);
    const res = limiter.check(req) as NextResponse;

    expect(res).not.toBeNull();
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    expect(res.headers.get("X-RateLimit-Limit")).toBe("2");
  });

  it("should allow requests again after the window expires", () => {
    const limiter = rateLimiter({ limit: 1, window: 60 });
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "127.0.0.3" },
    });

    limiter.check(req);
    const blocked = limiter.check(req);
    expect(blocked).not.toBeNull();

    // Advance time by 61 seconds
    vi.advanceTimersByTime(61 * 1000);

    const allowed = limiter.check(req);
    expect(allowed).toBeNull();
  });
});
