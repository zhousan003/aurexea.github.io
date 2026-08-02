"use client";

import { useRef, useState } from "react";
import { put } from "@vercel/blob/client";

type UploadKind = "product-image" | "ea-file" | "donation-qr";

type UploadState = {
  id?: string;
  status: "idle" | "uploading" | "done" | "error";
  fileName?: string;
  url?: string;
  message?: string;
};

const uploadCopy: Record<UploadKind, { title: string; hint: string; accept: string }> = {
  "product-image": {
    title: "产品图片上传",
    hint: "点击选择 JPG / PNG / WebP 图片",
    accept: "image/jpeg,image/png,image/webp",
  },
  "ea-file": {
    title: "EA 文件上传",
    hint: "点击选择 .ex4 / .ex5 / .mq4 / .mq5 / .zip 文件",
    accept: ".ex4,.ex5,.mq4,.mq5,.zip",
  },
  "donation-qr": {
    title: "二维码上传",
    hint: "点击选择 USDT 收款二维码图片",
    accept: "image/jpeg,image/png,image/webp",
  },
};

function fileNameFromUrl(url: string) {
  return url.split("/").pop() || "已配置文件";
}

async function readUploadResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return { ok: response.ok, message: response.ok ? "" : "上传接口没有返回错误详情。" };
  }

  try {
    return JSON.parse(text) as { ok?: boolean; url?: string; fileName?: string; message?: string };
  } catch {
    return {
      ok: false,
      message: text.slice(0, 160) || "上传接口返回格式不正确。",
    };
  }
}

async function uploadLargeEafile(file: File) {
  const response = await fetch("/api/upload-large", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pathname: file.name,
      multipart: file.size > 5 * 1024 * 1024,
    }),
  });
  const result = await response.json().catch(() => null) as null | { token?: string; message?: string };

  if (!response.ok || !result?.token) {
    throw new Error(result?.message || "上传失败，请稍后重试。");
  }

  const blob = await put(file.name, file, {
    access: "public",
    multipart: true,
    token: result.token,
  });

  if (!blob?.url) {
    throw new Error(result.message || "上传失败，请稍后重试。");
  }

  return blob.url;
}

function UploadBox({
  kind,
  fieldName,
  fileNameFieldName,
  title,
  defaultUrl,
}: {
  kind: UploadKind;
  fieldName: string;
  fileNameFieldName?: string;
  title?: string;
  defaultUrl?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<UploadState>(
    defaultUrl ? { status: "done", url: defaultUrl, message: "已保存文件" } : { status: "idle" },
  );
  const [selectedUrl, setSelectedUrl] = useState(defaultUrl || "");
  const [selectedFileName, setSelectedFileName] = useState(defaultUrl ? fileNameFromUrl(defaultUrl) : "");
  const copy = uploadCopy[kind];

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUpload({ status: "uploading", fileName: file.name, message: "正在上传..." });

    try {
      if (kind === "ea-file") {
        const url = await uploadLargeEafile(file);
        if (!url) {
          throw new Error("上传失败，请稍后重试。");
        }
        setUpload({
          status: "done",
          fileName: file.name,
          url,
          message: "上传成功",
        });
        setSelectedUrl(url);
        setSelectedFileName(file.name);
      } else {
        const formData = new FormData();
        formData.append("kind", kind);
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const result = await readUploadResponse(response);

        if (!response.ok || !result.ok || !result.url) {
          throw new Error(result.message || "上传失败，请稍后重试。");
        }

        setUpload({
          status: "done",
          fileName: result.fileName || file.name,
          url: result.url,
          message: "上传成功",
        });
        setSelectedUrl(result.url || "");
        setSelectedFileName(result.fileName || file.name);
      }
    } catch (error) {
      setUpload({
        status: "error",
        fileName: file.name,
        message: error instanceof Error ? error.message : "上传失败，请稍后重试。",
      });
    } finally {
      event.target.value = "";
    }
  }

  return (
    <label className="upload-field">
      {title || copy.title}
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept={copy.accept}
        onChange={handleFileChange}
      />
      <button className={`upload-box upload-box-button ${upload.status}`} type="button" onClick={() => inputRef.current?.click()}>
        <span>{upload.fileName || (upload.url ? "已配置文件地址" : copy.hint)}</span>
        <small>{upload.message || "上传后会自动生成文件地址"}</small>
      </button>
      {selectedUrl ? (
        <a className="upload-result-link" href={selectedUrl} target="_blank" rel="noreferrer">
          查看已上传文件
        </a>
      ) : null}
      <input type="hidden" name={fieldName} value={selectedUrl} />
      {fileNameFieldName ? <input type="hidden" name={fileNameFieldName} value={selectedFileName} /> : null}
      {selectedUrl ? (
        <button
          className="upload-clear-button"
          type="button"
          onClick={() => {
            setSelectedUrl("");
            setSelectedFileName("");
            setUpload({ status: "idle", message: "已清空，保存后将移除旧文件" });
          }}
        >
          清空当前文件
        </button>
      ) : null}
    </label>
  );
}

function MultiUploadBox({
  fieldName,
  defaultUrls = [],
}: {
  fieldName: string;
  defaultUrls?: string[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadState[]>(
    defaultUrls.map((url, index) => ({
      id: `${url}-${index}`,
      status: "done",
      url,
      fileName: fileNameFromUrl(url),
      message: "已保存图片",
    })),
  );

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    const pendingUploads: UploadState[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: "uploading",
      fileName: file.name,
      message: "正在上传...",
    }));
    setUploads((current) => [...current, ...pendingUploads]);

    const results = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append("kind", "product-image");
        formData.append("file", file);

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const result = await readUploadResponse(response);

          if (!response.ok || !result.ok || !result.url) {
            throw new Error(result.message || "上传失败，请稍后重试。");
          }

          return {
            id: `${result.url}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            status: "done" as const,
            fileName: result.fileName || file.name,
            url: result.url,
            message: "上传成功",
          };
        } catch (error) {
          return {
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            status: "error" as const,
            fileName: file.name,
            message: error instanceof Error ? error.message : "上传失败，请稍后重试。",
          };
        }
      }),
    );

    setUploads((current) => {
      const kept = current.filter((item) => item.status !== "uploading");
      return [...kept, ...results];
    });
    event.target.value = "";
  }

  const hiddenValue = uploads.filter((upload) => upload.url).map((upload) => upload.url as string).join("\n");

  return (
    <label className="upload-field">
      详情测试报告图片
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
      />
      <button className="upload-box upload-box-button" type="button" onClick={() => inputRef.current?.click()}>
        <span>{uploads.length ? `已选择 ${uploads.length} 张图片` : "点击选择多张测试报告图片"}</span>
        <small>支持 JPG / PNG / WebP，详情页按固定比例展示</small>
      </button>
      {uploads.length ? (
        <div className="upload-chip-list">
          {uploads.map((upload) => (
            <span key={upload.id || upload.url || upload.fileName} className={upload.status}>
              {upload.fileName || upload.message}
              {upload.url ? (
                <button
                  type="button"
                  className="upload-chip-remove"
                  onClick={() => {
                    setUploads((current) => current.filter((item) => item.id !== upload.id));
                  }}
                >
                  删除
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}
      <input type="hidden" name={fieldName} value={hiddenValue} />
    </label>
  );
}

export function ProductUploadFields({
  thumbnailUrl,
  reportImages,
  fileUrl,
}: {
  thumbnailUrl?: string | null;
  reportImages?: string[];
  fileUrl?: string | null;
}) {
  return (
    <>
      <UploadBox kind="product-image" fieldName="thumbnailUrl" title="首页产品小图上传" defaultUrl={thumbnailUrl} />
      <MultiUploadBox fieldName="reportImageUrls" defaultUrls={reportImages} />
      <UploadBox kind="ea-file" fieldName="fileUrl" fileNameFieldName="fileName" defaultUrl={fileUrl} />
    </>
  );
}

export function DonationQrUploadFields({
  qr1ImageUrl,
  qr2ImageUrl,
}: {
  qr1ImageUrl?: string | null;
  qr2ImageUrl?: string | null;
}) {
  return (
    <>
      <UploadBox kind="donation-qr" fieldName="qr1ImageUrl" title="二维码一上传" defaultUrl={qr1ImageUrl} />
      <UploadBox kind="donation-qr" fieldName="qr2ImageUrl" title="二维码二上传" defaultUrl={qr2ImageUrl} />
    </>
  );
}
