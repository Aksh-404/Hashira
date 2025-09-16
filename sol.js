// solve.js
// Usage: node solve.js input.json

const fs = require("fs");

// Convert string in base->BigInt decimal
function parseValue(str, base) {
  const digits = str.toLowerCase().split("");
  const map = {};
  "0123456789abcdefghijklmnopqrstuvwxyz".split("").forEach((ch, i) => {
    map[ch] = BigInt(i);
  });
  let result = 0n;
  let b = BigInt(base);
  for (let d of digits) {
    if (!(d in map) || map[d] >= b) throw new Error(`Invalid digit ${d} for base ${base}`);
    result = result * b + map[d];
  }
  return result;
}

// gcd for BigInt
function gcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

// reduce rational
function reduce(num, den) {
  if (den < 0n) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den);
  return [num / g, den / g];
}

// add fractions
function addFrac(aNum, aDen, bNum, bDen) {
  let num = aNum * bDen + bNum * aDen;
  let den = aDen * bDen;
  return reduce(num, den);
}

// Lagrange interpolation at X=0
function lagrangeAtZero(points) {
  let resNum = 0n, resDen = 1n;
  const m = points.length;
  for (let i = 0; i < m; i++) {
    let num = 1n, den = 1n;
    for (let j = 0; j < m; j++) {
      if (i === j) continue;
      num *= -points[j].x;         // (0 - xj)
      den *= (points[i].x - points[j].x);
    }
    let termNum = points[i].y * num;
    let termDen = den;
    [resNum, resDen] = addFrac(resNum, resDen, termNum, termDen);
  }
  if (resDen === 1n) return resNum;
  if (resNum % resDen === 0n) return resNum / resDen;
  return { num: resNum, den: resDen }; // fallback rational
}

function main() {
  const infile = process.argv[2] || "input.json";
  const raw = fs.readFileSync(infile, "utf8");
  const j = JSON.parse(raw);

  const n = j.keys.n;
  const k = j.keys.k;

  const points = [];
  for (let key in j) {
    if (key === "keys") continue;
    const entry = j[key];
    const x = BigInt(key);
    const y = parseValue(entry.value, parseInt(entry.base));
    points.push({ x, y });
  }

  // Just take first k points
  const subset = points.slice(0, k);

  const c = lagrangeAtZero(subset);
  console.log("Constant term c =", c.toString());
}

main();
