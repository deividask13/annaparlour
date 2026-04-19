# Requirements Document

## Introduction

The portfolio section of the Anna Nails landing page currently displays all portfolio images at once in a masonry grid. As the number of images grows (especially with Instagram-sourced content), this creates a long, overwhelming gallery. This feature adds client-side pagination to the portfolio section so that only a limited number of images are shown per page, with a slider/pagination control at the bottom for navigating between pages. Pagination must integrate with the existing category filter tabs, resetting to page 1 when the active filter changes.

## Glossary

- **Portfolio_Section**: The React component (`PortfolioSection.tsx`) that renders the portfolio gallery, including filter tabs, the masonry grid, and the new pagination controls.
- **Pagination_Control**: The UI control rendered below the masonry grid that allows users to navigate between pages of portfolio items. Includes page number indicators and previous/next navigation.
- **Page_Size**: The maximum number of portfolio items displayed on a single page. Defaults to 6.
- **Current_Page**: A 1-based index representing the page of portfolio items currently visible in the masonry grid.
- **Filtered_Items**: The subset of all portfolio items that match the currently active category filter tab.
- **Total_Pages**: The total number of pages, calculated as the ceiling of the Filtered_Items count divided by Page_Size.
- **Masonry_Grid**: The CSS-columns-based layout that arranges portfolio images in a multi-column, variable-height grid.
- **Category_Filter**: The set of tab buttons (All, Gel, Acrylics, Nail Art, Press-Ons) that filter portfolio items by category.

## Requirements

### Requirement 1: Page-Based Item Display

**User Story:** As a visitor, I want to see a manageable number of portfolio images per page, so that the gallery is not overwhelming and loads quickly.

#### Acceptance Criteria

1. THE Portfolio_Section SHALL display at most Page_Size items in the Masonry_Grid at any time.
2. THE Portfolio_Section SHALL default Page_Size to 6.
3. WHEN the Filtered_Items count is less than or equal to Page_Size, THE Portfolio_Section SHALL display all Filtered_Items on a single page.
4. WHEN the Filtered_Items count exceeds Page_Size, THE Portfolio_Section SHALL display only the first Page_Size items from Filtered_Items on initial render.

### Requirement 2: Pagination Control Rendering

**User Story:** As a visitor, I want to see a pagination control below the gallery, so that I know there are more images and can navigate to them.

#### Acceptance Criteria

1. WHEN Total_Pages is greater than 1, THE Pagination_Control SHALL be rendered below the Masonry_Grid.
2. WHEN Total_Pages is 1 or less, THE Pagination_Control SHALL not be rendered.
3. THE Pagination_Control SHALL display a previous-page button, a set of page number indicators, and a next-page button.
4. THE Pagination_Control SHALL visually indicate the Current_Page using the gold accent color (#C9A84C).
5. THE Pagination_Control SHALL use the same font and styling conventions (Inter font, uppercase tracking) as the existing Category_Filter tabs.

### Requirement 3: Page Navigation

**User Story:** As a visitor, I want to click page numbers or previous/next buttons to browse through portfolio pages, so that I can see all the work.

#### Acceptance Criteria

1. WHEN a user clicks a page number indicator, THE Portfolio_Section SHALL update Current_Page to the selected page number and display the corresponding slice of Filtered_Items.
2. WHEN a user clicks the next-page button and Current_Page is less than Total_Pages, THE Portfolio_Section SHALL increment Current_Page by 1.
3. WHEN a user clicks the previous-page button and Current_Page is greater than 1, THE Portfolio_Section SHALL decrement Current_Page by 1.
4. WHILE Current_Page equals 1, THE Pagination_Control SHALL render the previous-page button in a disabled state.
5. WHILE Current_Page equals Total_Pages, THE Pagination_Control SHALL render the next-page button in a disabled state.

### Requirement 4: Category Filter and Pagination Integration

**User Story:** As a visitor, I want the pagination to reset when I switch category filters, so that I always start at the first page of the new category.

#### Acceptance Criteria

1. WHEN the active Category_Filter changes, THE Portfolio_Section SHALL reset Current_Page to 1.
2. WHEN the active Category_Filter changes, THE Portfolio_Section SHALL recalculate Total_Pages based on the new Filtered_Items count.
3. WHEN the active Category_Filter changes and the new Filtered_Items count is less than or equal to Page_Size, THE Pagination_Control SHALL not be rendered.

### Requirement 5: Animated Page Transitions

**User Story:** As a visitor, I want smooth transitions when navigating between pages, so that the experience feels polished and consistent with the rest of the site.

#### Acceptance Criteria

1. WHEN Current_Page changes, THE Masonry_Grid SHALL animate outgoing items with a fade-out and animate incoming items with a fade-in using Framer Motion.
2. WHILE the user has reduced-motion preferences enabled, THE Masonry_Grid SHALL skip transition animations and display items immediately.
3. WHEN Current_Page changes, THE Portfolio_Section SHALL scroll the viewport to the top of the Portfolio_Section so the user sees the new page content.

### Requirement 6: Accessibility

**User Story:** As a visitor using assistive technology, I want the pagination controls to be fully accessible, so that I can navigate the portfolio with a keyboard or screen reader.

#### Acceptance Criteria

1. THE Pagination_Control SHALL use a `nav` element with an `aria-label` of "Portfolio pagination".
2. THE Pagination_Control SHALL mark the current page indicator with `aria-current="page"`.
3. THE Pagination_Control SHALL provide `aria-label` attributes on the previous-page and next-page buttons describing their action (e.g., "Go to previous page", "Go to next page").
4. WHILE a navigation button is disabled, THE Pagination_Control SHALL set `aria-disabled="true"` on that button.
5. THE Pagination_Control SHALL support keyboard navigation, allowing users to tab between buttons and activate them with Enter or Space.

### Requirement 7: Responsive Behavior

**User Story:** As a visitor on a mobile device, I want the pagination control to be easy to tap and read, so that I can navigate the gallery on any screen size.

#### Acceptance Criteria

1. THE Pagination_Control SHALL render all interactive elements with a minimum touch target size of 44x44 pixels.
2. WHILE the viewport width is less than 768px, THE Pagination_Control SHALL display a compact layout that shows the current page indicator, the previous-page button, and the next-page button without overflowing horizontally.
3. WHILE the viewport width is 768px or greater, THE Pagination_Control SHALL display all page number indicators alongside the previous-page and next-page buttons.

### Requirement 8: Pagination Slice Computation

**User Story:** As a developer, I want the pagination logic to correctly compute page slices from the filtered items array, so that every item is reachable and no items are duplicated or lost.

#### Acceptance Criteria

1. FOR ALL valid Current_Page values from 1 to Total_Pages, THE Portfolio_Section SHALL display items from index `(Current_Page - 1) * Page_Size` to index `Current_Page * Page_Size - 1` (inclusive) of the Filtered_Items array.
2. WHEN Current_Page equals Total_Pages and the Filtered_Items count is not evenly divisible by Page_Size, THE Portfolio_Section SHALL display only the remaining items without padding or duplication.
3. FOR ALL portfolio item sets, the union of items across all pages SHALL equal the complete Filtered_Items set with no duplicates and no missing items (round-trip property).
