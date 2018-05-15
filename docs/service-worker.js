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
  "./precache-manifest.9c8e6a24112401c3da1b3516041fc89a.js"
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
    "revision": "d9889f252f5b7fee3770975f0fb2ee71"
  },
  {
    "url": "precache-manifest.167961a0b77f9bfc5372ef4d8a93995a.js",
    "revision": "167961a0b77f9bfc5372ef4d8a93995a"
  },
  {
    "url": "precache-manifest.7d2ece29d5f09f5186e00de6db1b72d0.js",
    "revision": "7d2ece29d5f09f5186e00de6db1b72d0"
  },
  {
    "url": "precache-manifest.babb609034c544ae9f555ecc6065bff4.js",
    "revision": "babb609034c544ae9f555ecc6065bff4"
  },
  {
    "url": "service-worker.js",
    "revision": "1b443b9b2af937a053602a20a2b38c5c"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
