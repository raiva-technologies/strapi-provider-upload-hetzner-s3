import {
  DeleteObjectCommand,
  type PutObjectCommandInput,
  S3Client,
  type ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";

/**
 * Hetzner Object Storage Locations
 * FSN1: Falkenstein, Germany (eu-central-1)
 * NBG1: Nuremberg, Germany (eu-central-2) 
 * HEL1: Helsinki, Finland (eu-central-3)
 */
type HetznerRegion = "fsn1" | "nbg1" | "hel1";

interface Config {
  accessKeyId: string;
  secretAccessKey: string;
  /**
   * Hetzner region: fsn1 (Falkenstein), nbg1 (Nuremberg), or hel1 (Helsinki)
   */
  region: HetznerRegion;
  /**
   * Optional path prefix within the bucket
   */
  prefix?: string;
  /**
   * Optional custom base URL (e.g., for CDN)
   */
  baseUrl?: string;
  params: Partial<{
    Bucket: string;
    bucket: string;
    ACL: ObjectCannedACL;
    acl: ObjectCannedACL;
  }> &
    Record<string, unknown>;
  /**
   * Allows passing in an instantiated S3 client. Useful for unit testing
   */
  client?: any;
}

export interface File {
  stream?: Readable;
  buffer?: any;
  mime?: string;
  ext?: string;
  /** hash contains the entire filename, except for the extension */
  hash?: string;
  /** path seems to almost be empty */
  path?: string;
  /** the S3 object URL */
  url?: string;
}

/**
 * Maps Hetzner region codes to their S3-compatible endpoints
 * @param region Hetzner region code (fsn1, nbg1, hel1)
 * @returns S3 endpoint URL for the region
 */
function getHetznerEndpoint(region: HetznerRegion): string {
  const endpoints: Record<HetznerRegion, string> = {
    fsn1: "https://fsn1.your-objectstorage.com",
    nbg1: "https://nbg1.your-objectstorage.com",
    hel1: "https://hel1.your-objectstorage.com",
  };
  return endpoints[region];
}

/**
 * Removes leading and trailing slashes from a path prefix and returns either no prefix ("")
 * or a prefix without a leading but with a trailing slash
 * @param prefix bucket prefix to use for putting objects into S3's folder abstraction
 * @returns normalized prefix string
 */
function normalizePrefix(prefix: string): string {
  prefix = prefix.trim().replace(/^\/*/, "").replace(/\/*$/, "");
  if (!prefix) {
    return "";
  }
  return prefix + "/";
}

/**
 * Safely joins a list of path segments, similar to how Node's path library's "join" does
 * @param segments path segments
 * @returns single path string joined by forward slashes
 */
function join(...segments: string[]): string {
  let s = "";
  for (let i = 0; i < segments.length - 1; i++) {
    const l = segments[i];
    s += l.endsWith("/") || l == "" ? l : l + "/";
  }
  s += segments[segments.length - 1];
  return s;
}

/**
 * Initialize the Hetzner S3 provider by bootstrapping an S3 client from the config
 * @param config Strapi provider plugin configuration
 * @returns Provider object containing handlers for upload, uploadStream, and delete actions
 */
export function init({
  region,
  accessKeyId,
  secretAccessKey,
  baseUrl,
  client,
  ...config
}: Config & Record<string, unknown>) {
  let S3: S3Client;
  
  if (!client) {
    // Instantiate fresh S3 client for Hetzner Object Storage
    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        "Hetzner S3 provider requires accessKeyId and secretAccessKey"
      );
    }

    const endpoint = getHetznerEndpoint(region);

    S3 = new S3Client({
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      endpoint: endpoint,
      region: region, // Hetzner uses region codes but they're not AWS regions
      forcePathStyle: false, // Hetzner supports virtual-hosted-style requests
      ...config,
    });
  } else {
    S3 = client;
  }

  const prefix = config.prefix ? normalizePrefix(config.prefix) : "";
  const bucket = config.params.Bucket || config.params.bucket;
  
  if (!bucket) {
    throw new Error("Bucket name is required in params configuration");
  }

  const acl = (() => {
    if (config.params.ACL) {
      return { ACL: config.params.ACL };
    }
    if (config.params.acl) {
      return { ACL: config.params.acl };
    }
    return {};
  })();

  /**
   * Uploads a buffered or streamed file to Hetzner S3 using the configured client
   * @param file File object from strapi controller
   * @param customParams action parameters, overridable from config
   */
  const upload = async (
    file: File,
    customParams: Record<string, unknown> = {}
  ) => {
    const path = file.path ?? "";
    const filename = `${file.hash}${file.ext}`;
    const objectPath = join(prefix, path, filename);

    const uploadParams: PutObjectCommandInput = {
      Bucket: bucket,
      Key: objectPath,
      Body: file.stream || Buffer.from(file.buffer, "binary"),
      ContentType: file.mime,
      ...acl,
      ...customParams,
    };

    try {
      const uploadPromise = new Upload({
        client: S3,
        params: uploadParams,
      });
      await uploadPromise.done();

      if (baseUrl === undefined) {
        // Assemble Hetzner Object Storage endpoint URL
        const endpoint = getHetznerEndpoint(region);
        const hostname = endpoint.replace("https://", "");
        file.url = `https://${bucket}.${hostname}/${objectPath}`;
      } else {
        file.url = join(baseUrl ?? "", objectPath);
      }
    } catch (err) {
      console.error("Error uploading object to Hetzner S3 bucket %s", objectPath, err);
      throw err;
    }
  };

  return {
    /**
     * Upload a file using a stream
     */
    uploadStream(file: File, customParams: Record<string, unknown> = {}) {
      return upload(file, customParams);
    },
    /**
     * Upload a file using a buffer
     */
    upload(file: File, customParams: Record<string, unknown> = {}) {
      return upload(file, customParams);
    },
    /**
     * Deletes an object from the configured Hetzner S3 bucket
     * @param file File object from strapi controller
     * @param customParams action parameters, overridable from config
     */
    async delete(file: File, customParams: Record<string, unknown> = {}) {
      const path = file.path ?? "";
      const filename = `${file.hash}${file.ext}`;
      const objectPath = join(prefix, path, filename);

      try {
        await S3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: objectPath,
            ...customParams,
          })
        );
      } catch (err) {
        console.error("Error deleting object from Hetzner S3 bucket %s", objectPath, err);
        throw err;
      }
    },
  };
}