// @flow
/* These are helpers that deal with the insertRule (aka speedy) API
 * They are used in the StyleTags and specifically the speedy tag
 */

/* retrieve a sheet for a given style tag */
export const sheetForTag = (tag: HTMLStyleElement): CSSStyleSheet => {
  // $FlowFixMe
  if (tag.sheet) return tag.sheet

  /* Firefox quirk requires us to step through all stylesheets to find one owned by the given tag */
  const size = document.styleSheets.length
  for (let i = 0; i < size; i += 1) {
    const sheet = document.styleSheets[i]
    // $FlowFixMe
    if (sheet.ownerNode === tag) return sheet
  }

  /* we should always be able to find a tag */
  throw new Error()
}

/* insert a rule safely and return whether it was actually injected */
const safeInsertRule = (
  sheet: CSSStyleSheet,
  cssRule: string,
  index: number
): boolean => {
  /* abort early if cssRule string is falsy */
  if (!cssRule) return false

  const maxIndex = sheet.cssRules.length

  try {
    /* use insertRule and cap passed index with maxIndex (no of cssRules) */
    sheet.insertRule(cssRule, index <= maxIndex ? index : maxIndex)
  } catch (err) {
    /* any error indicates an invalid rule */
    return false
  }

  return true
}

/* insert multiple rules using safeInsertRule */
export const safeInsertRules = (
  sheet: CSSStyleSheet,
  cssRules: string[],
  insertIndex: number
): number => {
  /* inject each rule and count up the number of actually injected ones */
  let injectedRules = 0
  const cssRulesSize = cssRules.length
  for (let i = 0; i < cssRulesSize; i += 1) {
    const cssRule = cssRules[i]
    if (safeInsertRule(sheet, cssRule, insertIndex + injectedRules)) {
      injectedRules += 1
    }
  }

  /* return number of injected rules */
  return injectedRules
}

/* deletes `size` rules starting from `removalIndex` */
export const deleteRules = (
  sheet: CSSStyleSheet,
  removalIndex: number,
  size: number
) => {
  const lowerBound = removalIndex - size
  for (let i = removalIndex; i >= lowerBound; i -= 1) {
    sheet.deleteRule(i)
  }
}
