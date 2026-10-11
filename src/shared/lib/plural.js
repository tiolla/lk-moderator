export function plural(n, forms) {
  const m = n % 100
  const k = n % 10
  const form = (m > 10 && m < 20) || k === 0 || k > 4 ? forms[2] : k === 1 ? forms[0] : forms[1]
  return n + ' ' + form
}

