import Link from "next/link";
export default function NotFound(){return <main className="container productPage"><div className="emptyState"><strong>Produk tidak ditemukan.</strong><p>Produk mungkin sudah dihapus, dinonaktifkan, atau alamatnya tidak valid.</p><Link className="primaryButton" href="/#katalog">Kembali ke katalog</Link></div></main>}
