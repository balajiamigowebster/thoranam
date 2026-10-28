import HomeHero from "./HomeHero";
import HomeBestToday from "./HomeBestToday";
import HomeCategory from "./HomeCategory";
import HomeCategoryProducts from "./HomeCategoryProducts";

export default function Home({
  initialProducts = [],
  initialBrowseCategories = [],
  initialAllCategories = [],
  initialSettings = {},
}) {
  return (
    <div className="flex flex-col flex-1">
      {/* 1. Hero Slideshow */}
      <HomeHero initialSlides={initialSettings?.hero_slides} />

      {/* 2. Best of the Bunch Handpicked Cards */}
      <HomeBestToday initialProducts={initialProducts} />

      {/* 3. Browse Our Categories (Circle icons) */}
      <HomeCategory initialCategories={initialBrowseCategories} />

      {/* 4. Shop Our Bestsellers & Category Showcase starting from Collection 01 */}
      <HomeCategoryProducts
        initialProducts={initialProducts}
        initialCategories={initialAllCategories}
      />
    </div>
  );
}
