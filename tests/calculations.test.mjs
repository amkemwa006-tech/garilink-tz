import test from "node:test";
import assert from "node:assert/strict";

const monthlyPayment = (price, depositPct, annualRate, years) => {
  const principal = price * (1 - depositPct / 100);
  const rate = annualRate / 1200;
  const count = years * 12;
  return Math.round(principal * rate * (1 + rate) ** count / ((1 + rate) ** count - 1));
};
test("finance payment is positive and accounts for deposit", () => {
  assert.equal(monthlyPayment(65000000, 20, 16, 5), 1264539);
  assert.ok(monthlyPayment(65000000, 0, 16, 5) > monthlyPayment(65000000, 20, 16, 5));
});
test("TZS formatting uses a readable local prefix", () => {
  const value = new Intl.NumberFormat("en-TZ", {style:"currency",currency:"TZS",maximumFractionDigits:0}).format(42500000).replace("TZS","TSh");
  assert.match(value, /TSh/);
  assert.match(value, /42/);
});
