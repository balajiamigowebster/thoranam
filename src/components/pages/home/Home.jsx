import HomeHero from "./HomeHero";
import HomeBestToday from "./HomeBestToday";
import HomeCategory from "./HomeCategory";
import HomeShop from "./HomeShop";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* 1. Hero Slideshow */}
      <HomeHero />

      {/* 2. Best of the Bunch Handpicked Cards */}
      <HomeBestToday />

      {/* 3. Browse Our Categories */}
      <HomeCategory />

      {/* 4. Shop Our Bestsellers */}
      <HomeShop />
    </div>
  );
}
