import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { Document, Page, Text, pdf } from "@react-pdf/renderer";

test("renderer PDF minimal menghasilkan blob", async () => {
  const blob = await pdf(createElement(Document, null, createElement(Page, { size: "A4" }, createElement(Text, null, "PDF runtime check")))).toBlob();
  assert.equal(blob.type, "application/pdf");
  assert.ok(blob.size > 0);
});

