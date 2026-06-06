# Issue 6: Food search via Open Food Facts API

## What to build

Replace the manual calorie/protein fields in the "Add Food" form with a search-to-fill experience. User types a food name, a Route Handler calls the Open Food Facts API, returns the top matches with per-100g macros, user selects a result, enters their quantity in grams, and calories + protein are calculated client-side before saving. Falls back to fully manual entry if the API returns no results or is unreachable.

## Acceptance criteria

- [ ] "Add Food" form has a search input; typing 3+ characters debounces and calls `/api/food-search?q=`
- [ ] `/api/food-search` Route Handler queries Open Food Facts (`https://world.openfoodfacts.org/cgi/search.pl`) and returns top 5 matches: `{ name, kcalPer100g, proteinPer100g }`
- [ ] Search results shown as a selectable list below the input (shadcn/ui Command or Popover)
- [ ] Selecting a result + entering quantity (g) auto-calculates and populates calories and protein fields: `(kcalPer100g / 100) * quantityG`
- [ ] User can override auto-filled values before saving
- [ ] If API returns 0 results or fails, a "Enter manually" fallback mode activates (all fields editable)
- [ ] Loading state shown during API call (shadcn/ui Skeleton or spinner)
- [ ] No API key required (Open Food Facts is public)

## Blocked by

- Issue #5 — Food logging manual entry
