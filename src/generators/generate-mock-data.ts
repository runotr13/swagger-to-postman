import { DataFactory } from "./DataFactory.js";

export function generateMockData(schema: any, fieldName: string = ""): any {
  if (!schema) return null;

  const target = schema.schema ? schema.schema : schema;
  const type = target.type || (target.properties ? "object" : "string");

  if (type === "array") {
    const items = target.items || { type: "string" };
    return [generateMockData(items, fieldName)];
  }

  if (type === "object" || target.properties) {
    const obj: any = {};
    const props = target.properties || {};
    for (const [key, value] of Object.entries(props)) {
      obj[key] = generateMockData(value, key);
    }
    return obj;
  }

  return DataFactory.generate(
    type,
    target.format,
    fieldName || target.name || target.title,
    target.enum
  );
}
