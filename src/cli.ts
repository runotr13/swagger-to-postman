#!/usr/bin/env node
import { Command } from "commander";
import ora from "ora";
import pc from "picocolors";
import { generatePostman } from "./index.js";

const program = new Command();

program
  .name("swagger-to-postman")
  .requiredOption("-i, --input <pathOrUrl>", "Swagger/OpenAPI file or URL")
  .option("-o, --output <path>", "Output folder", "./output")
  .option("--sync", "Sync collection to Postman")
  .action(async (opts) => {
    const spinner = ora(pc.cyan("Swagger analiz ediliyor...")).start();
    try {
      await generatePostman({
        input: opts.input,
        output: opts.output,
        sync: opts.sync,
      });
      spinner.succeed(pc.green("Başarıyla tamamlandı!"));
    } catch (err: any) {
      spinner.fail(pc.red(err.message));
      process.exit(1);
    }
  });

program.parse();
