import Image from "next/image";

export default function LivingBloom() {
  return (
    <div className="livingBloom" aria-hidden="true">
      <div className="livingBloomArt">
        <div className="livingLiquidStage">
          <span className="livingLiquidCore" />
          <span className="livingLiquidSwirl" />
          <span className="livingLiquidRim" />
          <span className="livingLiquidHighlight" />
        </div>
        <div className="livingLogoStage">
          <span className="livingLogoGlass" />
          <span className="livingLogoFlow" />
          <span className="livingLogoShine" />
          <Image className="livingLogoFallback" src="/brand/biorona-logo.png" width={714} height={250} alt="" />
        </div>
      </div>
    </div>
  );
}
