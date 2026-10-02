export interface SunsetMilestone {
  id: string;
  start: number; // 0.0 to 1.0
  end: number;   // 0.0 to 1.0
  text: string;
  subtext?: string;
}

export const sunsetConfig = {
  badge: "ACT II • OUR PRIVATE SUNSET",
  title: "A Sunset Just For Us",
  subtitle: "Two people sitting together, watching the day slowly fade...",

  // Scroll sequence settings
  frameCount: 140,
  heightVh: 650,
  sheetUrl: "/sunset/spritesheet.webp",
  sheetCols: 10,
  sheetRows: 14,
  posterUrl: "/sunset/poster.webp",
  mobileBreakpoint: 768,
  mobileFrameCount: 70, // subsampled on mobile for optimal memory and performance

  // Story milestones synchronized with scroll progress
  milestones: [
    {
      id: "opening",
      start: 0.0,
      end: 0.22,
      text: "bring me the sunset in the cup",
      subtext: "...just a quiet place to breathe and take it all in.",
    },
    {
      id: "presence",
      start: 0.22,
      end: 0.46,
      text: "They were sitting together building something...",
      subtext: "...now sitting together watching something. The same two people.",
    },
    {
      id: "icecream",
      start: 0.46,
      end: 0.68,
      text: "Two chocolate ice creams by the water...",
      subtext: "...and the warm fairy lights of the ice cream truck glowing in the dusk.",
    },
    {
      id: "together",
      start: 0.68,
      end: 0.88,
      text: "nuv oka art",
      subtext: "While the city lights awaken, and the skyline turns to gold.",
    },
    {
      id: "climax",
      start: 0.88,
      end: 1.0,
      text: "Maybe this is one of those moments.",
      subtext: "Out of eight million souls in this city, you are my favorite story.",
    },
  ] as SunsetMilestone[],

  // Final CTA revealed once the sunset completes
  finalButtonText: "There's more →",
  finalPrompt: "The sky has darkened into night... but our journey is just beginning.",
  scrollHint: "Scroll down to let the sun set • Scroll up to rewind time",
};
