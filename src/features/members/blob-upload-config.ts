type BlobUploadEnv = Record<string, string | undefined>;

export const canUploadWithVercelBlob = (env: BlobUploadEnv) =>
  Boolean(env.BLOB_READ_WRITE_TOKEN) ||
  Boolean(env.BLOB_STORE_ID && env.VERCEL_OIDC_TOKEN);
