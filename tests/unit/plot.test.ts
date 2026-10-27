import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  computeRangeInWindow,
  computeSharedRange,
  panTimeWindow,
  relativeArrivalSec,
  seriesKey,
  zoomTimeWindow,
} from "../../plugins/plot/plotMath";

describe("Plot plugin math and windowing", () => {
  it("uses one relative arrival-time domain for every topic", () => {
    assert.equal(relativeArrivalSec(12_500, 10_000), 2.5);
    assert.equal(relativeArrivalSec(9_000, 10_000), 0);
  });

  it("fits all visible finite values with padding", () => {
    assert.deepEqual(computeSharedRange([[0, 10], [-5, Number.NaN]], 0.05), [-5.75, 10.75]);
  });

  it("falls back when no visible finite values exist", () => {
    assert.deepEqual(computeSharedRange([[], [Number.NaN]]), [-1, 1]);
  });

  it("builds an unambiguous duplicate key", () => {
    assert.equal(seriesKey("/odom", "twist.linear.x"), "/odom\0twist.linear.x");
  });

  it("zooms time window anchored at cursor time", () => {
    const zoomed = zoomTimeWindow([10, 30], 20, 0.5);
    assert.ok(Math.abs(zoomed[1] - zoomed[0] - 10) < 1e-4);
    assert.ok(Math.abs(zoomed[0] - 15) < 1e-4);
    assert.ok(Math.abs(zoomed[1] - 25) < 1e-4);
  });

  it("pans time window without altering span", () => {
    assert.deepEqual(panTimeWindow([10, 30], 5), [15, 35]);
  });

  it("computes range in window correctly", () => {
    const series = [
      { ts: [1, 2, 3, 4], vs: [10, 20, 30, 40], visible: true },
      { ts: [1, 2, 3, 4], vs: [-10, -20, -30, -40], visible: false },
    ];
    assert.deepEqual(computeRangeInWindow(series, [1.5, 3.5], 0), [20, 30]);
  });
});
