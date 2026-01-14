import * as fs from "fs";

export class EnvironmentBuilder {
  private env: any;

  constructor(title: string) {
    this.env = {
      name: `${title} - Env`,
      values: [],
      _postman_variable_scope: "environment",
    };
  }

  addVariable(key: string, value: string) {
    const exists = this.env.values.find((v: any) => v.key === key);
    if (!exists) {
      this.env.values.push({
        key,
        value,
        enabled: true,
        type: "default",
      });
    }
  }

  saveToFile(fileName: string) {
    fs.writeFileSync(fileName, JSON.stringify(this.env, null, 2));
  }
}
