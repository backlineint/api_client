import {
  JsonApiClient,
  RawApiResponseWithData,
} from "@drupal-api-client/json-api-client";
import { createCache } from "@drupal-api-client/utils";
import { Jsona } from "jsona";
import * as JSONAPI from "jsonapi-typescript";
import { Logger } from "tslog";

const baseUrl = import.meta.env.VITE_BASE_URL
  ? import.meta.env.VITE_BASE_URL
  : "https://drupal-api-demo.party";

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

// Example of using a custom logging library, in this case tslog.
const customLogger = new Logger({ name: "JsonApiClient" });

const cache = createCache();

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
    const recipeCollectionRaw = (await jsonApiClient.getCollection(
      "node--recipe",
      {
        rawResponse: true,
      },
    )) as RawApiResponseWithData<Recipe>;

    console.log("Object with raw response and json: ", recipeCollectionRaw);
    console.log("Json provided by object: ", recipeCollectionRaw.json);
    const rawResponse = recipeCollectionRaw.response;
    console.log(
      "Json read from raw response stream: ",
      await rawResponse.json(),
    );

    /*
    Example fetching a single resource by ID
    Note: resource examples below will 404 if you're using
    a non-default environment since the UUID will be different
    */
    const singleResource = await jsonApiClient.getResource(
      "node--recipe",
      resourceId,
    );
    console.log("JSON:API Single resource", singleResource);

    const singleResourceRaw = (await jsonApiClient.getResource(
      "node--recipe",
      resourceId,
      {
        rawResponse: true,
      },
    )) as RawApiResponseWithData<Recipe>;
    console.log(
      "Object with raw response and json (single resource): ",
      singleResourceRaw,
    );
    const rawResourceResponse = singleResourceRaw.response;
    console.log(
      "Json read from raw response stream (single resource): ",
      await rawResourceResponse.json(),
    );

    const routerResponse = await jsonApiClient.getResourceByPath(
      "/articles/give-it-a-go-and-grow-your-own-herbs",
    );
    console.log("JSON:API Router response", routerResponse);

    const viewResponse = await jsonApiClient.getView("recipes--page_1");
    console.log("JSON:API View response", viewResponse);

    // Example demonstrating password grant
    // const passwordGrantClient = new JsonApiClient(baseUrl, {
    //   authentication: {
    //     type: "OAuth",
    //     credentials: {
    //       grantType: "password",
    //       clientId: import.meta.env.VITE_CLIENT_ID,
    //       clientSecret: import.meta.env.VITE_CLIENT_SECRET,
    //       username: import.meta.env.VITE_USERNAME,
    //       password: import.meta.env.VITE_PASSWORD,
    //     },
    //   },
    //   debug: true,
    // });

    // const passwordGrantResponse = await passwordGrantClient.getCollection(
    //   "action--action",
    // );
    // console.log("JSON:API Password Grant response", passwordGrantResponse);

    // Example demonstrating creating a resource
    // const basicAuthClient = new JsonApiClient(baseUrl, {
    //   authentication: {
    //     type: "Basic",
    //     credentials: {
    //       username: "admin",
    //       password: "admin",
    //     },
    //   },
    //   debug: true,
    // });

    // const createResource = await basicAuthClient.createResource("node--page", {
    //   data: {
    //     type: "node--page",
    //     attributes: {
    //       title: "My custom title",
    //       body: {
    //         value: "Custom value",
    //         format: "plain_text",
    //       },
    //     },
    //   },
    // });

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
