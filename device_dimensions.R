# ============================================================
# Device Dimensions Data — Phones & Laptops
# Sources: Apple.com, Dimensions.com, GSMArena, Samsung,
#          Dell.com, SurfaceTip.com, ecoatm.com
# All phone dims: height_mm, width_mm, depth_mm, weight_g, screen_in
# All laptop dims: width_in (side-to-side), depth_in (front-to-back),
#                  thickness_in, weight_lb, screen_in
# ============================================================


# ── PHONES ──────────────────────────────────────────────────

# Apple iPhone (2020–2025)
# Columns: model, year, screen_in, height_mm, width_mm, depth_mm, weight_g
iphone <- data.frame(
  model      = c("iPhone 12 mini",    "iPhone 12",         "iPhone 12 Pro Max",
                 "iPhone 13 mini",    "iPhone 13",         "iPhone 13 Pro Max",
                 "iPhone 14",         "iPhone 14 Pro Max",
                 "iPhone 15",         "iPhone 15 Pro Max",
                 "iPhone 16",         "iPhone 16 Pro Max",
                 "iPhone 17",         "iPhone 17 Air",     "iPhone 17 Pro Max"),
  year       = c(2020, 2020, 2020,
                 2021, 2021, 2021,
                 2022, 2022,
                 2023, 2023,
                 2024, 2024,
                 2025, 2025, 2025),
  screen_in  = c(5.4,  6.1,  6.7,
                 5.4,  6.1,  6.7,
                 6.1,  6.7,
                 6.1,  6.7,
                 6.1,  6.9,
                 6.3,  6.5,  6.9),
  height_mm  = c(131.5, 146.7, 160.8,
                 131.5, 146.7, 160.8,
                 146.7, 160.7,
                 147.6, 159.9,
                 147.6, 163.0,
                 149.6, 156.2, 163.4),
  width_mm   = c(64.2,  71.5,  78.1,
                 64.2,  71.5,  78.1,
                 71.5,  77.6,
                 71.6,  76.7,
                 71.6,  77.6,
                 71.5,  74.7,  78.0),
  depth_mm   = c(7.40,  7.40,  7.40,
                 7.65,  7.65,  7.65,
                 7.80,  7.85,
                 7.80,  8.25,
                 7.80,  8.25,
                 7.95,  5.64,  8.75),
  weight_g   = c(133,  162,  228,
                 141,  174,  240,
                 172,  240,
                 171,  221,
                 170,  227,
                 177,  145,  209),
  stringsAsFactors = FALSE
)


# Samsung Galaxy S series (2020–2025)
# Columns: model, year, screen_in, height_mm, width_mm, depth_mm, weight_g
samsung_galaxy_s <- data.frame(
  model      = c("Galaxy S20",        "Galaxy S20 Ultra",
                 "Galaxy S21",        "Galaxy S21 Ultra",
                 "Galaxy S22",        "Galaxy S22 Ultra",
                 "Galaxy S23",        "Galaxy S23 Ultra",
                 "Galaxy S24",        "Galaxy S24 Ultra",
                 "Galaxy S25",        "Galaxy S25 Ultra"),
  year       = c(2020, 2020,
                 2021, 2021,
                 2022, 2022,
                 2023, 2023,
                 2024, 2024,
                 2025, 2025),
  screen_in  = c(6.2,  6.9,
                 6.2,  6.8,
                 6.1,  6.8,
                 6.1,  6.8,
                 6.2,  6.8,
                 6.2,  6.9),
  height_mm  = c(151.7, 166.9,
                 151.7, 165.1,
                 146.0, 163.3,
                 146.3, 163.4,
                 147.0, 162.3,
                 146.9, 162.8),
  width_mm   = c(69.1,  76.0,
                 71.2,  75.6,
                 70.6,  77.9,
                 70.9,  78.1,
                 70.6,  79.0,
                 70.5,  77.6),
  depth_mm   = c(7.9,   8.8,
                 7.9,   8.9,
                 7.6,   8.9,
                 7.6,   8.9,
                 7.6,   8.6,
                 7.2,   8.2),
  weight_g   = c(163,  220,
                 169,  227,
                 167,  229,
                 168,  234,
                 167,  232,
                 162,  218),
  stringsAsFactors = FALSE
)


# Google Pixel (2021–2024)
# Columns: model, year, screen_in, height_mm, width_mm, depth_mm, weight_g
google_pixel <- data.frame(
  model      = c("Pixel 6",      "Pixel 6 Pro",
                 "Pixel 7",      "Pixel 7 Pro",
                 "Pixel 8",      "Pixel 8 Pro",
                 "Pixel 9",      "Pixel 9 Pro",  "Pixel 9 Pro XL"),
  year       = c(2021, 2021,
                 2022, 2022,
                 2023, 2023,
                 2024, 2024, 2024),
  screen_in  = c(6.4,  6.7,
                 6.3,  6.7,
                 6.2,  6.7,
                 6.3,  6.3,  6.8),
  height_mm  = c(158.6, 163.9,
                 155.6, 162.9,
                 150.5, 162.6,
                 152.8, 152.8, 162.8),
  width_mm   = c(74.8,  75.9,
                 73.2,  76.6,
                 70.8,  76.5,
                 72.0,  72.0,  76.6),
  depth_mm   = c(8.9,   8.9,
                 8.7,   8.9,
                 8.9,   8.7,
                 8.5,   8.5,   8.5),
  weight_g   = c(207,  210,
                 197,  212,
                 187,  213,
                 198,  199,  221),
  stringsAsFactors = FALSE
)


# ── LAPTOPS ─────────────────────────────────────────────────

# Apple MacBook Air (2020–2025)
# Columns: model, year, chip, screen_in, width_in, depth_in, thickness_in, weight_lb
macbook_air <- data.frame(
  model        = c("MacBook Air 13\" M1",  "MacBook Air 13\" M2",
                   "MacBook Air 15\" M2",  "MacBook Air 13\" M3",
                   "MacBook Air 15\" M3",  "MacBook Air 13\" M4",
                   "MacBook Air 15\" M4"),
  year         = c(2020, 2022, 2023, 2024, 2024, 2025, 2025),
  chip         = c("M1", "M2", "M2", "M3", "M3", "M4", "M4"),
  screen_in    = c(13.3, 13.6, 15.3, 13.6, 15.3, 13.6, 15.3),
  width_in     = c(11.97, 11.97, 13.40, 11.97, 13.40, 11.97, 13.40),
  depth_in     = c(8.36,  8.46,  9.35,  8.46,  9.35,  9.35,  9.35),
  thickness_in = c(0.63,  0.44,  0.45,  0.44,  0.45,  0.44,  0.45),
  weight_lb    = c(2.80,  2.70,  3.30,  2.70,  3.30,  2.70,  3.30),
  stringsAsFactors = FALSE
)


# Apple MacBook Pro (2020–2024)
# Columns: model, year, chip, screen_in, width_in, depth_in, thickness_in, weight_lb
macbook_pro <- data.frame(
  model        = c("MacBook Pro 13\" M1",      "MacBook Pro 14\" M1 Pro/Max",
                   "MacBook Pro 16\" M1 Pro/Max","MacBook Pro 13\" M2",
                   "MacBook Pro 14\" M3",       "MacBook Pro 16\" M3",
                   "MacBook Pro 14\" M4",       "MacBook Pro 16\" M4"),
  year         = c(2020, 2021, 2021, 2022, 2023, 2023, 2024, 2024),
  chip         = c("M1", "M1 Pro/Max", "M1 Pro/Max", "M2",
                   "M3", "M3", "M4", "M4"),
  screen_in    = c(13.3, 14.2, 16.2, 13.3, 14.2, 16.2, 14.2, 16.2),
  width_in     = c(11.97, 12.31, 14.01, 11.97, 12.31, 14.01, 12.31, 14.01),
  depth_in     = c(8.36,  8.71,  9.77,  8.36,  8.71,  9.77,  8.71,  9.77),
  thickness_in = c(0.61,  0.61,  0.66,  0.61,  0.61,  0.66,  0.61,  0.66),
  weight_lb    = c(3.00,  3.50,  4.70,  3.00,  3.50,  4.70,  3.50,  4.70),
  stringsAsFactors = FALSE
)


# Dell XPS series (2020–2024)
# Columns: model, year, screen_in, width_in, depth_in, thickness_in, weight_lb
dell_xps <- data.frame(
  model        = c("XPS 13 9310",    "XPS 15 9500",
                   "XPS 13 9315",    "XPS 13 9340 Gen3",
                   "XPS 13 9345 Gen4","XPS 14 9440",
                   "XPS 16 9640"),
  year         = c(2020, 2020, 2022, 2023, 2024, 2024, 2024),
  screen_in    = c(13.4, 15.6, 13.4, 13.4, 13.4, 14.5, 16.3),
  width_in     = c(11.63, 13.57, 11.63, 11.62, 11.62, 12.60, 14.20),
  depth_in     = c(7.85,   9.00,  7.85,  7.84,  7.84,  8.50,  9.60),
  thickness_in = c(0.55,   0.70,  0.55,  0.60,  0.60,  0.71,  0.76),
  weight_lb    = c(2.59,   4.00,  2.59,  2.60,  2.60,  3.85,  4.65),
  stringsAsFactors = FALSE
)


# Microsoft Surface series (2020–2025)
# Columns: model, year, type, screen_in, width_in, depth_in, thickness_in, weight_lb
microsoft_surface <- data.frame(
  model        = c("Surface Pro 7",        "Surface Laptop 4 13\"",
                   "Surface Pro 9",        "Surface Laptop 5 13.5\"",
                   "Surface Pro 10",       "Surface Pro 12",
                   "Surface Laptop 13"),
  year         = c(2020, 2021, 2022, 2022, 2024, 2025, 2025),
  type         = c("tablet/laptop", "laptop",
                   "tablet/laptop", "laptop",
                   "tablet/laptop", "tablet/laptop",
                   "laptop"),
  screen_in    = c(12.3, 13.5, 13.0, 13.5, 13.0, 12.0, 13.0),
  width_in     = c(11.50, 11.48, 11.30, 11.48, 11.30, 10.80, 11.25),
  depth_in     = c(7.90,   8.41,  8.20,  8.41,  8.23,  7.47,  8.43),
  thickness_in = c(0.33,   0.57,  0.37,  0.57,  0.37,  0.30,  0.61),
  weight_lb    = c(1.70,   2.80,  1.94,  2.80,  1.96,  1.50,  2.70),
  stringsAsFactors = FALSE
)


# ── QUICK INSPECTION ────────────────────────────────────────
# Uncomment any line below to preview a dataset:

# str(iphone)
# head(iphone)
# View(iphone)

# str(samsung_galaxy_s)
# str(google_pixel)

# str(macbook_air)
# str(macbook_pro)
# str(dell_xps)
# str(microsoft_surface)


# ── EXAMPLE ANALYSES ────────────────────────────────────────

# Average phone weight by brand:
# mean(iphone$weight_g)
# mean(samsung_galaxy_s$weight_g)
# mean(google_pixel$weight_g)

# Thinnest iPhone ever:
# iphone[which.min(iphone$depth_mm), ]

# Largest Galaxy S screen:
# samsung_galaxy_s[which.max(samsung_galaxy_s$screen_in), ]

# Lightest MacBook Air:
# macbook_air[which.min(macbook_air$weight_lb), ]

# All devices released in 2024:
# subset(dell_xps, year == 2024)
# subset(iphone, year == 2024)

# Average iPhone screen size
mean(iphone$screen_in)

# Average Samsung thickness
mean(samsung_galaxy_s$depth_mm)

# Average Pixel width
mean(google_pixel$width_mm)

# Average MacBook Air weight
mean(macbook_air$weight_lb)

# Average MacBook Pro screen size
mean(macbook_pro$screen_in)
avg_iphone_weight <- mean(iphone$weight_g)

print(avg_iphone_weight)
