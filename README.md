# Bombay Creamery: National Rollout Cockpit

Interactive dashboard (visual output) for the Marketing Management II Working-with-AI project
**"Taking Bombay Creamery National"**, by Tanish Tyagi (M56D-26, Section D), IIM Ranchi.

## What it shows
1. **Rollout priority index**: 18 states scored on six drivers; move the weights and the Wave 2 states update.
2. **Price-ladder simulator**: logit choice model on a 3,000-person synthetic panel; change prices, freezer availability and Amul's entry price.
3. **Freezer payback calculator**: payback by outlet type after trade margins, GST, COGS and cold-chain costs.
4. **Revenue scenarios**: bear, base and bull net revenue by rollout wave to March 2029.

## Files
| Path | Contents |
|---|---|
| `index.html` | The dashboard page |
| `assets/` | Styles, D3.js v7, model data and app logic |
| `data/` | CSV outputs and inputs (synthetic panel and hypothetical parameters are labelled in the report) |

## Publish on GitHub Pages
1. Create a new public repository (for example `bombay-creamery-dashboard`).
2. Upload **all files in this folder** (keep the `assets` and `data` folders) and commit.
3. Go to **Settings > Pages**, set *Source* to `Deploy from a branch`, branch `main`, folder `/ (root)`, and save.
4. After about a minute the dashboard is live at `https://<your-username>.github.io/bombay-creamery-dashboard/`.

## Data note
Market facts are cited in the report. The consumer panel and some state scores are synthetic or hypothetical,
as permitted by the WAI guidelines, and are used for direction and sensitivity, not as forecasts of actual results.
