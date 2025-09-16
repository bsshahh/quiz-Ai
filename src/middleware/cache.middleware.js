import redis from "./redisClient.js";

export const cache = (keyPrefix, ttl = 300) => {
  return async (req, res, next) => {
    const key = keyPrefix + JSON.stringify(req.params || req.query);

    try {
      const cachedData = await redis.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData)); // return cached response
      }
      
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        redis.setex(key, ttl, JSON.stringify(data));
        return originalJson(data);
      };
      next();
    } catch (err) {
      console.error("Redis cache error:", err);
      next(); 
    }
  };
};
