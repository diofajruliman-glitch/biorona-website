"use client";

export default function ErrorPage({reset}:{error:Error;reset:()=>void}){return <main className="container productPage"><div className="emptyState" role="alert"><strong>Katalog sedang sulit dimuat.</strong><p>Silakan coba kembali sebentar lagi atau hubungi Biorona melalui WhatsApp.</p><button className="primaryButton" type="button" onClick={reset}>Coba lagi</button></div></main>}
