#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import ora from "ora";
import fs from "fs";
import SwaggerParser from "@apidevtools/swagger-parser";
import { CollectionBuilder } from "./core/CollectionBuilder.js";
import { EnvironmentBuilder } from "./core/EnvironmentBuilder.js";
import { SwaggerService } from "./services/SwaggerService.js";
import { generateMockData } from "./generators/generate-mock-data.js";

const program = new Command();

program
  .name("swagger-to-test")
  .requiredOption("-u, --url <url>", "Swagger URL")
  .option("-o, --output <path>", "Output folder", "./output")
  .action(async (options) => {
    const spinner = ora(pc.cyan("Swagger analiz ediliyor...")).start();
    try {
      const api: any = await SwaggerParser.validate(options.url);
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

      const paths = api.paths || {};
      for (const [path, pathItem] of Object.entries(api.paths || {})) {
        if (!pathItem) continue;

        for (const method of ["get", "post", "put", "delete"]) {
          const operation = (pathItem as any)[method];
          if (!operation) continue;

          const parameters = operation.parameters || [];

          parameters.forEach((param: any) => {
            if (param && param.in !== "body") {
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

      if (!fs.existsSync(options.output))
        fs.mkdirSync(options.output, { recursive: true });
      colBuilder.saveToFile(`${options.output}/collection.json`);
      envBuilder.saveToFile(`${options.output}/environment.json`);

      spinner.succeed(pc.green("Başarıyla tamamlandı!"));
    } catch (error: any) {
      spinner.fail(pc.red(`Hata: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();
