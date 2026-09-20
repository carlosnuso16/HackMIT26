/** Verified public sources for FOV images / morphology tables. */
export const PUBLIC_DATA_LINKS = [
  {
    label: "BBBC022 — Cell Painting (U2OS)",
    href: "https://bbbc.broadinstitute.org/BBBC022",
    note: "Dataset page. Download a channel TIFF, export PNG/JPEG, then upload here.",
  },
  {
    label: "BBBC039 — nuclei images",
    href: "https://bbbc.broadinstitute.org/BBBC039",
    note: "Smaller set; easier single FOVs for a quick image upload.",
  },
  {
    label: "Cell Image Library",
    href: "https://www.cellimagelibrary.org/images",
    note: "Browse fluorescence micrographs; download PNG/JPEG.",
  },
  {
    label: "BioImage Archive",
    href: "https://www.ebi.ac.uk/bioimage-archive/",
    note: "Search published screens; convert TIFF → PNG before upload.",
  },
] as const;

export const SAMPLE_FOV_PATH = "/demos/sample-fov.png";
export const SAMPLE_CSV_PATH = "/demos/sample-cells.csv";
