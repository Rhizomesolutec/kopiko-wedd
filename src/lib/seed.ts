import bcrypt from "bcryptjs";
import Admin from "../models/Admin";
import Gallery from "../models/Gallery";
import WeddingFilm from "../models/WeddingFilm";
import Review from "../models/Review";
import Settings from "../models/Settings";
import Slide from "../models/Slide";

export async function seedDatabase() {
  try {
    // 1. Seed Admin
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const hashedPassword = bcrypt.hashSync("kopikowedd@2026", 10);
      await Admin.create({
        username: "kopiko_wedd",
        password: hashedPassword,
        role: "admin",
      });
      console.log("✅ Default admin user seeded successfully.");
    }

    // 2. Seed Galleries (Love Stories)
    const galleryCount = await Gallery.countDocuments();
    if (galleryCount === 0) {
      const initialGalleries = [
        {
          couple: "Aanya & Dev",
          location: "Udaipur Palace, Rajasthan",
          date: "November 2025",
          heroImage: "/showcase/North indian/YCM00083.jpg",
          images: [
            "/showcase/North indian/YCM00083.jpg",
            "/showcase/North indian/YCM00059.jpg",
            "/showcase/North indian/YCM00135.jpg",
            "/showcase/North indian/YCM00193.jpg",
          ],
          galleryPreview: [
            "/showcase/North indian/YCM00059.jpg",
            "/showcase/North indian/YCM00135.jpg",
            "/showcase/North indian/YCM09954.jpg",
          ],
          quote: "Kopiko didn't just take pictures; they framed our love as art and preserved the exact magic of our day.",
          storySnippet: "A three-day royal North Indian wedding brought together centuries-old traditions, vibrant sangeet performances, and heartfelt family heritage.",
          featured: true,
          hidden: false,
        },
        {
          couple: "Priya & Siddharth",
          location: "Heritage Pavilion, Kerala",
          date: "January 2026",
          heroImage: "/showcase/Traditional Wedd/DSC09570.jpg",
          images: [
            "/showcase/Traditional Wedd/DSC09570.jpg",
            "/showcase/Traditional Wedd/DSC00186.jpg",
            "/showcase/Traditional Wedd/DSC09993.jpg",
            "/showcase/Traditional Wedd/DSC09586.jpg",
          ],
          galleryPreview: [
            "/showcase/Traditional Wedd/DSC00186.jpg",
            "/showcase/Traditional Wedd/DSC09993.jpg",
            "/showcase/Traditional Wedd/DSC09586.jpg",
          ],
          quote: "Looking through our gallery felt like stepping into an irreplaceable fine-art heirloom.",
          storySnippet: "A serene traditional morning ceremony amidst brass lamps, silk drapes, and unscripted emotional moments.",
          featured: true,
          hidden: false,
        },
        {
          couple: "Rhea & Rohan",
          location: "Cliffs of Santorini, Greece",
          date: "October 2025",
          heroImage: "/showcase/Pre-Wedding/ASD05381.jpg",
          images: [
            "/showcase/Pre-Wedding/ASD05381.jpg",
            "/showcase/Pre-Wedding/ASD06852.jpg",
            "/showcase/Pre-Wedding/ASD06864.jpg",
            "/showcase/Pre-Wedding/ASD06285.jpg",
          ],
          galleryPreview: [
            "/showcase/Pre-Wedding/ASD06852.jpg",
            "/showcase/Pre-Wedding/ASD06864.jpg",
            "/showcase/AJI03908.jpg",
          ],
          quote: "Every frame captured the quiet, romantic energy we shared at sunset.",
          storySnippet: "An intimate pre-wedding editorial shoot wandering through white-washed villages and Aegean sea vistas.",
          featured: true,
          hidden: false,
        },
      ];
      await Gallery.insertMany(initialGalleries);
      console.log("✅ Initial love story galleries seeded.");
    }

    // 3. Seed Wedding Films
    const filmCount = await WeddingFilm.countDocuments();
    if (filmCount === 0) {
      const initialFilms = [
        {
          couple: "Meera & Arun",
          location: "Lake Como, Italy",
          duration: "4:30 MINS",
          thumbnail: "/showcase/video.jpeg",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          description: "An intimate weekend celebration along Lake Como featuring hand-curated acoustic scoring and 8K anamorphic cinematography.",
          featured: true,
          hidden: false,
        },
        {
          couple: "Sophia & James",
          location: "Château de Chantilly, France",
          duration: "5:12 MINS",
          thumbnail: "/showcase/hero.jpeg",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          description: "Grand French palace wedding wrapped in golden hour romance, vintage 35mm film cuts, and emotional vows.",
          featured: true,
          hidden: false,
        },
      ];
      await WeddingFilm.insertMany(initialFilms);
      console.log("✅ Initial wedding films seeded.");
    }

    // 4. Seed Client Reviews
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      const initialReviews = [
        {
          names: "Anjali & Vikram",
          venue: "Bolgatty Palace, Kochi",
          quote: "The team's attention to detail was sublime. They captured the subtle glances, the teary eyes, and the grand heritage of our venue with total ease.",
          rating: 5,
          approved: true,
          hidden: false,
        },
        {
          names: "Kavya & Rahul",
          venue: "Kumarakom Lake Resort",
          quote: "Every single photograph feels like a luxury painting. The white silk drapes and backwaters were framed perfectly. Absolutely recommended!",
          rating: 5,
          approved: true,
          hidden: false,
        },
        {
          names: "Sneha & Amit",
          venue: "Leela Raviz, Kovalam",
          quote: "Professional, unobtrusive, and gifted with a true artistic vision. We received our teaser gallery in record time and were absolutely speechless.",
          rating: 5,
          approved: true,
          hidden: false,
        },
      ];
      await Review.insertMany(initialReviews);
      console.log("✅ Initial client reviews seeded.");
    }

    // 5. Seed Settings
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({
        heroTitle: "Documenting Love with Poetic Elegance & Unspoken Depth",
        heroSubtitle: "Fine Art Wedding Photographers",
        heroVideo: "",
        logo: "/showcase/kopiko.png",
        instagramUrl: "https://www.instagram.com/kopiko_wedd/",
        whatsappNumber: "+919544636566",
        contactEmail: "",
      });
      console.log("✅ Site configuration settings seeded.");
    }

    // 6. Seed Slides
    const slideCount = await Slide.countDocuments();
    if (slideCount === 0) {
      const initialSlides = [
        {
          image: "/showcase/Traditional Wedd/DSC09570.jpg",
          tag: "SACRED HERITAGE",
          title: "Traditional\nGrandeur",
          layoutClass: "items-start justify-start text-left",
          tagClass: "justify-start",
          positionClass: "object-center",
        },
        {
          image: "/showcase/Pre-Wedding/ASD06285.jpg",
          tag: "POETIC ROMANCE",
          title: "Framing Love\nAs Art",
          layoutClass: "items-start justify-end text-left",
          tagClass: "justify-start",
          positionClass: "object-center",
        },
        {
          image: "/showcase/Pre-Wedding/AJI04083.jpg",
          tag: "CINEMATIC ESSENCE",
          title: "Timeless\nPortraits",
          layoutClass: "items-end justify-start text-right",
          tagClass: "justify-end",
          positionClass: "object-[center_85%]",
        },
      ];
      await Slide.insertMany(initialSlides);
      console.log("✅ Initial viewfinder slides seeded.");
    }
  } catch (error) {
    console.error("❌ Failed to seed database:", error);
  }
}
