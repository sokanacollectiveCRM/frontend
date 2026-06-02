import fs from 'node:fs';
import path from 'node:path';
import type { Locator, Page } from '@playwright/test';
import { SCREENSHOT_OUTPUT_DIR } from '../config';
import { stabilizePage } from './waits';

export type CaptureOptions = {
  /** Subfolder under sokana-all-screenshots (optional). */
  subdir?: string;
  /** Wait for UI/network settle before capture. Default true. */
  stabilize?: boolean;
  /** Playwright screenshot animations flag. */
  animations?: 'disabled' | 'allow';
  /** Mask dynamic regions (spinners, timestamps). */
  mask?: Locator[];
};

/**
 * Ensures the centralized screenshot directory exists.
 */
export function ensureScreenshotDir(subdir?: string): string {
  const dir = subdir
    ? path.join(SCREENSHOT_OUTPUT_DIR, subdir)
    : SCREENSHOT_OUTPUT_DIR;
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function resolveFilePath(filename: string, subdir?: string): string {
  const safeName = filename.endsWith('.png') ? filename : `${filename}.png`;
  const dir = ensureScreenshotDir(subdir);
  return path.join(dir, safeName);
}

/**
 * Full-page portfolio capture with stabilization and consistent PNG output.
 */
export async function captureFullPage(
  page: Page,
  filename: string,
  options: CaptureOptions = {}
): Promise<string> {
  const filePath = resolveFilePath(filename, options.subdir);
  if (options.stabilize !== false) {
    await stabilizePage(page);
  }
  await page.screenshot({
    path: filePath,
    fullPage: true,
    animations: options.animations ?? 'disabled',
    mask: options.mask,
  });
  return filePath;
}

/**
 * Element-scoped capture (KPI row, sidebar, modal panel, etc.).
 */
export async function captureElement(
  locator: Locator,
  filename: string,
  options: CaptureOptions = {}
): Promise<string> {
  const page = locator.page();
  const filePath = resolveFilePath(filename, options.subdir);
  if (options.stabilize !== false) {
    await stabilizePage(page);
  }
  await locator.screenshot({
    path: filePath,
    animations: options.animations ?? 'disabled',
    mask: options.mask,
  });
  return filePath;
}
