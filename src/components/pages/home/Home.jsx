import HomeHero from "./HomeHero";
import HomeBestToday from "./HomeBestToday";
import HomeCategory from "./HomeCategory";
import HomeShop from "./HomeShop";
import HomeCategoryProducts from "./HomeCategoryProducts";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* 1. Hero Slideshow */}
      <HomeHero />

      {/* 2. Best of the Bunch Handpicked Cards */}
      <HomeBestToday />

      {/* 3. Browse Our Categories (Circle icons) */}
      <HomeCategory />

      {/* 4. Shop Our Bestsellers (Moved right after Browse Our Categories) */}
      <HomeShop />

      {/* 5. Category Showcase: all 17 menu categories one by one */}
      <HomeCategoryProducts />
    </div>
  );
}
