import type { DemoFov } from "./types";

export const DEMO_FOVS: DemoFov[] = [
  {
    id: "u2os-paint-a",
    name: "U2OS · Cell Painting A",
    description: "Synthetic multi-channel FOV with moderate phenotype drift.",
    visual: "emerald",
    width: 1024,
    height: 1024,
  },
  {
    id: "hepg2-stress",
    name: "HepG2 · Stress panel",
    description: "Dense culture; elevated texture and neighbor crowding.",
    visual: "amber",
    width: 1024,
    height: 1024,
  },
  {
    id: "ipsc-neuron",
    name: "iPSC-neuron · Sparse",
    description: "Lower density FOV; elongated morphologies.",
    visual: "violet",
    width: 1024,
    height: 1024,
  },
];

export function getDemoFov(id: string): DemoFov | undefined {
  return DEMO_FOVS.find((d) => d.id === id);
}
