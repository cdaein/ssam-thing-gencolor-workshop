// Exercise: Apply a procedural palette to an artwork

import {
  css,
  CSS_LEVEL4,
  hsl,
  lch,
  oklab,
  oklch,
  rgb,
  srgb,
} from "@thi.ng/color";
import { circle, group } from "@thi.ng/geom";
import { draw } from "@thi.ng/hiccup-canvas";
import { Smush32, weightedRandom } from "@thi.ng/random";
import type { Sketch, SketchSettings } from "ssam";
import { ssam } from "ssam";

const seed = (Math.random() * 100000000) | 0;
// const seed = 158599924;
const rnd = new Smush32(seed);

const sketch: Sketch<"2d"> = ({ wrap, context: ctx }) => {
  // [hue, weight][]
  const baseHue = Array(3)
    .fill([0, 0])
    .map(() => [rnd.minmax(0, 1), rnd.minmax(0, 100)]);

  const procColor = () => {
    // 0..1
    const h = weightedRandom(
      // get hues
      baseHue.map((h) => h[0]),
      // get weights
      baseHue.map((w) => w[1]),
      rnd,
    )();
    const s = rnd.minmax(0.95, 1);
    const l = weightedRandom(
      [0.1, 0.9, rnd.minmax(0.4, 0.6)],
      [10, 10, 80],
      rnd,
    )();

    // NOTE: @thi.ng/color doesn't have okhsl
    // so take a trip to oklab
    // color still looks a bit harsh.
    return css(oklab(hsl(h, s, l)), CSS_LEVEL4);
  };

  const count = 100;
  const palette = Array(count)
    .fill(srgb())
    .map(() => {
      return procColor();
    });

  wrap.render = ({ width, height }) => {
    const margin = width * 0.2;

    draw(
      ctx,
      group(
        { __background: lch(0.9, 0.05, 60 / 360) },
        palette.map((fill) => {
          const r = width * 0.03;
          return circle(
            [
              rnd.minmax(margin, width - margin),
              rnd.minmax(margin, height - margin),
            ],
            r,
            {
              fill,
            },
          );
        }),
      ),
    );
  };
};

const settings: SketchSettings = {
  parent: ".sketch-parent",
  dimensions: [1024, 1024],
  pixelRatio: window.devicePixelRatio,
  animate: false,
  suffix: `-${seed}`,
  attributes: {
    colorSpace: "display-p3",
  },
};

ssam(sketch, settings);
