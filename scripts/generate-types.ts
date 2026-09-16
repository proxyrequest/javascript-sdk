import { writeFile } from "node:fs/promises";
import openapiTS, { astToString } from "openapi-typescript";
import ts from "typescript";
import { loadSdkSchema } from "./sdk-schema.js";

const ast = await openapiTS(await loadSdkSchema(), {
  alphabetize: true,
  transformProperty(property, _schema, { path }) {
    if (path === "#/components/schemas/InvoiceCreateRequestRequest/status") {
      return ts.factory.updatePropertySignature(
        property,
        property.modifiers,
        property.name,
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        property.type,
      );
    }
    return undefined;
  },
  transform(schema, { path }) {
    if (
      schema.enum &&
      /gateway/iu.test(path ?? "") &&
      schema.enum.every((value) => typeof value === "string")
    ) {
      return ts.factory.createUnionTypeNode([
        ...schema.enum.map((value) =>
          ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(String(value))),
        ),
        ts.factory.createIntersectionTypeNode([
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
          ts.factory.createTypeLiteralNode([]),
        ]),
      ]);
    }
    return undefined;
  },
});
await writeFile(new URL("../src/generated/schema.ts", import.meta.url), astToString(ast));
