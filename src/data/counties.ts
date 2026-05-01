export interface County {
  id: string;
  name: string;
  slug: string;
  center: readonly [number, number];
  population: number;
}

export const ALL_COUNTIES: readonly County[] = [
  { id: "AB", name: "Alba", slug: "ab", center: [46.07, 23.58], population: 323778 },
  { id: "AR", name: "Arad", slug: "ar", center: [46.19, 21.31], population: 409072 },
  { id: "AG", name: "Argeș", slug: "ag", center: [44.86, 24.87], population: 560191 },
  { id: "BC", name: "Bacău", slug: "bc", center: [46.57, 26.91], population: 580348 },
  { id: "BH", name: "Bihor", slug: "bh", center: [47.05, 22.00], population: 551297 },
  { id: "BN", name: "Bistrița-Năsăud", slug: "bn", center: [47.13, 24.50], population: 277861 },
  { id: "BT", name: "Botoșani", slug: "bt", center: [47.75, 26.67], population: 376176 },
  { id: "BR", name: "Brăila", slug: "br", center: [45.27, 27.96], population: 281422 },
  { id: "BV", name: "Brașov", slug: "bv", center: [45.66, 25.61], population: 546408 },
  { id: "B",  name: "București", slug: "b", center: [44.43, 26.10], population: 1716961 },
  { id: "BZ", name: "Buzău", slug: "bz", center: [45.15, 26.83], population: 410723 },
  { id: "CL", name: "Călărași", slug: "cl", center: [44.20, 26.99], population: 270054 },
  { id: "CS", name: "Caraș-Severin", slug: "cs", center: [45.30, 21.90], population: 252791 },
  { id: "CJ", name: "Cluj", slug: "cj", center: [46.77, 23.60], population: 691106 },
  { id: "CT", name: "Constanța", slug: "ct", center: [44.17, 28.64], population: 643354 },
  { id: "CV", name: "Covasna", slug: "cv", center: [45.87, 26.17], population: 197677 },
  { id: "DB", name: "Dâmbovița", slug: "db", center: [44.93, 25.46], population: 468323 },
  { id: "DJ", name: "Dolj", slug: "dj", center: [44.32, 23.80], population: 600334 },
  { id: "GL", name: "Galați", slug: "gl", center: [45.44, 28.05], population: 498617 },
  { id: "GR", name: "Giurgiu", slug: "gr", center: [43.90, 25.97], population: 224246 },
  { id: "GJ", name: "Gorj", slug: "gj", center: [45.05, 23.27], population: 306762 },
  { id: "HR", name: "Harghita", slug: "hr", center: [46.36, 25.80], population: 296943 },
  { id: "HD", name: "Hunedoara", slug: "hd", center: [45.75, 22.90], population: 371033 },
  { id: "IL", name: "Ialomița", slug: "il", center: [44.57, 26.80], population: 244280 },
  { id: "IS", name: "Iași", slug: "is", center: [47.16, 27.60], population: 760774 },
  { id: "IF", name: "Ilfov", slug: "if", center: [44.49, 26.18], population: 472751 },
  { id: "MM", name: "Maramureș", slug: "mm", center: [47.66, 24.00], population: 430790 },
  { id: "MH", name: "Mehedinți", slug: "mh", center: [44.63, 22.66], population: 228384 },
  { id: "MS", name: "Mureș", slug: "ms", center: [46.55, 24.56], population: 525671 },
  { id: "NT", name: "Neamț", slug: "nt", center: [46.98, 26.38], population: 438207 },
  { id: "OT", name: "Olt", slug: "ot", center: [44.43, 24.36], population: 363687 },
  { id: "PH", name: "Prahova", slug: "ph", center: [44.95, 25.97], population: 678033 },
  { id: "SJ", name: "Sălaj", slug: "sj", center: [47.20, 23.05], population: 205914 },
  { id: "SM", name: "Satu Mare", slug: "sm", center: [47.78, 22.88], population: 330327 },
  { id: "SB", name: "Sibiu", slug: "sb", center: [45.79, 24.15], population: 397322 },
  { id: "SV", name: "Suceava", slug: "sv", center: [47.65, 25.92], population: 622938 },
  { id: "TR", name: "Teleorman", slug: "tr", center: [43.98, 25.35], population: 300499 },
  { id: "TM", name: "Timiș", slug: "tm", center: [45.75, 21.23], population: 646640 },
  { id: "TL", name: "Tulcea", slug: "tl", center: [45.18, 28.78], population: 193355 },
  { id: "VL", name: "Vâlcea", slug: "vl", center: [45.10, 24.37], population: 340588 },
  { id: "VS", name: "Vaslui", slug: "vs", center: [46.63, 27.73], population: 371156 },
  { id: "VN", name: "Vrancea", slug: "vn", center: [45.70, 27.18], population: 315798 },
] as const;

export type CountySlug = (typeof ALL_COUNTIES)[number]["slug"];

export function getCountyBySlug(slug: string): County | undefined {
  return ALL_COUNTIES.find((c) => c.slug === slug.toLowerCase());
}

export function getCountyById(id: string): County | undefined {
  return ALL_COUNTIES.find((c) => c.id === id.toUpperCase());
}
