# Todo Demo

A deliberately small todo app used to show [TestDriver](https://testdriver.ai) reviewing pull requests the way a real user would: opening the app, clicking through it, and reporting what breaks.

## What to look at

Browse the [pull requests](../../pulls?q=is%3Apr) to see TestDriver in action:

- **Merged PRs**: features that TestDriver tested and approved before they shipped.
- **Open PRs with bugs**: unit tests and CI are green and the diffs look like harmless polish, but the app is broken when you actually use it. TestDriver catches both by running the app and shows a replay of what went wrong.
- **Open PR that's good to go**: a clean feature TestDriver verified end to end.

## Run it

```bash
npm start   # http://localhost:3000
npm test    # unit tests
```

No build step and no dependencies. Todos are saved in your browser's localStorage.
