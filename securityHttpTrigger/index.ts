import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as https from "https";
import * as querystring from "querystring";

function getEnvironmentVariable(name: string): string {
  return process.env[name];
}

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const body = req.body;

  return new Promise((resolve, reject) => {
    if (!body) {
      context.res = {
        status: 400,
        body: "Please pass a request",
      };

      reject();
    }

    const options = {
      host: getEnvironmentVariable("tokenHost"),
      port: parseInt(getEnvironmentVariable("tokenPort")),
      path: getEnvironmentVariable("tokenPath"),
      method: "POST",
    };
    const params = querystring.parse(body);
    params.client_secret = getEnvironmentVariable("facebookClientSecret");
    const postData = querystring.stringify();

    let result = null;

    const request = https.request(options, (response) => {
      response.on("data", (chunk) => {
        result = chunk;
      });

      response.on("end", () => {
        context.res = {
          status: 200,
          body: result,
        };
      });
    });

    request.write(postData);
    request.end();

    resolve();
  });
};

export default httpTrigger;
