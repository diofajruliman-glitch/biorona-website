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
        <div className="livingFlowerStage">
          <span className="livingFlowerPetal livingFlowerPetalOne" />
          <span className="livingFlowerPetal livingFlowerPetalTwo" />
          <span className="livingFlowerPetal livingFlowerPetalThree" />
          <span className="livingFlowerPetal livingFlowerPetalFour" />
          <span className="livingFlowerPetal livingFlowerPetalFive" />
          <span className="livingFlowerPetal livingFlowerPetalSix" />
          <span className="livingFlowerCore" />
          <span className="livingFlowerHighlight" />
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
