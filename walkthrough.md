# Walkthrough - Typography & Editorial Layout Upgrades

This walkthrough documents the visual design refinements applied to the brand logo, the floating WhatsApp CTA, the **Hero Section** slide order and image alignment, the **Viewfinder Slideshow** updates, the **Stats Section** column grid and text scaling, the **Featured Love Stories** layout and background styling, quote blocks, the **Sister Brand** integrations, the **Footer** clock removals, and the **Client Story Reviews** card typography.

## Summary of Upgrades

### 1. Viewfinder Card Size Restoration
- **Height Dimension Revert** ([AppleScrollStory.tsx](file:///c:/Users/adhil/OneDrive/Desktop/kopiko-wedd-main/kopiko-wedd-main/src/components/sections/AppleScrollStory.tsx)):
  - Restored the vertical height of the Viewfinder Card to **`h-[85vh]`** on all viewports (reverting the responsive height override of `h-[65vh] md:h-[80vh]`).
  - This returns the card to its original, highly immersive size to deliver the intended cinema-reel proportion.

### 2. Footer Timezone Clocks Removal
- **World Timezones Strip Clean-up** ([Footer.tsx](file:///c:/Users/adhil/OneDrive/Desktop/kopiko-wedd-main/kopiko-wedd-main/src/components/navigation/Footer.tsx)):
  - Completely removed the World Timezones clock layout strip (which displayed London, Paris, New York, and Mumbai live clocks).
  - Deleted all related state hooks, clock calculation logic inside `useEffect`, and the unused `formatTime` import helper to ensure zero dead code footprint and clean builds.

### 3. Sister Brand @kopikokidd Card & Bio Update
- **Subtitle Text Removal** ([AboutSection.tsx](file:///c:/Users/adhil/OneDrive/Desktop/kopiko-wedd-main/kopiko-wedd-main/src/components/sections/AboutSection.tsx)):
  - Removed the subtitle line *"Founders & Principal Directors"* located beneath the *"Kopiko Wedding Studio"* text at the bottom.
- **Instagram Mini-Card Integration**:
  - Added a compact, premium glassmorphic card for `@kopikokidd` positioned at the bottom of the section (aligned side-by-side with the studio signature on desktop and stacked below it on mobile).
  - Integrated the custom SVG **`InstagramIcon`** and Lucide **`ArrowUpRight`** transition icon.
  - Styled the card with warm tones (`bg-[#edeadf]/80`, `border-[#c7beab]/50`), hover micro-interactions (translate-y offset, background color shifts, and SVG arrow motions), linking directly to the requested Instagram post (`https://www.instagram.com/p/DZ7BvV1E6aG/`).
- **About Section Content Update**:
  - Removed the original heading *"Documenting Love with Poetic Elegance & Unspoken Depth"*.
  - Replaced it with the new concise title: **"Documenting Love & Growing Families"**.
  - Appended a dedicated call-out referencing the kids and maternity sister photography brand: **[kopikokidd](https://www.instagram.com/p/DZ7BvV1E6aG/?igsh=MTlmNWtkaWF1ZmFsMw==)**.
  - Linked the brand name directly to the requested Instagram post, configured to open in a new tab (`target="_blank"`).

### 4. Stats Section Grid Layout & Sizing
- **Responsive 4-Column Grid** ([StatsSection.tsx](file:///c:/Users/adhil/OneDrive/Desktop/kopiko-wedd-main/kopiko-wedd-main/src/components/sections/StatsSection.tsx)):
  - Reconfigured the stats layout from a 2-column stacked grid (`grid-cols-2`) to a single-row 4-column grid (`grid-cols-4`) on mobile screen viewports to match the desktop layout.
  - Adjusted the grid gaps (`gap-1 sm:gap-4 md:gap-12`) and padding dividers (`pl-1 sm:pl-4 md:pl-8`) dynamically so the stats columns align side-by-side cleanly on narrow viewports without breaking layout boundaries.
  - Compacted the section vertical padding to `py-10` on mobile viewports (down from `py-16`) to make the statistics strip sleek and space-efficient.
  - Scaled down font sizing classes on mobile to guarantee a perfect fit:
    - **Count Values**: Reduced from `text-3xl` to **`text-2xl`** on mobile screens.
    - **Labels**: Scaled to **`text-[8px] leading-tight`** with tracked spacing `tracking-[0.08em]`.
    - **Sublabels**: Scaled to **`text-[7.5px] leading-tight`** with normal spacing.

### 5. Viewfinder Auto-Slideshow Upgrade
- **Random Corner/Side Layout on Mobile Screen** ([AppleScrollStory.tsx](file:///c:/Users/adhil/OneDrive/Desktop/kopiko-wedd-main/kopiko-wedd-main/src/components/sections/AppleScrollStory.tsx)):
  - Restored different corner alignments (top-left, bottom-right, bottom-left) for text overlays on mobile screen layout to match the desktop behavior and avoid simple centering.
  - Set the container padding on mobile screens to **`px-8 py-14`** (32px left/right and 56px top/bottom). This pushes the text block safely inside the Leica HUD border, avoiding any overlaps with top-aligned or bottom-aligned HUD text elements.
  - Adjusted the heading font size to **`text-2xl`** on mobile screens to make it compact and ensure it fits neatly in the corners without expanding into other contents.
- **Fade-Out Transition Optimization**:
  - Removed layout-restricting `display: none` / `display: block` snaps from slide container elements.
  - Replaced it with a smooth continuous layout integration using absolute positions and `opacity: isVisible ? 1 : 0` animations.
  - Set a `0.4s` fade transition for the opacity, allowing inactive slides to vanish smoothly as they reset and teleport back to their waiting positions, resolving any blank space or flashing frame glitches.
- **Slide Alignment & Framing Tweaks**:
  - Adjusted the background framing of the **third image** (`/showcase/Pre-Wedding/AJI04083.jpg` - *Timeless Portraits*) using custom object-position coordinates **`object-[center_85%]`**. This shifts the visible crop window downward further to focus on the bottom-to-center part of the image, keeping the couple's heads beautifully visible and preventing any bride's head cropping.
- **Slideshow Image Updates**:
  - Removed the slide titled "Unscripted Royalty" (`/showcase/hero.jpeg`) entirely from the sequence.
  - The slideshow now dynamically cycles through 3 premium frames:
    - **Slide 1**: `DSC09570.jpg` (*Traditional Grandeur*)
    - **Slide 2**: `ASD06285.jpg` (*Framing Love As Art*)
    - **Slide 3**: `AJI04083.jpg` (*Timeless Portraits* - custom focused at `object-[center_85%]`)
- **Continuous Right-Direction Slider Transition**:
  - Upgraded the slider from a standard linear carousel to an **absolute-stacked infinite loop carousel**.
  - All slides now translate dynamically based on active/previous status:
    - **Active slide**: enters from the right to the center (`x: 100% -> 0%`).
    - **Previous slide**: exits from the center to the left (`x: 0% -> -100%`).
    - **Inactive slide**: remains hidden (`opacity: 0`) and teleports from left to right instantly so it is always ready to slide in from the right.
  - This guarantees the slide transition **always travels in one direction (rightwards)**, avoiding any snaps or rapid leftward rewinds when looping from the 3rd slide back to the 1st slide.
  - Retained the signature counter-parallax offset on background images (`x: (activeIdx - idx) * 18%` and `w-[120%] -left-[10%]`) to deliver a breathtaking Awwwards-grade 3D depth effect.

### 6. Hero Slide Alignment & Reordering
- **Slide Alignment Customization** ([Hero.tsx](file:///c:/Users/adhil/OneDrive/Desktop/kopiko-wedd-main/kopiko-wedd-main/src/components/sections/Hero.tsx)):
  - Adjusted the desktop viewport `object-position` styling dynamically:
    - **Slide 3 & 5** (indices 2 and 4): Configured to **`md:object-[center_50%]`** (perfect vertical center) to shift their framing upward slightly and ignore the extreme bottom part, keeping the subjects centered and prominent on desktop screens.
    - **Slide 4** (index 3): Retains **`md:object-[center_75%]`** to focus on the lower-center section of that specific photo.
    - **Slide 1 & 2** (indices 0 and 1): Retains top-focused `object-[center_18%]` framing.
    - **Mobile Viewports**: All slides retain standard `object-[center_18%]` positioning for optimal smartphone framing.
- **Slide Order Update**:
  - Rearranged the `heroImages` array elements to shift the background slide sequence:
    - **Slide 1**: `/showcase/North indian/YCM00354.jpg`
    - **Slide 2**: `/showcase/Pre-Wedding/ASD07384.jpg` (formerly Slide 4)
    - **Slide 3**: `/showcase/Traditional Wedd/KOPIKO WEDD.IN-117.jpg` (formerly Slide 2)
    - **Slide 4**: `/showcase/DSC03000.jpg` (formerly Slide 3)
    - **Slide 5**: `/showcase/DSC02586.jpg` (remains Slide 5)

### 7. Brand Logo Update
- **Dual Symbol and Wordmark Layout** ([Header.tsx](file:///c:/Users/adhil/OneDrive/Desktop/kopiko-wedd-main/kopiko-wedd-main/src/components/navigation/Header.tsx), [Footer.tsx](file:///c:/Users/adhil/OneDrive/Desktop/kopiko-wedd-main/kopiko-wedd-main/src/components/navigation/Footer.tsx)):
  - Configured a side-by-side layout that incorporates both the legacy rounded symbol (`kopiko-logo.jpeg`) and the new horizontal wordmark (`kopiko.png`).
  - **Header**: Displays the circular icon logo on the left (`w-10 h-10` with custom hover zoom) and the flat horizontal text logo on the right (`w-28 h-7`), providing a highly premium visual mark.
  - **Footer**: Displays the circular icon logo on the left (`w-11 h-11`) and the flat horizontal logo on the right (`w-32 h-[30px]`) with the tagline *"framing love as art."* centered directly underneath it.

### 8. Floating WhatsApp CTA
- **Fixed Button Integration** ([layout.tsx](file:///c:/Users/adhil/OneDrive/Desktop/kopiko-wedd-main/kopiko-wedd-main/src/app/layout.tsx)):
  - Embedded a floating WhatsApp contact button pinned to the bottom-right corner (`fixed bottom-6 right-6 z-[9990]`).
  - Configured it to link directly to WhatsApp chat (`https://wa.me/919544636566`) loading in a new tab.
  - Styled it in standard brand green (`#25D366`) with a premium drop shadow, hover scale transitions (`hover:scale-108`), and a subtle rotation on the custom SVG icon on hover.

### 9. Featured Stories Background Color Update
- **Lighter Warm Taupe styling** ([FeaturedStories.tsx](file:///c:/Users/adhil/OneDrive/Desktop/kopiko-wedd-main/kopiko-wedd-main/src/components/sections/FeaturedStories.tsx)):
  - Adjusted the background color of the Featured Love Stories section from `#464239` to **`#565146`** (Tailwind: `bg-[#565146]`).
  - This makes the section background slightly lighter (about 15% brighter) while preserving the exact same luxury clay/warm taupe color tone and aesthetic.

### 10. Editorial Layout for Featured Stories
- **Floating Overlay Panels & Background Removals** ([FeaturedStories.tsx](file:///c:/Users/adhil/OneDrive/Desktop/kopiko-wedd-main/kopiko-wedd-main/src/components/sections/FeaturedStories.tsx)):
  - Removed solid background panels, borders, and backdrop-blurs from both the couple nameplate and the location badge.
  - Placed them directly as floating text overlays on top of the visual card images.
  - Added clean drop-shadow filters (`drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]`) to guarantee perfect readability on high-brightness/contrasted images.
- **Scroll-Only Entry Animations**:
  - Removed the slide index key triggers (`key={slideIndices[story.id]}`) from the overlays, preventing them from re-animating during automatic or manual image changes.
  - Configured viewport-based entrance animations using `whileInView` and `viewport={{ once: true }}`. Now, the location pin slides down (`y: -15 -> 0`) and the couple nameplate slides up (`y: 15 -> 0`) only **once** when the user scrolls the card into view, remaining perfectly static and solid as the background photos slide.
- **Paginated Dots & Location Badge**:
  - Relocated the slider controls/dots indicator to the bottom-right corner of the image card for visual balance.
  - The location badge remains in the top-left corner.
- **Narrative Column Polish**:
  - Added a luxury serif chapter number indicator (e.g. `01`, `02`, `03`) next to the calendar date line with a thin horizontal rule.
  - Replaced the bended/italic quote style with an uppercase, clean sans-serif layout (`font-sans-clean text-xs uppercase tracking-[0.25em] font-semibold text-zinc-200 leading-relaxed`) matching the "Read Full Story" button.

### 11. Client Reviews Typography
- **Grid Cards Font Update** ([TestimonialsSection.tsx](file:///c:/Users/adhil/OneDrive/Desktop/kopiko-wedd-main/kopiko-wedd-main/src/components/sections/TestimonialsSection.tsx)):
  - Changed the font class on client review quotes from the serif style to the standard body font (`font-sans-clean text-xs md:text-sm text-zinc-300 leading-relaxed font-light`), making the text clean, readable, and consistent.

---

## Verification Results

### Build Verification
- Executed `npm run build` cleanly:
  - **Compile Status**: `✓ Compiled successfully in 3.6s`
  - **TypeScript Check**: `✓ Finished TypeScript in 4.7s`
  - **Static Page Generation**: `✓ Generating static pages (4/4)` with zero errors.
