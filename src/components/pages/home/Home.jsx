import HomeHero from "./HomeHero";
import HomeBestToday from "./HomeBestToday";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* 1. Hero Slideshow matching boutique design */}
      <HomeHero />

      {/* 2. Best of the Bunch Handpicked Cards */}
      <HomeBestToday />

    </div>
  );
}
