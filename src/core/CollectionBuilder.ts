import sdk from "postman-collection";
import * as fs from "fs";

export class CollectionBuilder {
  private collection: sdk.Collection;

  constructor(title: string) {
    this.collection = new sdk.Collection({
      info: { name: `${title} - Automated Tests` } as any,
    });
  }

  addRequest(
    method: string,
    urlPath: string,
    bodyData: any,
    parameters: any[] = []
  ) {
    const queryParams = parameters
      .filter((p) => p.in === "query")
      .map((p) => ({
        key: p.name,
        value: `{{${p.name}}}`,
        description: p.description || "",
      }));

    const pathVariables = parameters
      .filter((p) => p.in === "path")
      .map((p) => ({
        key: p.name,
        value: `{{${p.name}}}`,
        description: p.description || "",
      }));

    const requestConfig: any = {
      method: method.toUpperCase(),
      header: [{ key: "Content-Type", value: "application/json" }],
      url: {
        host: ["{{baseUrl}}"],
        path: urlPath
          .split("/")
          .filter((p) => p !== "")
          .map((p) => p.replace(/{/g, ":").replace(/}/g, "")),
        query: queryParams,
        variable: pathVariables,
      },
    };

    if (bodyData && Object.keys(bodyData).length > 0) {
      requestConfig.body = {
        mode: "raw",
        raw: JSON.stringify(bodyData, null, 2),
        options: { raw: { language: "json" } },
      };
    }

    const newItem = new sdk.Item({
      name: `${method.toUpperCase()} ${urlPath}`,
      request: requestConfig as any,
    });

    newItem.events.add(
      new sdk.Event({
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
          ],
        } as any,
      })
    );

    this.collection.items.add(newItem);
  }

  setAuthentication(securitySchemes: any) {
    if (!securitySchemes) return;
    const schemeNames = Object.keys(securitySchemes);
    if (schemeNames.length === 0) return;
    const scheme = securitySchemes[schemeNames[0]];

    if (scheme.type === "apiKey") {
      this.collection.auth = new sdk.RequestAuth({
        type: "apikey",
        apikey: [
          { key: "key", value: scheme.name, type: "string" },
          { key: "value", value: "{{apiKey}}", type: "string" },
          { key: "in", value: scheme.in || "header", type: "string" },
        ],
      });
    } else if (scheme.type === "http" && scheme.scheme === "bearer") {
      this.collection.auth = new sdk.RequestAuth({
        type: "bearer",
        bearer: [{ key: "token", value: "{{bearerToken}}", type: "string" }],
      });
    }
  }

  saveToFile(fileName: string) {
    fs.writeFileSync(
      fileName,
      JSON.stringify(this.collection.toJSON(), null, 2)
    );
  }
  getCollection() {
    return this.collection;
  }
}
