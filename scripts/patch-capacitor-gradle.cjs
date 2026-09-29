#!/usr/bin/env node
/**
 * scripts/patch-capacitor-gradle.cjs
 *
 * Patches Capacitor library build.gradle files to be compatible with AGP 8.13+.
 * Uses targeted string replacement & regex to fix space-assignment deprecations and strict lint.
 */

const fs = require('fs');
const path = require('path');

function patchGradleFile(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    console.log(`  [skip]    Not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(abs, 'utf8');
  const original = content;

  // 1. Fix space-assignments in defaultConfig
  content = content.replace(/^([ \t]*)minSdkVersion[ \t]+(project\.hasProperty[^\r\n]+)/gm, '$1minSdk = $2');
  content = content.replace(/^([ \t]*)minSdkVersion[ \t]+(\d+)/gm, '$1minSdk = $2');
  content = content.replace(/^([ \t]*)targetSdkVersion[ \t]+(project\.hasProperty[^\r\n]+)/gm, '$1targetSdk = $2');
  content = content.replace(/^([ \t]*)targetSdkVersion[ \t]+(\d+)/gm, '$1targetSdk = $2');
  content = content.replace(/^([ \t]*)versionCode[ \t]+(\d+)/gm, '$1versionCode = $2');
  content = content.replace(/^([ \t]*)versionName[ \t]+("[^"]*")/gm, '$1versionName = $2');
  content = content.replace(/^([ \t]*)testInstrumentationRunner[ \t]+("[^"]*")/gm, '$1testInstrumentationRunner = $2');

  // 2. Fix buildTypes space-assignments
  content = content.replace(/^([ \t]*)minifyEnabled[ \t]+(false|true)/gm, '$1minifyEnabled = $2');
  // Fix proguardFiles without parentheses: proguardFiles getDefaultProguardFile(...), '...'
  content = content.replace(
    /([ \t]*)proguardFiles[ \t]+getDefaultProguardFile\(([^)]+)\),[ \t]*('[^']+'|"[^"]+")/g,
    "$1proguardFiles(getDefaultProguardFile($2), $3)"
  );

  // 3. Fix lintOptions -> lint
  content = content.replace(/([ \t]*)lintOptions[ \t]*\{/g, '$1lint {');

  // 4. Disable strict lint failures (abortOnError, warningsAsErrors)
  content = content.replace(/abortOnError[ \t]*=[ \t]*true/g, 'abortOnError = false');
  content = content.replace(/warningsAsErrors[ \t]*=[ \t]*true/g, 'warningsAsErrors = false');

  if (content !== original) {
    fs.writeFileSync(abs, content, 'utf8');
    console.log(`  [patched] ${filePath}`);
  } else {
    console.log(`  [clean]   ${filePath}`);
  }
}

console.log('[patch-capacitor-gradle] Starting patch for AGP 8.13+ compatibility...');
patchGradleFile('node_modules/@capacitor/android/capacitor/build.gradle');
patchGradleFile('node_modules/@capacitor/filesystem/android/build.gradle');
patchGradleFile('android/capacitor-cordova-android-plugins/build.gradle');
console.log('[patch-capacitor-gradle] Done.');
