export const SITE_URL = 'https://bludle.com';

export const games = [
  {
    slug: 'werdle', name: 'Werdle', category: 'Word', image: '/images/werdle.png',
    description: 'Solve a five-letter word in six guesses, then inspect its origin. Play the daily puzzle or keep going in unlimited practice.',
    format: 'Daily puzzle and unlimited practice', round: 'About 3–5 minutes',
    how: 'Enter a valid five-letter word. Green letters are correct, amber letters belong elsewhere, and grey letters are not in the answer. Use the keyboard evidence to narrow the next guess.',
    why: 'Werdle keeps the familiar deduction loop but adds a word-origin reveal, so every solved puzzle ends with something worth learning.',
    related: ['glyph', 'borrowedletters', 'codle']
  },
  {
    slug: 'bludle', name: 'Bludle', category: 'Word', image: '/images/bludle.jpg',
    description: 'Decode a five-letter word from shades of blue, where each letter has a fixed place on a light-to-dark alphabet spectrum.',
    format: 'Daily visual word puzzle', round: 'About 2–4 minutes',
    how: 'Read each blue tile as a letter value: A is the lightest end of the scale and Z is the darkest. Translate the five shades, submit a word, and use the new colour evidence to refine it.',
    why: 'Bludle turns spelling into visual decoding. The alphabet-to-colour mapping never changes, so pattern recognition improves naturally with repeated play.',
    related: ['werdle', 'glyph', 'codle']
  },
  {
    slug: 'codle', name: 'Codle', category: 'Word', image: '/images/codle.jpg',
    description: 'Crack five-letter words transformed by shifting, mirroring, reversing and alternating alphabet rules.',
    format: 'Progressive code-breaking rounds', round: 'About 3–6 minutes',
    how: 'Study the encoded word and the active rule, then reverse that transformation to recover the answer. Later rounds combine less familiar rules and require closer comparison.',
    why: 'Each puzzle asks you to understand a transformation rather than memorise a single offset, making Codle a compact test of language and logical flexibility.',
    related: ['bludle', 'wordmash', 'borrowedletters']
  },
  {
    slug: 'connex', name: 'Connex', category: 'Word', image: '/images/connex.png',
    description: 'Sort sixteen words into four hidden groups by finding the connection shared by each set.',
    format: 'Browser word-association puzzle', round: 'About 5–10 minutes',
    how: 'Select four words that share a precise connection and submit the group. Correct groups lock into place; incorrect attempts encourage you to reconsider overlaps and red herrings.',
    why: 'Connex rewards lateral thinking because plausible relationships often cross the intended groups. The challenge is finding the most exact explanation.',
    related: ['wordmash', 'werdle', 'glyph']
  },
  {
    slug: 'wordmash', name: 'Word Mash', category: 'Word', image: '/images/wordmash.svg',
    description: 'Build a chain of overlapping words by finding the shared letters that join one answer to the next.',
    format: 'Daily overlap puzzle', round: 'About 3–5 minutes',
    how: 'Use the clues to solve neighbouring words, then inspect where the end of one answer can become the beginning of another. Every overlap must make the whole chain work.',
    why: 'Word Mash combines clue solving with structural reasoning: a likely answer is only useful when it also supports its neighbours.',
    related: ['borrowedletters', 'connex', 'werdle']
  },
  {
    slug: 'glyph', name: 'Glyph', category: 'Word', image: '/images/werdle.png',
    description: 'Identify daily words from their typographic silhouettes before the individual letters are revealed.',
    format: 'Five daily silhouette puzzles', round: 'About 3–6 minutes',
    how: 'Inspect the outline made by ascenders, descenders and letter widths. Enter a word that fits the silhouette, or reveal an optional clue when shape alone is not enough.',
    why: 'Glyph makes the normally invisible shape of written language into the clue, producing a word game that feels distinct from letter-colour deduction.',
    related: ['bludle', 'werdle', 'borrowedletters']
  },
  {
    slug: 'borrowedletters', name: 'Borrowed Letters', category: 'Word', image: '/images/wordmash.svg',
    description: 'Repair five clue answers whose misplaced letters have been passed around a circular chain.',
    format: 'Daily circular word puzzle', round: 'About 5–8 minutes',
    how: 'Solve each clue, spot the letter that does not belong, and move the borrowed letters between neighbouring answers until every word is repaired.',
    why: 'Every answer affects two others, so progress comes from combining vocabulary with whole-system reasoning rather than solving clues in isolation.',
    related: ['wordmash', 'glyph', 'codle']
  },
  {
    slug: 'shiftyfades', name: 'Shifty Fades', category: 'Colour', image: '/images/shifty.png',
    description: 'Find the exact target colour among near matches across fifty increasingly subtle levels.',
    format: 'Fifty progressive levels', round: 'About 2–8 minutes',
    how: 'Compare the target with the candidate swatches and select the exact match. Differences become smaller as the level rises, so early instinct gives way to careful comparison.',
    why: 'The difficulty curve is visible and immediate: the task never changes, but your eye must become more precise.',
    related: ['guesshue', 'colourmatch', 'tintuition']
  },
  {
    slug: 'colormatch', name: 'Colour Match', category: 'Colour', image: '/images/cm.jpg',
    description: 'Recreate the daily target colour by adjusting its red, green and blue channels, then compare both RGB values.',
    format: 'One daily target and one submission', round: 'About 2–4 minutes',
    how: 'Study the target, adjust the red, green and blue controls, and submit your closest mix. The result reveals the target RGB beside your values and scores the total channel difference.',
    why: 'Colour Match turns an intuitive visual judgement into understandable numeric feedback without revealing the answer before commitment.',
    related: ['tintuition', 'afterimage', 'shiftyfades']
  },
  {
    slug: 'afterimage', name: 'Afterimage', category: 'Colour', image: '/images/cm.jpg',
    description: 'Memorise a colour, wait for it to disappear, and rebuild it from RGB controls across five daily rounds.',
    format: 'Five daily memory rounds', round: 'About 4–7 minutes',
    how: 'Study each colour during the viewing phase. Once it vanishes, reconstruct it with the RGB controls and submit to see the target and your remembered mix together.',
    why: 'Removing the reference separates colour memory from ordinary matching and shows how quickly a precise visual impression drifts.',
    related: ['colormatch', 'deadcentre', 'seequence']
  },
  {
    slug: 'chromalock', name: 'Chroma Lock', category: 'Colour', image: '/images/shifty.png',
    description: 'Stop a cycling colour at the instant it matches the target in a compact visual timing puzzle.',
    format: 'Progressive timing challenge', round: 'About 2–5 minutes',
    how: 'Memorise the target colour, watch the active colour cycle, and lock it when the two match. Accurate stops advance the run while misses expose the difference.',
    why: 'Chroma Lock mixes perception with timing: recognising the correct colour is only half the problem; you must act at the right instant.',
    related: ['tintuition', 'alternate', 'guesshue']
  },
  {
    slug: 'guesshue', name: 'Guess Hue', category: 'Colour', image: '/images/hue.png',
    description: 'Spot the one different hue before time expires as each successful round makes the distinction more subtle.',
    format: 'Endless four-second rounds', round: 'Usually 1–5 minutes',
    how: 'Scan the colour grid and select the tile whose hue differs from the rest. A correct choice extends the streak and reduces the colour gap; a miss ends the run.',
    why: 'The four-second limit keeps perception instinctive, while the adaptive hue gap gives every streak a natural difficulty curve.',
    related: ['shiftyfades', 'reaction', 'tintuition']
  },
  {
    slug: 'tintuition', name: 'Tintuition', category: 'Colour', image: '/images/tintuition.png',
    description: 'Match colours by eye using HSL controls, build combos and climb through increasingly exact ranks.',
    format: 'Ranked colour-matching run', round: 'About 3–8 minutes',
    how: 'Adjust hue, saturation and lightness until your colour looks like the target, then lock the answer. Accuracy and remaining time combine into points and combo progress.',
    why: 'HSL mirrors the way people describe colour—tone, intensity and lightness—making the feedback easier to learn from than raw guessing.',
    related: ['colormatch', 'chromalock', 'shiftyfades']
  },
  {
    slug: 'hunt', name: 'XY Marks the Spot', category: 'Logic', image: '/images/hunt.png',
    description: 'Use coordinate, direction and distance clues to locate hidden treasure before your limited scans run out.',
    format: 'Guided demo then puzzle rounds', round: 'About 3–6 minutes',
    how: 'Choose a coordinate to scan. The game reports the direction and distance to the hidden point; combine successive clues to eliminate locations and make the final find.',
    why: 'The required demonstration teaches the coordinate idea with visible possibilities, while real rounds remove those highlights and leave the deduction to you.',
    related: ['deadcentre', 'trak', 'seequence']
  },
  {
    slug: 'seequence', name: 'Seequence', category: 'Logic', image: '/images/seequence.jpg',
    description: 'Memorise a colour sequence, then reproduce the exact pattern after it disappears.',
    format: 'Progressive memory streak', round: 'About 2–6 minutes',
    how: 'Watch the sequence without making choices, hold the order in memory, and reproduce it only when playback ends. Longer patterns follow successful answers.',
    why: 'The interface separates watching from answering, so the challenge measures the sequence you retained rather than your ability to copy it live.',
    related: ['afterimage', 'deadcentre', 'trak']
  },
  {
    slug: 'deadcentre', name: 'Dead Centre', category: 'Logic', image: '/images/hunt.png',
    description: 'Memorise a target, wait for it to vanish, and click its exact centre across eight daily spatial-memory rounds.',
    format: 'Eight daily spatial rounds', round: 'About 3–5 minutes',
    how: 'Study the target while the canvas is passive. When it disappears and the guessing phase begins, place one marker where you remember its centre and receive a distance score.',
    why: 'Changing target sizes and positions make each round a clean test of spatial memory rather than cursor tracking.',
    related: ['afterimage', 'hunt', 'trak']
  },
  {
    slug: 'heardle', name: 'Heardle', category: 'Audio', image: '/images/heardle.png',
    description: 'Listen to a short music preview and identify the track in a free browser-based song puzzle.',
    format: 'Audio recognition puzzle', round: 'About 2–5 minutes',
    how: 'Play the available clip, enter the artist or song you recognise, and use additional audio only when needed. Earlier identification produces the cleanest solve.',
    why: 'Heardle turns the instant familiarity of a melody, voice or production style into a concise deduction game.',
    related: ['werdle', 'connex', 'seequence']
  },
  {
    slug: 'reaction', name: 'Reaction', category: 'Speed', image: '/images/reaction.jpg',
    description: 'Measure how quickly you respond to a visual change through short, repeatable browser reaction tests.',
    format: 'Repeatable reaction trials', round: 'Under 2 minutes',
    how: 'Start a trial, wait without anticipating, and respond the moment the visual signal changes. Repeated attempts produce a more useful picture than a single lucky click.',
    why: 'The restrained presentation keeps attention on the signal and makes it easy to compare attempts without downloads or setup.',
    related: ['alternate', 'guesshue', 'trak']
  },
  {
    slug: 'alternate', name: 'Alternate', category: 'Speed', image: '/images/alternate.jpg',
    description: 'React to each colour switch and stretch a five-second time budget through a fast sequence of accurate responses.',
    format: 'Five-second reaction run', round: 'Under 1 minute',
    how: 'Wait for the state to switch, respond immediately, and repeat. Correct reactions preserve the run; hesitation consumes the shared clock.',
    why: 'Alternate replaces a conventional submitted score with an immediate personal run, keeping the ending quick and replayable.',
    related: ['reaction', 'chromalock', 'guesshue']
  },
  {
    slug: 'trak', name: 'Trak', category: 'Speed', image: '/images/trak.png',
    description: 'Follow a moving signal after it disappears and stop it inside changing targets on lines, curves, circles and shaped tracks.',
    format: 'Progressive visual tracking levels', round: 'About 2–6 minutes',
    how: 'Watch the signal establish its speed and path. Continue tracking it mentally after it vanishes, then stop it when you believe it has entered the target zone.',
    why: 'Later tracks add curves, loops, letter-like paths and smaller stopping zones, expanding one simple timing action into a varied focus challenge.',
    related: ['deadcentre', 'reaction', 'hunt']
  }
];

export const gameBySlug = new Map(games.map(game => [game.slug, game]));

export const hubs = [
  ['wordle-alternatives', 'Wordle alternatives', ['werdle', 'bludle', 'codle', 'glyph']],
  ['daily-word-games', 'Daily word games', ['werdle', 'glyph', 'borrowedletters', 'wordmash']],
  ['colour-puzzle-games', 'Colour puzzle games', ['colormatch', 'afterimage', 'tintuition', 'shiftyfades']],
  ['reaction-games', 'Reaction games', ['reaction', 'alternate', 'guesshue', 'trak']],
  ['free-browser-games', 'Free browser games', ['werdle', 'connex', 'colormatch', 'reaction']],
  ['no-download-games', 'No-download games', ['bludle', 'wordmash', 'tintuition', 'deadcentre']],
  ['brain-training-games', 'Brain training games', ['seequence', 'deadcentre', 'connex', 'codle']],
  ['logic-puzzle-games', 'Logic puzzle games', ['hunt', 'connex', 'borrowedletters', 'codle']],
  ['games-like-wordle', 'Games like Wordle', ['werdle', 'bludle', 'glyph', 'codle']],
  ['games-like-connections', 'Games like Connections', ['connex', 'borrowedletters', 'wordmash', 'codle']]
].map(([slug, name, games]) => ({ slug, name, games }));

export const utilityPaths = [
  '404.html', 'alex/index.html', 'benefits/index.html', 'blogs/about.html',
  'game/nerdle.html', 'imageedit/index.html', 'push/index.html', 'shapecut/index.html'
];

