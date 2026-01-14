import { faker } from "@faker-js/faker";

export class DataFactory {
  static generate(
    type: string,
    format?: string,
    fieldName?: string,
    enumValues?: any[]
  ): any {
    if (enumValues && enumValues.length > 0)
      return faker.helpers.arrayElement(enumValues);
    const lowerFieldName = fieldName?.toLowerCase() || "";
    if (lowerFieldName.includes("email")) return faker.internet.email();
    if (lowerFieldName.includes("password")) return faker.internet.password();
    if (lowerFieldName.includes("url")) return faker.internet.url();
    if (lowerFieldName.includes("id") && type === "integer")
      return faker.number.int({ min: 1, max: 999 });

    switch (type) {
      case "string":
        if (format === "date-time") return faker.date.recent().toISOString();
        return faker.lorem.word();
      case "integer":
      case "number":
        return faker.number.int({ min: 1, max: 100 });
      case "boolean":
        return faker.datatype.boolean();
      default:
        return null;
    }
  }
}
