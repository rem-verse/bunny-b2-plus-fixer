import { AwsClient } from "npm:aws4fetch";
import * as BunnySDK from "https://esm.sh/@bunny.net/edgescript-sdk@0.11.2";
import { env } from "node:process";

BunnySDK.net.http.servePullZone({ url: "https://nintendo.cdn.rem-verse.com" })
  .onOriginRequest(
    (ctx: { request: Request }) => {
      if (
        ctx.request.url.indexOf("+") !== -1 ||
        ctx.request.url.indexOf("%2B") !== -1 ||
        ctx.request.url.indexOf("%2b") !== -1
      ) {
        const newUrl = new URL(ctx.request.url.replaceAll("+", "%2B"));
        const client = new AwsClient({
          "accessKeyId": env[
            `${
              newUrl.host.split(".")[0].replaceAll("-", "_").toUpperCase()
            }_B2_APPLICATION_KEY_ID`
          ]!,
          "secretAccessKey": env[
            `${
              newUrl.host.split(".")[0].replaceAll("-", "_").toUpperCase()
            }_B2_APPLICATION_KEY`
          ]!,
          "service": "s3",
        });

        return client.sign(newUrl.toString(), {
          method: ctx.request.method,
          headers: {
            host: ctx.request.headers.get("host"),
          },
          // deno-lint-ignore no-explicit-any
        } as any);
      } else {
        return Promise.resolve(ctx.request);
      }
    },
  ).onOriginResponse((ctx: { request: Request; response: Response }) => {
    return Promise.resolve(ctx.response);
  });
