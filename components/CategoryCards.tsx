import Link from "next/link";

export type CategoryCard = {
  title: string;
  href: string;
  description: string;
};

export default function CategoryCards({
  categories,
  label = "Layanan florist Biorona",
}: {
  categories: readonly CategoryCard[];
  label?: string;
}) {
  return (
    <div className="localServiceGrid" aria-label={label}>
      {categories.map((category) => (
        <article className="localServiceCard" key={category.href}>
          <h3><Link href={category.href}>{category.title}</Link></h3>
          <p>{category.description}</p>
        </article>
      ))}
    </div>
  );
}
