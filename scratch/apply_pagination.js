const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'dashboard', 'DashboardProducts.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add pagination calculations
const target1 = `  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === "all" ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory.toLowerCase().startsWith("fancy") && p.category?.toLowerCase().startsWith("fancy"));
    return matchesSearch && matchesCat;
  });`;

const replacement1 = `  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === "all" ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory.toLowerCase().startsWith("fancy") && p.category?.toLowerCase().startsWith("fancy"));
    return matchesSearch && matchesCat;
  });

  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalProducts);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);`;

// Normalize CRLF to LF for matching
content = content.replace(/\r\n/g, '\n');
const normalizedTarget1 = target1.replace(/\r\n/g, '\n');
const normalizedReplacement1 = replacement1.replace(/\r\n/g, '\n');

if (!content.includes(normalizedTarget1)) {
  console.error("Target 1 not found!");
  process.exit(1);
}
content = content.replace(normalizedTarget1, normalizedReplacement1);

// 2. Update search & category onChange to reset currentPage to 1
const targetSearch = `onChange={(e) => setSearchTerm(e.target.value)}`;
const replacementSearch = `onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}`;
content = content.replace(targetSearch, replacementSearch);

const targetCat = `onChange={(e) => setSelectedCategory(e.target.value)}`;
const replacementCat = `onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}`;
content = content.replace(targetCat, replacementCat);

// 3. Add Pagination UI before the closing tag of the main table card
const targetTableEnd = `          </table>
        </div>
      </div>

      {/* Quick Detail Viewer Slide-over / Card */}`;

const paginationUI = `          </table>
        </div>

        {/* Bottom Pagination Bar: 15 items per page with <<, <, numbers, >, >> */}
        {totalProducts > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="text-slate-500 font-medium">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {startIndex + 1}–{endIndex}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {totalProducts}
              </span>{" "}
              products
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 select-none">
                {/* First Page (<<) */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="First Page (<<)"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous Page (<) */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Previous Page (<)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers in center */}
                <div className="flex items-center gap-1">
                  {getPaginationPages(safeCurrentPage, totalPages).map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span
                          key={\`ellipsis-\${idx}\`}
                          className="px-2 py-1 text-slate-400 select-none font-semibold"
                        >
                          ...
                        </span>
                      );
                    }
                    const isCurrent = p === safeCurrentPage;
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={\`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition-all \${
                          isCurrent
                            ? "bg-[#800F17] text-white shadow-xs font-bold"
                            : "border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        }\`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                {/* Next Page (>) */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Next Page (>)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page (>>) */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Last Page (>>)"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Detail Viewer Slide-over / Card */}`;

const normalizedTargetTableEnd = targetTableEnd.replace(/\r\n/g, '\n');
const normalizedPaginationUI = paginationUI.replace(/\r\n/g, '\n');

if (!content.includes(normalizedTargetTableEnd)) {
  console.error("Target Table End not found!");
  process.exit(1);
}
content = content.replace(normalizedTargetTableEnd, normalizedPaginationUI);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully applied pagination to DashboardProducts.jsx!");

