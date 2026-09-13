import { siteConfig } from "@/data/site";
import { ArrowIcon, SparkleIcon } from "./Icons";

function instagramHandle(url: string) {
  try {
    return `@${new URL(url).pathname.replace(/^\/+|\/+$/g, "")}`;
  } catch {
    return siteConfig.brand;
  }
}

export default function InstagramSection() {
  if (!siteConfig.instagram) return null;
  return (
    <section className="section instagramSection" aria-labelledby="instagram-title">
      <div className="container">
        <div className="instagramPanel glassSurface">
          <div>
            <span className="kicker"><SparkleIcon size={16}/> {instagramHandle(siteConfig.instagram)}</span>
            <h2 id="instagram-title">Ikuti Biorona di Instagram</h2>
            <p>Lihat rangkaian terbaru, inspirasi bouquet, custom order, dan karya Biorona.</p>
          </div>
          <a className="secondaryGlassButton" href={siteConfig.instagram} target="_blank" rel="noreferrer">Lihat Instagram Biorona <ArrowIcon size={18}/></a>
        </div>
      </div>
    </section>
  );
}
