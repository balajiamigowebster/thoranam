const fs = require('fs');

const file = 'src/components/pages/products/ProductDetailView.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldSection = `        {/* ================= MAIN PRODUCT ROW ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-start">
          {/* LEFT COLUMN: Main Image & Gallery Downward (Sticky on Desktop until content end) */}
          <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-[144px] lg:self-start space-y-3.5">
            {/* Big Main Image Container - Proportionately sized so thumbnails are visible in initial view */}
            <div
              onClick={() => openZoomModal(selectedImage || product.mainImage)}
              className="relative aspect-[4/5] sm:aspect-[3/4] max-h-[460px] sm:max-h-[480px] w-full max-w-[430px] mx-auto lg:mx-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-100 border border-slate-200/80 shadow-xs group cursor-zoom-in"
              title="Click to view full image and zoom"
            >
              <img
                src={getAssetUrl(selectedImage || product.mainImage || "/images/product-1.jpg")}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-102"
                onError={(e) => {
                  const currentSrc = e.currentTarget.getAttribute("src") || "";
                  if (currentSrc.startsWith("/uploads/") && !e.currentTarget.dataset.retried) {
                    e.currentTarget.dataset.retried = "true";
                    e.currentTarget.src = \`https://amigowebster.in/thoranam\${currentSrc}\`;
                    return;
                  }
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/product-1.jpg";
                }}
              />
              <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full bg-white/90 text-[#800F17] shadow-xs backdrop-blur-xs">
                  {product.category || "Exclusive Saree"}
                </span>
              </div>
              {isSoldOut && (
                <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-md bg-stone-800/90 text-white shadow-xs backdrop-blur-xs">
                    SOLD OUT
                  </span>
                </div>
              )}

              {/* Click to Zoom Pill Indicator */}
              <div className="absolute bottom-3.5 right-3.5 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openZoomModal(selectedImage || product.mainImage);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white text-[11px] sm:text-xs font-medium backdrop-blur-md shadow-md transition-all group-hover:scale-105 cursor-pointer"
                >
                  <ZoomIn className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  <span>Click to zoom</span>
                </button>
              </div>
            </div>

            {/* Down Gallery Thumbnails - Positioned directly below the compact image */}
            {allImages.length > 1 && (
              <div className="space-y-1.5 pt-0.5 max-w-[430px] mx-auto lg:mx-0">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Saree Gallery Views ({allImages.length})
                </p>
                <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={\`relative w-16 sm:w-18 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-stone-100 cursor-pointer \${
                        selectedImage === img
                          ? "border-[#800F17] ring-2 ring-[#800F17]/30 scale-102"
                          : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                      }\`}
                    >
                      <img
                        src={getAssetUrl(img)}
                        alt={\`Thumbnail \${idx + 1}\`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const currentSrc = e.currentTarget.getAttribute("src") || "";
                          if (currentSrc.startsWith("/uploads/") && !e.currentTarget.dataset.retried) {
                            e.currentTarget.dataset.retried = "true";
                            e.currentTarget.src = \`https://amigowebster.in/thoranam\${currentSrc}\`;
                            return;
                          }
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/product-2.jpg";
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Title, Pricing, Actions, Highlights & Specs */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">`;

const newSection = `        {/* ================= MAIN PRODUCT ROW ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-start">
          {/* LEFT COLUMN: Gallery Thumbnails on Left + Main Image on Right (Sticky on Desktop) */}
          <div className="lg:col-span-6 xl:col-span-6 lg:sticky lg:top-[144px] lg:self-start">
            <div className="flex flex-col-reverse sm:flex-row gap-3.5 sm:gap-4 items-start justify-start">
              {/* Left Side: Vertical Gallery Thumbnails (Matching Kalamandir Reference) */}
              {allImages.length > 1 && (
                <div className="w-full sm:w-auto shrink-0">
                  <div className="flex sm:flex-col gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-y-auto max-h-none sm:max-h-[480px] pb-1 sm:pb-0 no-scrollbar pr-1">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        aria-label={\`View photo \${idx + 1}\`}
                        className={\`relative w-16 sm:w-18 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-stone-100 cursor-pointer \${
                          selectedImage === img
                            ? "border-[#800F17] ring-2 ring-[#800F17]/30 scale-102"
                            : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                        }\`}
                      >
                        <img
                          src={getAssetUrl(img)}
                          alt={\`Thumbnail \${idx + 1}\`}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            const currentSrc = e.currentTarget.getAttribute("src") || "";
                            if (currentSrc.startsWith("/uploads/") && !e.currentTarget.dataset.retried) {
                              e.currentTarget.dataset.retried = "true";
                              e.currentTarget.src = \`https://amigowebster.in/thoranam\${currentSrc}\`;
                              return;
                            }
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/product-2.jpg";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Right of Thumbnails: Main Image Container - Size strictly preserved */}
              <div
                onClick={() => openZoomModal(selectedImage || product.mainImage)}
                className="relative aspect-[4/5] sm:aspect-[3/4] max-h-[460px] sm:max-h-[480px] w-full max-w-[430px] rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-100 border border-slate-200/80 shadow-xs group cursor-zoom-in shrink-0"
                title="Click to view full image and zoom"
              >
                <img
                  src={getAssetUrl(selectedImage || product.mainImage || "/images/product-1.jpg")}
                  alt={product.title}
                  className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-102"
                  onError={(e) => {
                    const currentSrc = e.currentTarget.getAttribute("src") || "";
                    if (currentSrc.startsWith("/uploads/") && !e.currentTarget.dataset.retried) {
                      e.currentTarget.dataset.retried = "true";
                      e.currentTarget.src = \`https://amigowebster.in/thoranam\${currentSrc}\`;
                      return;
                    }
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/product-1.jpg";
                  }}
                />
                <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full bg-white/90 text-[#800F17] shadow-xs backdrop-blur-xs">
                    {product.category || "Exclusive Saree"}
                  </span>
                </div>
                {isSoldOut && (
                  <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none">
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-md bg-stone-800/90 text-white shadow-xs backdrop-blur-xs">
                      SOLD OUT
                    </span>
                  </div>
                )}

                {/* Click to Zoom Pill Indicator */}
                <div className="absolute bottom-3.5 right-3.5 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openZoomModal(selectedImage || product.mainImage);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white text-[11px] sm:text-xs font-medium backdrop-blur-md shadow-md transition-all group-hover:scale-105 cursor-pointer"
                  >
                    <ZoomIn className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    <span>Click to zoom</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Content moved slightly towards right side */}
          <div className="lg:col-span-6 xl:col-span-6 lg:pl-6 xl:pl-10 space-y-6">`;

const normalize = (s) => s.replace(/\r\n/g, '\n');
if (normalize(content).includes(normalize(oldSection))) {
  const isCrlf = content.includes('\r\n');
  content = normalize(content).replace(normalize(oldSection), normalize(newSection));
  if (isCrlf) content = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(file, content, 'utf8');
  console.log('Layout updated successfully');
} else {
  console.log('oldSection not found');
}

