import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
    redis?: Redis;
};

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis =
    globalForRedis.redis ??
    new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy(times) {
            // Reconnect exponentially up to 3 seconds
            return Math.min(times * 100, 3000);
        },
    });

redis.on("error", (err) => {
    // Log error cleanly instead of crashing unhandled
    console.warn("[Redis Connection Warning]:", err?.message || err);
});

if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = redis;
}

