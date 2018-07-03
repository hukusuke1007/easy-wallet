/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js");

importScripts(
  "./precache-manifest.b740750f57fdecb5ad33afdea363133d.js"
);

workbox.core.setCacheNameDetails({prefix: "easy-wallet"});

workbox.skipWaiting();
workbox.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "index.html",
    "revision": "28bbee8df3ed624a0e2da1fed496bd1a"
  },
  {
    "url": "precache-manifest.0a8bcb831bc68f40d4aea1a797d66e71.js",
    "revision": "0a8bcb831bc68f40d4aea1a797d66e71"
  },
  {
    "url": "precache-manifest.167961a0b77f9bfc5372ef4d8a93995a.js",
    "revision": "167961a0b77f9bfc5372ef4d8a93995a"
  },
  {
    "url": "precache-manifest.20b791ed8dc6749a558e69edaf60fcfa.js",
    "revision": "20b791ed8dc6749a558e69edaf60fcfa"
  },
  {
    "url": "precache-manifest.2326ea0c6a487f9ae67cd6696d45f337.js",
    "revision": "2326ea0c6a487f9ae67cd6696d45f337"
  },
  {
    "url": "precache-manifest.3efed0ea2638f84a2ee82abc4c122963.js",
    "revision": "3efed0ea2638f84a2ee82abc4c122963"
  },
  {
    "url": "precache-manifest.7d2ece29d5f09f5186e00de6db1b72d0.js",
    "revision": "7d2ece29d5f09f5186e00de6db1b72d0"
  },
  {
    "url": "precache-manifest.9c8e6a24112401c3da1b3516041fc89a.js",
    "revision": "9c8e6a24112401c3da1b3516041fc89a"
  },
  {
    "url": "precache-manifest.a9d2ab98cd58d1d350cfc9e1c1a8cbf9.js",
    "revision": "a9d2ab98cd58d1d350cfc9e1c1a8cbf9"
  },
  {
    "url": "precache-manifest.babb609034c544ae9f555ecc6065bff4.js",
    "revision": "babb609034c544ae9f555ecc6065bff4"
  },
  {
    "url": "precache-manifest.c8d1817add2252068d4e44b12ce67d20.js",
    "revision": "c8d1817add2252068d4e44b12ce67d20"
  },
  {
    "url": "precache-manifest.f42ac70b8bc65955f5e1ab84c6688805.js",
    "revision": "f42ac70b8bc65955f5e1ab84c6688805"
  },
  {
    "url": "service-worker.js",
    "revision": "271e92d37c7f624b5e4c908490c52901"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
