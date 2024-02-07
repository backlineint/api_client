import { Cache } from "@drupal-api-client/api-client";
import { JsonApiClient } from "@drupal-api-client/json-api-client";
import { Jsona } from "jsona";
import * as JSONAPI from "jsonapi-typescript";
import { Logger } from "tslog";

const baseUrl = "https://dev-drupal-api-client-poc.pantheonsite.io";

const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  console.log("Using custom fetch");
  return fetch(input, init).then((response) => response);
};

// Collections can be typed in conjunction with the JSONAPI.CollectionResourceDoc type
// from the jsonapi-typescript package.
// this allows us to pass the type into `get` and get back a typed collection.
type Recipe = {
  title: string;
  path: {
    alias: string;
    langcode: string;
  };
  field_cooking_time: number;
  field_difficulty: "easy" | "medium" | "hard";
  field_ingredients: string[];
  field_number_of_servings: number;
  field_preparation_time: number;
  field_recipe_instructions: {
    value: string;
    format: string;
    processed: string;
    field_summary: {
      value: string;
      format: string;
      processed: string;
    };
  };
};

// use sessionStorage for the cache.
const cache = {
  get: async <T>(key: string, _ttl: number) => {
    //                        ^define arbitrary arguments as needed
    console.log(`Checking cache for ${key}...`);
    // parse the JSON here so when we stringify it later it is not double stringified
    return JSON.parse(sessionStorage.getItem(key) as string) as T;
  },
  set: async <T>(key: string, value: T) => {
    console.log(`Setting ${key} in cache...`);
    sessionStorage.setItem(key, JSON.stringify(value));
    return;
  },
} satisfies Cache;

// Example of using a custom logging library, in this case tslog.
const customLogger = new Logger({ name: "JsonApiClient" });

async function main() {
  const jsonApiClient = new JsonApiClient(baseUrl, {
    customFetch,
    cache,
    defaultLocale: "en",
    logger: customLogger,
    debug: true,
  });

  const resourceId = "35f7cd32-2c54-49f2-8740-0b0ec2ba61f6";

  try {
    const recipeCollection = await jsonApiClient.getCollection<
      JSONAPI.CollectionResourceDoc<string, Recipe>
    >("node--recipe");

    console.log("JSON:API Collection", recipeCollection);

    const collection = await jsonApiClient.getCollection("node--recipe", {
      locale: "es",
    });
    console.log("JSON:API Collection", collection);

    document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <pre>${JSON.stringify(recipeCollection, null, 2)}</pre>`;

    /* Example using a deserializer */
    const jsonApiClientJsona = new JsonApiClient(baseUrl, {
      serializer: new Jsona(),
      debug: true,
    });
    const jsonaCollection = await jsonApiClientJsona.getCollection(
      "node--recipe",
    );
    console.log("JSON:API Collection deserialized via jsona", jsonaCollection);

    /* Example using a default logger */
    const jsonApiClientDefaultLogger = new JsonApiClient(baseUrl, {
      debug: true,
    });
    const defaultLoggerCollection =
      await jsonApiClientDefaultLogger.getCollection("node--recipe");
    console.log(
      "JSON:API Collection with default logger",
      defaultLoggerCollection,
    );

    /* Example using a filter as string */
    const filterCollectionUsingQueryString = await jsonApiClient.getCollection(
      "node--recipe",
      { queryString: "filter[field_cooking_time][value]=60" },
    );
    console.log(
      "JSON:API Collection with filter",
      filterCollectionUsingQueryString,
    );
    /* Example using a raw response */
    const recipeCollectionRaw = await jsonApiClient.getCollection(
      "node--recipe",
      {
        rawResponse: true,
      },
    );
    console.log("Object with raw response and json: ", recipeCollectionRaw);
    console.log("Json provided by object: ", recipeCollectionRaw.json);
    const rawResponse = recipeCollectionRaw.response;
    console.log(
      "Json read from raw response stream: ",
      await rawResponse.json(),
    );

    /* Example fetching a single resource by ID */
    const singleResource = await jsonApiClient.getResource(
      "node--recipe",
      resourceId,
    );
    console.log("JSON:API Single resource", singleResource);

    const singleResourceRaw = await jsonApiClient.getResource(
      "node--recipe",
      resourceId,
      {
        rawResponse: true,
      },
    );
    console.log(
      "Object with raw response and json (single resource): ",
      singleResourceRaw,
    );
    const rawResourceResponse = singleResourceRaw.response;
    console.log(
      "Json read from raw response stream (single resource): ",
      await rawResourceResponse.json(),
    );

    const singleResourceSpanish = await jsonApiClient.getResource(
      "node--recipe",
      resourceId,
      {
        locale: "es",
      },
    );
    console.log(
      "JSON:API Single resource overriding default locale",
      singleResourceSpanish,
    );

    const singleResourceSpanishWithCacheDisabled =
      await jsonApiClient.getResource("node--recipe", resourceId, {
        locale: "es",
        disableCache: true,
      });
    console.log(
      "JSON:API Single resource overriding default locale and disabling cache",
      singleResourceSpanishWithCacheDisabled,
    );

    const routerResponse = await jsonApiClient.getResourceByPath(
      "/articles/give-it-a-go-and-grow-your-own-herbs",
    );
    console.log("JSON:API Router response", routerResponse);

    // trigger an error - check the console to see the error logged from getResource
    // @ts-expect-error
    globalThis.fetch = undefined;
    await jsonApiClient.getResource("node--recipe", "invalid-id");
  } catch (error) {
    // Any errors that occur in `fetch` will bubble up to the `get*` methods.
    // If `debug` is on the error will be logged to the console.
    // Further handling of the error can be done in this catch block.
    console.log(error);
  }
}

main();
