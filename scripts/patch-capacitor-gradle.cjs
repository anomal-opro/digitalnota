#!/usr/bin/env node
/**
 * scripts/patch-capacitor-gradle.cjs
 *
 * Patches Capacitor library build.gradle files to be compatible with AGP 8.13+.
 * Uses targeted string replacement (not regex) for known problematic lines.
 */

const fs = require('fs');
const path = require('path');

function patchFile(filePath, replacements) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    console.log(`  [skip]    Not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(abs, 'utf8');
  const original = content;

  for (const [find, replace] of replacements) {
    content = content.split(find).join(replace);
  }

  if (content !== original) {
    fs.writeFileSync(abs, content, 'utf8');
    console.log(`  [patched] ${filePath}`);
  } else {
    console.log(`  [clean]   ${filePath}`);
  }
}

// ─── @capacitor/android/capacitor/build.gradle ───────────────────────────────
patchFile('node_modules/@capacitor/android/capacitor/build.gradle', [
  // defaultConfig: space-assignment -> = assignment
  ["        minSdkVersion project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 24",
   "        minSdk = project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 24"],
  ["        targetSdkVersion project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 36",
   "        targetSdk = project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 36"],
  ['        versionCode 1',  '        versionCode = 1'],
  ['        versionName "1.0"', '        versionName = "1.0"'],
  // buildTypes.release
  ['            minifyEnabled false', '            minifyEnabled = false'],
  ["            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'",
   "            proguardFiles(getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro')"],
  // lintOptions -> lint
  ['    lintOptions {', '    lint {'],
]);

// ─── @capacitor/filesystem/android/build.gradle ──────────────────────────────
patchFile('node_modules/@capacitor/filesystem/android/build.gradle', [
  ["        minSdkVersion project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 24",
   "        minSdk = project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 24"],
  ["        targetSdkVersion project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 36",
   "        targetSdk = project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 36"],
  ['        versionCode 1',  '        versionCode = 1'],
  ['        versionName "1.0"', '        versionName = "1.0"'],
  ['            minifyEnabled false', '            minifyEnabled = false'],
  ["            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'",
   "            proguardFiles(getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro')"],
  ['    lintOptions {', '    lint {'],
]);

// ─── android/capacitor-cordova-android-plugins/build.gradle (cap sync gen) ───
patchFile('android/capacitor-cordova-android-plugins/build.gradle', [
  ["        minSdkVersion project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 24",
   "        minSdk = project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 24"],
  ["        targetSdkVersion project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 36",
   "        targetSdk = project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 36"],
  ['        versionCode 1',  '        versionCode = 1'],
  ['        versionName "1.0"', '        versionName = "1.0"'],
  ['            minifyEnabled false', '            minifyEnabled = false'],
  ['    lintOptions {', '    lint {'],
]);

console.log('[patch-capacitor-gradle] Done.');
