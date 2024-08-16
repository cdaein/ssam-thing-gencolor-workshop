import {
  Oklab,
  Oklch,
  RGB,
  mix,
  multiColorGradient,
  oklab,
  oklch,
  srgb,
  swatchesH,
} from "@thi.ng/color";
import { group, rect } from "@thi.ng/geom";
import { draw } from "@thi.ng/hiccup-canvas";
import { Smush32 } from "@thi.ng/random";
import type { Sketch, SketchSettings } from "ssam";
import { ssam } from "ssam";

const seed = (Math.random() * 100000000) | 0;
// const seed = 4334828920;
const rnd = new Smush32(seed);

const sketch: Sketch<"2d"> = ({ wrap, context: ctx }) => {
  const procColor = () => {
    return oklch(rnd.minmax(0.5, 0.8), rnd.minmax(0.1, 0.2), rnd.minmax(0, 1));
  };

  const colorA = procColor();
  // rotate its hue and lightness
  const colorB = colorA.copy();
  colorB.h += rnd.minmax(45 / 360, 180 / 360);
  colorB.l += rnd.minmax(-0.2, 0.2);

  const columns = 16;

  const palette =
    columns <= 1
      ? [mix(oklab(), oklab(colorA), oklab(colorB), 0.5)]
      : multiColorGradient({
          num: columns,
          stops: [
            [0, oklab(colorA)],
            [1, oklab(colorB)],
          ],
        });

  wrap.render = ({ width, height }) => {
    draw(
      ctx,
      // swatchesH(palette, width / palette.length, height),
      group(
        {},
        palette.map((col, i) => {
          const tileWidth = Math.ceil(width / palette.length);
          return rect([i * tileWidth, 0], [tileWidth, height], {
            fill: srgb(col),
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
    // colorSpace: "display-p3",
  },
};

ssam(sketch, settings);
