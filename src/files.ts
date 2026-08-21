export class FileDownload {
  readonly content: Uint8Array;
  readonly filename: string;
  readonly contentType: string;

  constructor(content: Uint8Array, filename: string, contentType: string) {
    this.content = content;
    this.filename = filename;
    this.contentType = contentType;
  }

  static fromResponse(content: ArrayBuffer | Uint8Array, headers: Headers): FileDownload {
    const bytes = content instanceof Uint8Array ? content : new Uint8Array(content);
    const contentType = (headers.get("content-type") ?? "application/octet-stream")
      .split(";", 1)[0]
      ?.trim();
    return new FileDownload(
      bytes,
      filenameFromDisposition(headers.get("content-disposition")),
      contentType || "application/octet-stream",
    );
  }

  arrayBuffer(): ArrayBuffer {
    return this.content.slice().buffer;
  }

  blob(): Blob {
    return new Blob([this.arrayBuffer()], { type: this.contentType });
  }

  text(): string {
    return new TextDecoder().decode(this.content);
  }
}

function filenameFromDisposition(disposition: string | null): string {
  if (disposition === null) return "download.bin";
  const encoded = /filename\*=UTF-8''([^;]+)/iu.exec(disposition)?.[1];
  if (encoded !== undefined) {
    try {
      return safeBasename(decodeURIComponent(encoded.trim()));
    } catch {
      return safeBasename(encoded.trim());
    }
  }
  const plain = /filename=(?:"([^"]+)"|([^;]+))/iu.exec(disposition);
  return safeBasename((plain?.[1] ?? plain?.[2] ?? "download.bin").trim());
}

function safeBasename(filename: string): string {
  const normalized = filename.replaceAll("\\", "/");
  const basename = normalized.split("/").at(-1)?.replaceAll("\0", "").trim();
  return basename || "download.bin";
}
