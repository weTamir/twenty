import { type Messages } from '@lingui/core';

// Hamania white-label safety net: `lingui extract --overwrite` in the Docker build resets en.po,
// so the product name is replaced in the loaded catalog. Hebrew wording lives in he-IL.po.
const HAMANIA_BRAND_NAME_BY_LOCALE: Record<string, string> = {
  'he-IL': 'החמניה',
};
const HAMANIA_DEFAULT_BRAND_NAME = 'Hamania';

const replaceBrandName = (value: unknown, brandName: string): unknown => {
  if (typeof value === 'string') {
    return value.replace(/\bTwenty\b/g, brandName);
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceBrandName(item, brandName));
  }

  return value;
};

export const hamaniaBrandMessages = (
  locale: string,
  messages: Messages,
): Messages => {
  const brandName =
    HAMANIA_BRAND_NAME_BY_LOCALE[locale] ?? HAMANIA_DEFAULT_BRAND_NAME;

  return Object.fromEntries(
    Object.entries(messages).map(([id, message]) => [
      id,
      replaceBrandName(message, brandName) as Messages[string],
    ]),
  );
};
