export class SwaggerService {
  static getBaseUrl(api: any): string {
    if (api.servers && api.servers.length > 0) return api.servers[0].url;
    if (api.host) {
      const protocol = (api.schemes && api.schemes[0]) || "https";
      return `${protocol}://${api.host}${api.basePath || ""}`;
    }
    return "http://localhost";
  }

  static getSecuritySchemes(api: any) {
    return api.components?.securitySchemes || api.securityDefinitions || null;
  }
}
