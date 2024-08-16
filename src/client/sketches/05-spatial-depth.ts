// Exercise: Create a pair-generator that is harmonious

import { oklch } from "@thi.ng/color";
import { group, Rect, rect } from "@thi.ng/geom";
import { draw } from "@thi.ng/hiccup-canvas";
import { normal, pickRandom, Smush32 } from "@thi.ng/random";
import type { Sketch, SketchSettings } from "ssam";
import { ssam } from "ssam";

const seed = (Math.random() * 100000000) | 0;
const rnd = new Smush32(seed);

const aspect = 1.414;
const width = 1024;
const height = 1024 * aspect;

const sketch: Sketch<"2d"> = ({ wrap, context: ctx }) => {
  const baseHue = rnd.minmax(0, 1);
  const hues = [baseHue, baseHue + 0.25];

  function procColor() {
    // 20% chance of extremely white tint
    const lOffset = rnd.probability(0.2) ? 0.5 : 0;
    const l = lOffset + rnd.minmax(0.2, 0.8);
    const c = rnd.minmax(0.1, 0.3);
    const h = pickRandom(hues, rnd);
    return oklch(l, c, h);
  }

  function procBackground() {
    const l = rnd.minmax(0.9, 0.95);
    const c = rnd.minmax(0.0, 0.026);
    const h = rnd.minmax(0.0, 105 / 360);
    return oklch(l, c, h);
  }

  const count = 100;

  wrap.render = ({ width, height }) => {
    const margin = width * 0.2;

    const shapes: Rect[] = [];

    const gauss = normal(rnd, 0, 1);
    for (let i = 0; i < count; i++) {
      const w = width * 0.1 * Math.abs(gauss());
      const h = width * 0.1 * Math.abs(gauss());

      // random point, but then offset by half rect size
      // so they appear centred
      const x = rnd.minmax(margin, width - margin) - w / 2;
      const y = rnd.minmax(margin, height - margin) - h / 2;

      const color = procColor();
      const shp = rect([x, y], [w, h], {
        fill: color,
        stroke: color,
        weight: width * 0.015,
        lineJoin: "round",
      });
      shapes.push(shp);
    }

    shapes.sort((a, b) => a.attribs?.fill.l - b.attribs?.fill.l);

    draw(
      ctx,
      group(
        {
          __background: procBackground(),
          transform: [1, 0.2, 0.0, 1, 0, -height * 0.05],
        },
        shapes,
      ),
    );
  };
};

const settings: SketchSettings = {
  parent: ".sketch-parent",
  dimensions: [width, height],
  pixelRatio: window.devicePixelRatio,
  animate: false,
  suffix: `-${seed}`,
  attributes: {
    // colorSpace: "display-p3",
  },
};

ssam(sketch, settings);
