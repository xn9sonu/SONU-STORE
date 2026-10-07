# SONU FF STORE &mdash; Premium Free Fire Account Showcase (Demo)

A modern, responsive storefront interface built strictly in **Black & Metallic Gold** for showcasing Free Fire demo account listings.

---

## 🌟 Key Features

- **Strict Black & Gold Aesthetic:** Luxury cyber/esports styling, metallic gold gradients, glowing borders, and dark glassmorphic cards.
- **Demo Store Transparency:** Prominently marked with `DEMO STORE`, `DEMO LISTING`, and disclaimer banners throughout. No affiliation with Garena or Free Fire.
- **Reusable Card & Gallery Engine:** A single reusable component manages all cards and modals. Supports 10–20+ screenshots per account without page slowdown.
- **Interactive Screenshot Gallery:**
  - Full-screen high-res preview
  - Clickable thumbnail carousel
  - Previous (`<`) & Next (`>`) navigation
  - Mobile touch swipe gestures
  - Keyboard navigation (Left/Right arrows, ESC to close)
  - Real-time photo counter (`1 / 6`, `3 / 15`, etc.)
- **Direct WhatsApp Integration:**
  - Header & floating WhatsApp buttons (`7209168825` / `https://wa.me/917209168825`)
  - Individual account buttons pre-fill the exact account code:
    `Hello Sonu FF Store, I am interested in Demo Account #01`
- **Search, Filters & Sorting:**
  - Real-time search by UID or Account Code
  - Filters by Server (India / Indonesia), Prime Level, Price range, and Evo Guns
  - Sorting by Price (Low/High), Evo Guns count, and Account Level
  - One-click UID clipboard copying with visual toast feedback

---

## 📁 File Structure

```text
demo/
├── index.html                 # Main storefront page
├── css/
│   └── styles.css             # Black & Gold luxury gaming styling & responsive breakpoints
├── js/
│   ├── accounts-data.js       # Central account database (add/replace images here)
│   └── app.js                 # Reusable card renderer, filter engine, modal gallery & gestures
├── images/
│   └── accounts/
│       ├── acc01/            # Demo screenshots for Account 01
│       ├── acc02/            # Demo screenshots for Account 02
│       ├── acc03/            # Demo screenshots for Account 03
│       ├── acc04/            # Demo screenshots for Account 04
│       ├── acc05/            # Demo screenshots for Account 05
│       ├── acc06/            # Demo screenshots for Account 06
│       └── acc07/            # Demo screenshots for Account 07
└── README.md
```

---

## 📸 How to Add Your Own Screenshots (10–20 Images Per Account)

1. Save your account screenshots (e.g., `lobby.jpg`, `guns.png`, `vault.jpg`) inside the corresponding account folder:
   - For Account 01: `images/accounts/acc01/`
   - For Account 02: `images/accounts/acc02/`
   ...and so on.

2. Open [`js/accounts-data.js`](file:///c:/Users/kashy/Downloads/demo/js/accounts-data.js) and update the `images` list for that account:

```javascript
{
  code: "01",
  server: "INDIA 🇮🇳",
  serverRegion: "India",
  uid: "2242394439",
  primeLevel: 6,
  accountAge: "6 Years",
  level: 72,
  evoGuns: 5,
  price: "₹4,000 DEMO",
  priceNum: 4000,
  demo: true,
  images: [
    "images/accounts/acc01/my_screenshot_01.jpg", // First image is the main card thumbnail
    "images/accounts/acc01/my_screenshot_02.jpg",
    "images/accounts/acc01/my_screenshot_03.jpg",
    "images/accounts/acc01/my_screenshot_04.jpg",
    "images/accounts/acc01/my_screenshot_05.jpg",
    // You can add up to 20+ images!
  ]
}
```

3. The system will automatically update the main card thumbnail, the photo counter pill (e.g., `📷 12`), and the modal gallery with all thumbnails!

---

## 🚀 Running the Storefront

Simply open `index.html` in any web browser, or run a local web server:

```powershell
python -m http.server 8080
```
Then navigate to `http://localhost:8080/`.
