const ans = {};

for (let i = 0; i < document.styleSheets.length; ++i) {
  const styleSheet = document.styleSheets[i];
  if (
    styleSheet.href !== null &&
    !styleSheet.href.startsWith(window.location.origin)
  ) {
    continue;
  }

  for (let j = 0; j < styleSheet.cssRules.length; ++j) {
    const rule = styleSheet.cssRules[j];
    if (rule.selectorText !== ':root') {
      continue;
    }

    for (let k = 0; k < rule.style.length; ++k) {
      const style = rule.style[k];
      if (!style.startsWith('--')) {
        continue;
      }

      ans[style] = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue(style)
        .trim();
    }
  }
}

export { ans as default };
