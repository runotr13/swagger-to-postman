import fs from "fs";
import SwaggerParser from "@apidevtools/swagger-parser";
import { CollectionBuilder } from "./core/CollectionBuilder.js";
import { EnvironmentBuilder } from "./core/EnvironmentBuilder.js";
import { SwaggerService } from "./services/SwaggerService.js";
import { generateMockData } from "./generators/generate-mock-data.js";
import { syncToPostman } from "./helpers/syncToPostman.js";

type GenerateOptions = {
  input: string;
  output?: string;
  sync?: boolean;
};

export async function generatePostman({
  input,
  output = "./output",
  sync = false,
}: GenerateOptions) {
  const api: any = await SwaggerParser.validate(input);

  const colBuilder = new CollectionBuilder(api.info.title);
  const envBuilder = new EnvironmentBuilder(api.info.title);

  const security = SwaggerService.getSecuritySchemes(api);
  colBuilder.setAuthentication(security);

  const securityStr = JSON.stringify(security || "");
  if (securityStr.includes("apiKey"))
    envBuilder.addVariable("apiKey", "YOUR_KEY");
  if (securityStr.includes("bearer"))
    envBuilder.addVariable("bearerToken", "YOUR_TOKEN");

  envBuilder.addVariable("baseUrl", SwaggerService.getBaseUrl(api));

  for (const [path, pathItem] of Object.entries(api.paths || {})) {
    if (!pathItem) continue;

    for (const method of [
      "get",
      "post",
      "put",
      "delete",
      "patch",
      "options",
      "head",
    ]) {
      const operation = (pathItem as any)[method];
      if (!operation) continue;

      const parameters = operation.parameters || [];

      parameters.forEach((param: any) => {
        if (param.in !== "body") {
          const mockVal = generateMockData(param, param.name);
          envBuilder.addVariable(param.name, String(mockVal ?? ""));
        }
      });

      let mockBody = {};
      const bodySchema =
        operation.requestBody?.content?.["application/json"]?.schema ||
        parameters.find((p: any) => p.in === "body")?.schema;

      if (bodySchema) {
        mockBody = generateMockData(bodySchema);
      }

      colBuilder.addRequest(method, path, mockBody, parameters);
    }
  }

  if (!fs.existsSync(output)) fs.mkdirSync(output, { recursive: true });

  colBuilder.saveToFile(`${output}/collection.json`);
  envBuilder.saveToFile(`${output}/environment.json`);

  if (sync) {
    await syncToPostman(colBuilder.getCollection());
  }
}
