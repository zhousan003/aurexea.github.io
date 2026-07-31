"use client";

import { useRef, useState } from "react";

type UploadKind = "product-image" | "ea-file" | "donation-qr";

type UploadState = {
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

function UploadBox({
  kind,
  fieldName,
  title,
  defaultUrl,
}: {
  kind: UploadKind;
  fieldName: string;
  title?: string;
  defaultUrl?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<UploadState>(
    defaultUrl ? { status: "done", url: defaultUrl, message: "已保存文件" } : { status: "idle" },
  );
  const copy = uploadCopy[kind];

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUpload({ status: "uploading", fileName: file.name, message: "正在上传..." });

    const formData = new FormData();
    formData.append("kind", kind);
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { ok?: boolean; url?: string; fileName?: string; message?: string };

      if (!response.ok || !result.ok || !result.url) {
        throw new Error(result.message || "上传失败，请稍后重试。");
      }

      setUpload({
        status: "done",
        fileName: result.fileName || file.name,
        url: result.url,
        message: "上传成功",
      });
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
      {upload.url ? (
        <a className="upload-result-link" href={upload.url} target="_blank" rel="noreferrer">
          查看已上传文件
        </a>
      ) : null}
      {upload.url ? <input type="hidden" name={fieldName} value={upload.url} /> : null}
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
    defaultUrls.map((url) => ({ status: "done", url, fileName: fileNameFromUrl(url), message: "已保存图片" })),
  );

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    const pendingUploads: UploadState[] = files.map((file) => ({
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
          const result = (await response.json()) as { ok?: boolean; url?: string; fileName?: string; message?: string };

          if (!response.ok || !result.ok || !result.url) {
            throw new Error(result.message || "上传失败，请稍后重试。");
          }

          return {
            status: "done" as const,
            fileName: result.fileName || file.name,
            url: result.url,
            message: "上传成功",
          };
        } catch (error) {
          return {
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

  const urls = uploads.flatMap((upload) => (upload.url ? [upload.url] : []));

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
          {uploads.map((upload, index) => (
            <span key={`${upload.fileName}-${index}`} className={upload.status}>
              {upload.fileName || upload.message}
            </span>
          ))}
        </div>
      ) : null}
      <input type="hidden" name={fieldName} value={urls.join("\n")} />
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
      <UploadBox kind="ea-file" fieldName="fileUrl" defaultUrl={fileUrl} />
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
