Smart Gallery Pro: Project Documentation
1. Project Overview

A minimalist, high-performance image viewer built with React Native and Expo. The app provides a "glassmorphism" home screen with a custom background and a functional gallery viewer that extracts technical metadata from local images.

2. Core Technical Architecture

Framework: Expo SDK (Managed Workflow).

Language: JavaScript (ES6+).

Image Handling: Uses react-native-image-zoom-viewer for pinch-to-zoom and swiping capabilities.

Permissions: Uses expo-image-picker to access the system photo library.

3. Custom Logic & Bug Fixes

These are the specific "manual" fixes we implemented to ensure a professional feel:

Metadata Extraction: Uses expo-file-system to get the file size and Image.getSize to calculate resolution and Megapixels.

First-Image Sync: Logic was added to pickImages to manually trigger getBasicDetails for the very first image. This prevents the "Info" panel from appearing empty until the user swipes.

Android Hardware Navigation: Integrated BackHandler from react-native. When the image viewer is open, the physical "Back" button on the phone closes the viewer instead of exiting the app.

System UI: Uses expo-navigation-bar to set the bottom navigation bar to white with dark icons for a modern Android look.

4. Code Structure Guide

File / Folder	Purpose
App.js	Contains 100% of the app logic, UI, and styles.
/assets/fuji.jpg	High-res background image (optimized for performance).
/assets/icon.png	App icon (optimized to ~100KB).
package.json	List of all installed libraries and their versions.
