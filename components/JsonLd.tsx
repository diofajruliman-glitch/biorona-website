import { siteConfig } from "@/data/site";
import { floristSchema, serializeJsonLd, websiteSchema } from "@/lib/structured-data";
import { homeFaqs } from "./FAQ";

export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      websiteSchema(),
      floristSchema(),
      {
        "@type": "FAQPage",
        "@id": `${siteConfig.siteUrl}/#faq`,
        mainEntity: homeFaqs.slice(0, 4).map(([name, text]) => ({
          "@type": "Question",
          name,
          acceptedAnswer: { "@type": "Answer", text },
        })),
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
