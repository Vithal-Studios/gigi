export const siteConfig = {
  herName: "Gayathri",
  yourName: "Your Companion",

  introMessage: "A little world made for Gayathri...",
  introSubMessage: "because you deserve more than just a birthday wish.",

  birthdayMessage: "Happy Birthday, Gayathri ❤️",

  finalMessage: "Thank you for being part of my favorite memories.",
  finalSubMessage: "and i smile when i think of all the times we had.",

  musicPath: "/assets/music/background.mp3",
  videoPath: "/assets/videos/birthday-video.mp4",

  secretMessage: "You are the best thing that ever happened to me. Never forget that. ❤️",

  password: {
    code: "317",
    acceptedCodes: ["317", "0317"],
    hint: "Three numbers. One tiny secret (317)...",
    title: "A Little World Made for Gayathri",
    subtitle: "Three numbers. One tiny secret.",
  },

  nyc: {
    badge: "SCENE 01 • NEW YORK CITY • GOLDEN HOUR",
    title: "The City of Eight Million",
    subtitle: "...and you're the only one I ever look for.",
    narrative: [
      "They say New York is a city that never stops moving.",
      "Every avenue has a rhythm, and every skyline carries a million different dreams.",
      "Yet out of all the towering lights in Manhattan, none will ever shine as brightly as you do.",
    ],
    buttonText: "Walk towards the sunset with me →",
  },

  sunset: {
    badge: "SCENE 02 • GOLDEN HOUR • LAKE REFLECTIONS",
    title: "A Sunset Just For Us",
    subtitle: "Watch the sky paint itself in colors made for you.",
    narrative: [
      "The sun begins to dip behind the Manhattan towers.",
      "The lake turns into molten gold, catching every warm reflection.",
      "And right here, watching the daylight fade beside you, is where time stands still.",
    ],
    buttonText: "Follow the melody to the ice cream truck →",
  },

  moon: {
    badge: "ACT VII • THE MOON",
    idleHint: "Try to catch the moon...",
    dodgeMessages: ["Almost.", "Not yet.", "Seriously?"],
    catchableHint: "Okay okay... come get me ✦",
    caughtMessage: "You caught the moon.",
  },

  finalVideo: {
    badge: "ACT VIII • THE FINALE",
    src: "/videos/final-video.mp4",
    title: "Happy Birthday",
    subtitle: "Out of eight million people, you are my favorite story...",
  },
};

export const STAGES = [
  'password',
  'nyc',
  'sunset',
  'darkness',
  'moon',
  'finalVideo',
] as const;

export type StageName = typeof STAGES[number];
