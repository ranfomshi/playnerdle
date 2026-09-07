# Gameplay data schema

Bludle sends aggregate, pseudonymous gameplay measurements to the EU Mixpanel project and GA4. The shared implementation lives in `globalNav/gameTelemetry.js`; `globalNav/engagementManager.js` adds its output to `game_page_view`, `game_start` and `game_complete`.

## Shared properties

| Property | Meaning |
| --- | --- |
| `telemetry_schema_version` | Schema revision, currently `2` |
| `puzzle_day` | Europe/London calendar day (`YYYY-MM-DD`) |
| `puzzle_id` | Stable game/day identifier; never contains an answer |
| `game_format` | `daily`, `session` or `hybrid` |
| `game_name` | Stable game slug |
| `game_category` | Word, colour, logic, speed or audio |
| `outcome` | Completed, lost or finished |
| `time_to_complete_seconds` | Elapsed time from first meaningful interaction |

Completion events add only relevant numerical or bounded categorical measures. These include attempts, score, level, accuracy, colour-channel error, reaction time, hints, lives, streak and difficulty. A metric is omitted when the game does not expose it reliably.

## Werdle opening guesses

Werdle sends one `werdle_first_guess` event when a player submits the opening guess of a new daily or practice round. It contains the normalized lowercase five-letter `first_guess`, `game_mode`, counts of exact, present and absent letters, vowel and unique-letter counts, and whether a letter was repeated. Shared puzzle and acquisition context is attached by the engagement manager.

Later guesses and the puzzle answer are never sent. Restoring an in-progress daily round does not resend its first guess. This event supports reports about popular opening strategies and how the information gained on turn one relates to eventual completion, without collecting a player's full solution path.

## Afterimage colour-memory bias

After every submitted Afterimage round, the Mixpanel-only `afterimage_memory_reconstruction` event records the displayed target and the player's reconstruction as bounded RGB values. It also converts both colours to OKLab, a perceptual colour space, and records lightness, chroma, hue and perceptual distance. Keeping this detailed research event in Mixpanel avoids exceeding GA4's smaller event-parameter allowance.

Signed properties use **memory minus target** throughout. A positive `memory_minus_target_lightness` means the colour was remembered as lighter; a positive `memory_minus_target_chroma` means it was remembered as more vivid. `memory_minus_target_hue_degrees` is the shortest signed rotation from the target hue to the remembered hue. Hue comparisons are omitted for near-grey reconstructions where hue is not meaningful, and `hue_comparison_available` makes that filter explicit.

The event includes the round number, study and distraction durations, target hue/lightness/chroma bands, absolute RGB error and the existing accuracy score. This allows aggregate bias to be separated from simple accuracy and compared as the memory delay becomes harder. A submission guard ensures one event per round.

## Data deliberately excluded

- Guesses after Werdle's explicitly documented opening-guess event
- Puzzle answers or secrets
- Exact target or submitted colours outside the documented Afterimage memory event and Colour Match result metrics
- Contact details or account identifiers
- Free-form text

## First Mixpanel reports

1. `game_start` to `game_complete`, broken down by `game_name`.
2. Average `time_to_complete_seconds` and completion rate by game.
3. Werdle completion rate and average `attempts_used` by `puzzle_id`.
4. Werdle opening-guess popularity and completion rate by `first_guess`, after applying the publishing threshold below.
5. Colour Match average `error_red`, `error_green` and `error_blue`.
6. Median Reaction `reaction_ms` and Trak `level_reached`.
7. Afterimage mean and median `memory_minus_target_lightness` and `memory_minus_target_chroma`; values consistently above or below zero indicate directional memory bias.
8. Afterimage `memory_minus_target_hue_degrees` filtered to `hue_comparison_available = true`, broken down by `target_hue_band`.
9. Afterimage `perceptual_distance` and signed deltas by `round_number` to separate colour bias from the shorter study time and longer distraction.

Use a minimum sample threshold before publishing findings. Do not report a puzzle/day segment with fewer than 25 completed plays, and prefer at least 100 for comparisons or press claims.
