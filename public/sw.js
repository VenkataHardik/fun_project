// Minimal service worker to satisfy /sw.js requests (avoids 404 in console/terminal).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
