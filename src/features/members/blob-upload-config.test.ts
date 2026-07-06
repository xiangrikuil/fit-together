import { describe, expect, test } from "vitest";

import { canUploadWithVercelBlob } from "./blob-upload-config";

describe("blob upload config", () => {
  test("allows uploads with a read-write token", () => {
    expect(
      canUploadWithVercelBlob({
        BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_token",
      }),
    ).toBe(true);
  });

  test("allows uploads with Vercel OIDC and a blob store id", () => {
    expect(
      canUploadWithVercelBlob({
        BLOB_STORE_ID: "store_123",
        VERCEL_OIDC_TOKEN: "oidc-token",
      }),
    ).toBe(true);
  });

  test("does not allow uploads with only store metadata", () => {
    expect(
      canUploadWithVercelBlob({
        BLOB_STORE_ID: "store_123",
        BLOB_WEBHOOK_PUBLIC_KEY: "public-key",
      }),
    ).toBe(false);
  });
});
