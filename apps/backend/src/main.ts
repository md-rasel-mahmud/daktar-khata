import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { NestFactory } from "@nestjs/core";
import * as express from "express";
import { AppModule } from "./app.module";
import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from "@nestjs/common";
import { OpenAPIObject, SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { HttpExceptionFilter, I18nInterceptor, ErrorFormatter } from "./common";
import { MongoExceptionFilter } from "./common/http-exception/mongo-exeption.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  // Use raw body parser only for payment webhook endpoints so we can verify HMAC exactly
  // We mount the raw parser on the specific webhook routes to avoid interfering with
  // JSON body parsing and DTO validation for other payment endpoints like /payment/initiate
  // Note: the global prefix 'api/v1' is applied below, so we include it here.
  app.use("/api/v1/payment/success", express.raw({ type: "*/*" }));
  app.use("/api/v1/payment/fail", express.raw({ type: "*/*" }));
  app.use("/api/v1/payment/cancel", express.raw({ type: "*/*" }));
  app.enableCors({ origin: "*" });
  app.setGlobalPrefix("api/v1"); //route prefix
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      enableDebugMessages: true,
      forbidNonWhitelisted: true,
      validationError: {
        target: false,
        value: false,
      },
      validateCustomDecorators: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,

      exceptionFactory: (errors) => {
        const errorObject = ErrorFormatter(errors); //convert validation error message
        throw new BadRequestException(errorObject);
      },
    }),
  );

  // Build Swagger document dynamically from your controllers and decorators
  const builder = new DocumentBuilder()
    .setTitle("ClinicFlow API")
    .setDescription("ClinicFlow backend API documentation")
    .setVersion("1.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "jwt",
    )
    .build();

  const document = SwaggerModule.createDocument(app, builder);

  // Add code samples (curl and fetch) to each operation so Swagger UI shows them
  try {
    const baseUrl =
      process.env.APP_URL || `http://localhost:${process.env.PORT || 7733}`;
    const paths = document.paths || {};
    // helper to build a simple example object from a JSON Schema
    const components = (document as any).components || {};
    const compSchemas = components.schemas || {};

    const resolveRef = (ref: string) => {
      if (!ref || typeof ref !== "string") return null;
      const parts = ref.split("/");
      const name = parts[parts.length - 1];
      return compSchemas[name] || null;
    };

    const genExample = (schema: any): any => {
      if (!schema) return {};
      // resolve $ref if present
      if (schema.$ref) {
        const resolved = resolveRef(schema.$ref);
        return genExample(resolved || {});
      }

      if (schema.example !== undefined) return schema.example;
      if (schema.default !== undefined) return schema.default;
      const t = schema.type;
      if (!t && schema.properties) {
        // treat as object
        const obj: any = {};
        for (const k of Object.keys(schema.properties)) {
          obj[k] = genExample(schema.properties[k]);
        }
        return obj;
      }
      switch (t) {
        case "string":
          if (schema.enum && schema.enum.length) return schema.enum[0];
          if (schema.format === "date-time") return new Date().toISOString();
          if (schema.format === "date")
            return new Date().toISOString().slice(0, 10);
          // try to infer a value from the property name if available
          if (schema._propertyName && /email/i.test(schema._propertyName))
            return "user@example.com";
          if (
            schema._propertyName &&
            /phone|mobile|contact/i.test(schema._propertyName)
          )
            return "+8801712345678";
          if (schema._propertyName && /id$/i.test(schema._propertyName))
            return "507f1f77bcf86cd799439011";
          return "string";
        case "number":
        case "integer":
          return schema.example !== undefined ? schema.example : 0;
        case "boolean":
          return schema.example !== undefined ? schema.example : true;
        case "array":
          const items = schema.items ? genExample(schema.items) : {};
          return [items];
        case "object":
          const obj2: any = {};
          if (schema.properties) {
            for (const k of Object.keys(schema.properties)) {
              // propagate property name to aid inference
              const child = schema.properties[k] || {};
              child._propertyName = k;
              obj2[k] = genExample(child);
            }
          }
          return obj2;
        default:
          return {};
      }
    };
    for (const p of Object.keys(paths)) {
      const methods = paths[p] as any;
      for (const m of Object.keys(methods)) {
        // skip vendor extensions
        if (m.startsWith("x-")) continue;
        const op = methods[m] as any;
        const methodUpper = m.toUpperCase();
        const url = `${baseUrl}${p}`;

        const hasJsonBody = !!(
          op.requestBody &&
          op.requestBody.content &&
          op.requestBody.content["application/json"] &&
          op.requestBody.content["application/json"].schema
        );

        let exampleBody = "";
        if (hasJsonBody) {
          const media = op.requestBody.content["application/json"];
          let schema = media.schema;
          // if schema is a $ref, resolve it so we generate a full example
          if (schema && schema.$ref) {
            const resolved = resolveRef(schema.$ref);
            if (resolved) schema = resolved;
          }

          // tag property names to help genExample infer nicer values
          if (schema && schema.properties) {
            for (const k of Object.keys(schema.properties)) {
              schema.properties[k] = schema.properties[k] || {};
              schema.properties[k]._propertyName = k;
            }
          }

          const ex = genExample(schema);

          // attach example to the operation and to the component schema (if referenced)
          try {
            exampleBody = JSON.stringify(ex, null, 2);
            // set requestBody example so Swagger UI shows fields instead of just {}
            media.example = ex;
            // also add as named examples
            media.examples = media.examples || { default: { value: ex } };

            // if original schema was a $ref, set the component schema example too
            const origSchema =
              op.requestBody.content["application/json"].schema;
            if (origSchema && origSchema.$ref) {
              const parts = origSchema.$ref.split("/");
              const name = parts[parts.length - 1];
              if (
                compSchemas[name] &&
                compSchemas[name].example === undefined
              ) {
                compSchemas[name].example = ex;
              }
            }
          } catch (e) {
            exampleBody = "{}";
          }
        }

        const fetchSample = hasJsonBody
          ? `fetch("${url}", {\n  method: "${methodUpper}",\n  headers: {\n    'Authorization': 'Bearer <token>',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify(${exampleBody.replace(
              /\n/g,
              "\\n",
            )})\n}).then(r => r.json()).then(console.log)`
          : `fetch("${url}", { method: "${methodUpper}", headers: { 'Authorization': 'Bearer <token>' } }).then(r => r.json()).then(console.log)`;
        const samples = [{ lang: "fetch", source: fetchSample }];

        // Add both common vendor-extension names for broader Swagger UI compatibility
        op["x-codeSamples"] = op["x-codeSamples"] || samples;
        op["x-code-samples"] = op["x-code-samples"] || samples;
      }
    }
  } catch (e) {
    // non-fatal
    // eslint-disable-next-line no-console
    console.warn(
      "Failed to add code samples to OpenAPI document:",
      e?.message || e,
    );
  }

  // Persist OpenAPI YAML to docs.yaml so it can be used elsewhere (CI, static hosting, etc.)
  try {
    const out = yaml.dump(document as any);
    fs.writeFileSync(path.join(process.cwd(), "docs.yaml"), out, "utf8");
  } catch (err) {
    // ignore write errors in environments where filesystem may be read-only
    // eslint-disable-next-line no-console
    console.warn("Could not write docs.yaml:", err?.message || err);
  }

  SwaggerModule.setup("/api-docs", app, document);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new MongoExceptionFilter());
  app.useGlobalInterceptors(new I18nInterceptor());

  await app.listen(process.env.PORT || 7733);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
