"use client";

import { useState } from "react";

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductIdentityFields({
  defaultTitleEn = "Gold Quant Scalper MT5 + SetFiles",
  defaultSlug = "gold-quant-scalper-mt5",
}: {
  defaultTitleEn?: string;
  defaultSlug?: string;
}) {
  const [slug, setSlug] = useState(defaultSlug);
  const [locked, setLocked] = useState(false);

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!locked) {
      const nextSlug = slugify(event.target.value);
      if (nextSlug) {
        setSlug(nextSlug);
      }
    }
  }

  return (
    <>
      <label>
        产品英文标题
        <input
          name="titleEn"
          type="text"
          defaultValue={defaultTitleEn}
          onChange={handleTitleChange}
          required
        />
      </label>
      <label>
        URL Slug
        <input
          name="slug"
          type="text"
          value={slug}
          onChange={(event) => {
            setLocked(true);
            setSlug(slugify(event.target.value));
          }}
          required
        />
      </label>
    </>
  );
}
