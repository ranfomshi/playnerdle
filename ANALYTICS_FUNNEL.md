# Search-to-next-game funnel

The shared engagement manager in `globalNav/engagementManager.js` emits the same lifecycle events to GA4 and Mixpanel across every game.

## Funnel events

1. `search_landing` — the first page in a session arrived from a recognised organic search engine.
2. `game_start` — the first meaningful interaction with a game.
3. `game_complete` — the game reached its genuine result or run-complete state.
4. `next_game_click` — a player selected one of the post-result recommendations.
5. `next_game_start` — the recommended game was opened and started.
6. `next_game_complete` — the recommended game was completed.

`game_page_view` and `next_game_arrival` provide useful diagnostics but are not required funnel steps.

## Useful parameters

| Parameter | Purpose |
| --- | --- |
| `game_name` | Stable lower-case game slug |
| `game_category` | Word, colour, logic, audio or speed |
| `landing_page` | First page of the browser session |
| `landing_channel` | Organic search, referral or direct |
| `search_engine` | Recognised organic search engine |
| `session_game_number` | Number of games started in the session |
| `time_to_complete_seconds` | Time from first interaction to result |
| `completed_today_count` | Distinct games completed locally today |
| `play_streak_days` | Consecutive local dates with a completion |
| `is_next_game` / `previous_game` | Identifies recommendation-led plays |

## GA4 exploration

Create a closed funnel exploration with these steps:

1. `event_name = search_landing`
2. `event_name = game_start`
3. `event_name = game_complete`
4. `event_name = next_game_click`
5. `event_name = next_game_complete`

Use a 30-minute funnel window. Break down by `landing_page`, `game_name`, device category and default channel group. Register the custom parameters above as event-scoped custom dimensions before using them in detailed reports; event collection itself begins as soon as the deployment is live.

The daily completion list and streak are stored only in the visitor's browser. The feature creates no account, requests no notification permission and sends no puzzle answers or personally identifying data.
