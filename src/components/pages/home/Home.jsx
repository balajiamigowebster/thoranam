import HomeHero from "./HomeHero";
import HomeBestToday from "./HomeBestToday";
import HomeCategory from "./HomeCategory";
import HomeCategoryProducts from "./HomeCategoryProducts";
import HomeShop from "./HomeShop";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* 1. Hero Slideshow */}
      <HomeHero />

      {/* 2. Best of the Bunch Handpicked Cards */}
      <HomeBestToday />

      {/* 3. Browse Our Categories (Circle icons) */}
      <HomeCategory />

      {/* 4. Category Showcase (Each category one by one with 3-4 products and View More button) */}
      <HomeCategoryProducts />

      {/* 5. Shop Our Bestsellers */}
      <HomeShop />
    </div>
  );
}
