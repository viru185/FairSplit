# FairSplit

FairSplit helps roommates, housemates, or small households split their electricity bill fairly and transparently.

## Overview

FairSplit is a small web app that calculates each person's share of an electricity bill based on configurable usage and cost-sharing rules. It is designed to be simple, privacy-friendly (runs locally in the browser), and lightweight — no backend required.

## Features

-   Simple, client-side UI: open `index.html` and run locally.
-   Multiple people: add household members and their usage figures.
-   Custom billing: set total bill amount, fixed fees, and per-user adjustments.
-   Export/print results: copy the breakdown or share to WhatsApp or print the page for records.

## Why FairSplit

Splitting utility bills by headcount can be unfair when usage differs between people. FairSplit provides a configurable, transparent way to allocate costs so each person pays their fair share.

## Contents

-   `index.html` — main UI
-   `script.js` — front-end logic and calculations
-   `style.css` — styling
-   `assets/` — images or icons (if any)

## Quickstart

Option 1 — Open locally (simplest):

1. Double-click `index.html` to open it in your browser.

Option 2 — Run a local static server (recommended for modern browser behaviors):

`python -m http.server 8000`

Then open `http://localhost:8000` in your browser.

Or use an editor extension like Live Server in VS Code.

## Usage

1. Open the app in your browser.
2. Enter either unit or total electricity bill.
3. Add members and enter each person's usage (how many day a person sayed).
4. Review the calculated shares — you can copy or share to WhatsApp.

## How it works (brief)

The app accepts per-person usage numbers (in days) and allocates the bill proportionally. Unit will be calculate to bill or vice versa and bill will be split among the people. The calculation is done entirely in the browser using `script.js`.

## Development

To modify the app:

-   Edit `index.html` for structure and markup.
-   Edit `style.css` to change appearance.
-   Edit `script.js` to adjust calculation logic.

Suggested workflow:

1. Open the project in your editor (e.g., VS Code).
2. Serve with `python -m http.server` or Live Server.
3. Make changes and refresh the browser.

## Contributing

Contributions are welcome. Please open an issue for feature requests or bugs. For code contributions, fork the repo and submit a pull request with a clear description of the change.

## License

This project includes a [`LICENSE`](/LICENSE) file in the repository. Refer to it for license details.

## Contact

If you have questions or suggestions, open an issue or contact the maintainer.
