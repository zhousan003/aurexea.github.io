import Link from "next/link";

export function Brand({ href = "/zh", label = "曜汇EA首页" }: { href?: string; label?: string }) {
  return (
    <Link className="brand" href={href} aria-label={label}>
      <span className="brand-mark" aria-hidden="true">
        <span />
      </span>
      <span>
        <strong>AurexEA</strong>
        <small>曜汇EA</small>
      </span>
    </Link>
  );
}
