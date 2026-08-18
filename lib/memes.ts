export interface MemeEntry {
  file: string;
  description: string;
}

export const MEMES: Record<string, MemeEntry> = {
  "this-is-fine": {
    file: "/memes/this-is-fine.jpg",
    description: "Dog calmly sitting in a burning room — staying calm in chaos, handling production fires",
  },
  "works-on-my-machine": {
    file: "/memes/works-on-my-machine.jpg",
    description: "The classic dev excuse — environment bugs, testing jokes",
  },
  "galaxy-brain": {
    file: "/memes/galaxy-brain.jpg",
    description: "Expanding brain panels — escalating from basic to genius-level thinking",
  },
  "surprised-pikachu": {
    file: "/memes/Surprised_Pikachu.jpg",
    description: "Shocked Pikachu — mock surprise at a predictable outcome",
  },
  "one-does-not-simply": {
    file: "/memes/Sean-Bean-Lord-of-the-Rings-Boromir-Mordor-meme.avif",
    description: "Boromir 'one does not simply' — something is harder than people think",
  },
  "michael-scott-no": {
    file: "/memes/micheal-scot-noo.webp",
    description: "Michael Scott screaming NO — dread, avoiding something painful",
  },
  "leo-pointing": {
    file: "/memes/Pointing_Rick_Dalton.jpg",
    description: "Pointing at the screen in recognition — 'that's me' or 'that's exactly it'",
  },
  "swole-doge": {
    file: "/memes/swole-doge-template.webp",
    description: "Buff doge vs cheems — strong vs weak comparison, flexing capability",
  },
  stonks: {
    file: "/memes/stonks.webp",
    description: "Stonks guy — numbers going up, metrics improving, gains",
  },
  "crying-jordan": {
    file: "/memes/crying-jordan.jpg",
    description: "Crying Jordan — loss or defeat, used ironically",
  },
  "deploy-friday": {
    file: "/memes/deploy-friday.jpg",
    description: "Deploying to production on a Friday — risky bold dev move",
  },
  "old-man-yells-at-cloud": {
    file: "/memes/old-main-yells-at-the-cloud.jpg",
    description: "Old man yells at cloud — complaining about tech or the industry",
  },
  "no-documentation": {
    file: "/memes/meme_no_documentation.jpg",
    description: "There is no documentation — undocumented code jokes",
  },
  "obama-mic-drop": {
    file: "/memes/obama.jpg",
    description: "Obama mic drop — confident closing statement",
  },
  "success-kid": {
    file: "/memes/sucess-meme.jpg",
    description: "Success — victory, nailed it, achievement unlocked",
  },
};

/** Formatted list of tags + descriptions to inject into the LLM prompt. */
export const MEME_CATALOG = Object.entries(MEMES)
  .map(([tag, { description }]) => `- "${tag}": ${description}`)
  .join("\n");
