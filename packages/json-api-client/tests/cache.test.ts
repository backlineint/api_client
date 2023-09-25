import type { SpyInstance } from "vitest";
import JsonApiClient from "../src";

interface CacheTestContext {
  client: JsonApiClient;
  cacheSpy: {
    get: SpyInstance;
    set: SpyInstance;
  };
  fetchSpy?: SpyInstance;
}

describe("Cache", () => {
  beforeEach<CacheTestContext>((context) => {
    const baseUrl = "https://dev-drupal-api-client-poc.pantheonsite.io";
    const store = new Map();
    const cache = {
      get: async (key: string) => store.get(key),
      set: async <T>(key: string, value: T) => store.set(key, value),
    };
    context.client = new JsonApiClient(baseUrl, { cache });
    context.fetchSpy = vi.spyOn(context.client, "fetch");
    context.cacheSpy = {
      get: vi.spyOn(cache, "get"),
      set: vi.spyOn(cache, "set"),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it<CacheTestContext>("should be able to set a value", async ({
    client,
    cacheSpy,
  }) => {
    const result = await client.get("node--recipe");

    expect(cacheSpy.set).toHaveBeenCalled();
    expect(cacheSpy.set).toHaveBeenCalledWith("node--recipe", result);
  });
  it<CacheTestContext>("should be able to get a value", async ({
    client,
    cacheSpy,
    fetchSpy,
  }) => {
    await client.get("node--recipe");
    expect(cacheSpy.get).toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(cacheSpy.get).toHaveBeenCalledWith("node--recipe");
    expect(cacheSpy.get).toHaveReturnedWith(client.cache?.get("node--recipe"));

    // Call again to ensure we're getting the cached value
    await client.get("node--recipe");
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(cacheSpy.get).toHaveReturnedWith(client.cache?.get("node--recipe"));
  });
});
