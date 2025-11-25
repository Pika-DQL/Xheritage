<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1zKMbMPWfTua0gQm_tK4zJU5UGDLFBQu2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Open the app directly from an HTML file

To double-click and open the built app without running a dev server:

1. Build a static bundle with `npm run build`.
2. In the generated `dist` folder, double-click `index.html` to open it in your browser. The Vite `base` setting has been configured for relative assets so the page loads correctly from the file system.
