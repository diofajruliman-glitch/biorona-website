import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/data/site";

export default function Logo() {
  return (
    <Link href="/" className="brand" aria-label={`${siteConfig.brand} - Beranda`}>
      <Image src="/brand/biorona-logo.png" width={150} height={54} alt={siteConfig.brand} />
    </Link>
  );
}
