import { map } from "@daeinc/math";
import {
  css,
  CSS_LEVEL4,
  LCH,
  lch,
  multiColorGradient,
  srgb,
} from "@thi.ng/color";
import { group, rect } from "@thi.ng/geom";
import { draw } from "@thi.ng/hiccup-canvas";
import { Smush32 } from "@thi.ng/random";
import type { Sketch, SketchSettings } from "ssam";
import { ssam } from "ssam";

const seed = (Math.random() * 100000000) | 0;
const rnd = new Smush32(seed);

const sketch: Sketch<"2d"> = ({ wrap, context: ctx }) => {
  const hue = rnd.minmax(0, 1);

  const columns = 6;
  const palette: LCH[] = [];

  for (let i = 0; i < columns; i++) {
    // get U coordinates between 0..1 for the X axis
    const u = columns <= 1 ? 0.5 : i / (columns - 1);
    // Construct procedural palette
    const L = map(u, 0, 1, 0.25, 0.95);
    const C = map(u, 0, 1, 1, 0.15);
    const H = hue;
    palette.push(lch(L, C, H));
  }

  wrap.render = ({ width, height }) => {
    draw(
      ctx,
      group(
        {},
        palette.map((col, i) => {
          const tileWidth = Math.ceil(width / palette.length);
          return rect([i * tileWidth, 0], [tileWidth, height], {
            fill: css(col, CSS_LEVEL4),
          });
        }),
      ),
    );
  };
};

const settings: SketchSettings = {
  parent: ".sketch-parent",
  dimensions: [256, 128],
  pixelRatio: window.devicePixelRatio,
  animate: false,
  suffix: `-${seed}`,
  attributes: {
    colorSpace: "display-p3",
  },
};

ssam(sketch, settings);
