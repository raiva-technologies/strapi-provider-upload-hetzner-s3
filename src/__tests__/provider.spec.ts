import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import { Readable } from "stream";
import { init, type File } from "../src/index";

const client = new S3Client({
  region: "fsn1",
  endpoint: "https://fsn1.your-objectstorage.com",
});

const s3ClientMock = mockClient(client);

describe("hetzner-s3 provider", () => {
  const providerInstance = init({
    params: {
      Bucket: "test-bucket",
    },
    region: "fsn1",
    accessKeyId: "test-access-key",
    secretAccessKey: "test-secret-key",
    client: client,
  });

  beforeEach(() => {
    s3ClientMock.reset();
  });

  it("should upload a buffer to Hetzner S3", async () => {
    s3ClientMock.on(PutObjectCommand).resolves({});

    const buffer = Buffer.from("Test Text from Buffer", "utf-8");

    const file: File = {
      buffer: buffer,
      ext: ".txt",
      mime: "text/plain",
      hash: "12345",
      path: "",
    };

    await providerInstance.upload(file);

    expect(file.url).toBeDefined();
    expect(file.url).toContain("fsn1.your-objectstorage.com");
    expect(s3ClientMock).toHaveReceivedCommand(PutObjectCommand);
  });

  it("should upload a readable stream to Hetzner S3", async () => {
    s3ClientMock.on(PutObjectCommand).resolves({});

    const stream = Readable.from("Test Text for Stream usage", {
      encoding: "utf-8",
    });

    const file: File = {
      stream: stream,
      ext: ".txt",
      mime: "text/plain",
      hash: "demo-text-from-stream_12345",
      path: "",
    };

    await providerInstance.upload(file);

    expect(file.url).toBeDefined();
    expect(file.url).toContain("fsn1.your-objectstorage.com");
    expect(s3ClientMock).toHaveReceivedCommand(PutObjectCommand);
  });

  it("should delete an object from Hetzner S3", async () => {
    s3ClientMock.on(DeleteObjectCommand).resolves({});

    const file: File = {
      ext: "txt",
      mime: "text/plain",
      hash: "12345",
      path: "demo-text-from-stream",
    };

    await providerInstance.delete(file);

    expect(s3ClientMock).toHaveReceivedCommand(DeleteObjectCommand);
  });

  it("should handle prefix correctly", async () => {
    s3ClientMock.on(PutObjectCommand).resolves({});

    const providerWithPrefix = init({
      params: {
        Bucket: "test-bucket",
      },
      region: "nbg1",
      accessKeyId: "test-access-key",
      secretAccessKey: "test-secret-key",
      prefix: "uploads/strapi",
      client: client,
    });

    const buffer = Buffer.from("Test with prefix", "utf-8");

    const file: File = {
      buffer: buffer,
      ext: ".txt",
      mime: "text/plain",
      hash: "prefix-test",
      path: "",
    };

    await providerWithPrefix.upload(file);

    expect(file.url).toContain("uploads/strapi/prefix-test.txt");
    expect(s3ClientMock).toHaveReceivedCommand(PutObjectCommand);
  });

  it("should use custom baseUrl when provided", async () => {
    s3ClientMock.on(PutObjectCommand).resolves({});

    const providerWithCDN = init({
      params: {
        Bucket: "test-bucket",
      },
      region: "hel1",
      accessKeyId: "test-access-key",
      secretAccessKey: "test-secret-key",
      baseUrl: "https://cdn.example.com",
      client: client,
    });

    const buffer = Buffer.from("Test with CDN", "utf-8");

    const file: File = {
      buffer: buffer,
      ext: ".jpg",
      mime: "image/jpeg",
      hash: "cdn-test",
      path: "",
    };

    await providerWithCDN.upload(file);

    expect(file.url).toBe("https://cdn.example.com/cdn-test.jpg");
    expect(s3ClientMock).toHaveReceivedCommand(PutObjectCommand);
  });

  it("should throw error when credentials are missing", () => {
    expect(() => {
      init({
        params: {
          Bucket: "test-bucket",
        },
        region: "fsn1",
        accessKeyId: "",
        secretAccessKey: "",
      });
    }).toThrow("Hetzner S3 provider requires accessKeyId and secretAccessKey");
  });

  it("should throw error when bucket is missing", () => {
    expect(() => {
      init({
        params: {},
        region: "fsn1",
        accessKeyId: "test-key",
        secretAccessKey: "test-secret",
      });
    }).toThrow("Bucket name is required in params configuration");
  });
});
