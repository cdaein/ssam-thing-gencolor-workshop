import { css, CSS_LEVEL4, Oklch, oklch, srgb } from "@thi.ng/color";
import { group, rect } from "@thi.ng/geom";
import { draw } from "@thi.ng/hiccup-canvas";
import { Smush32 } from "@thi.ng/random";
import type { Sketch, SketchSettings } from "ssam";
import { ssam } from "ssam";

const seed = (Math.random() * 100000000) | 0;
const rnd = new Smush32(seed);

const sketch: Sketch<"2d"> = ({ wrap, context: ctx }) => {
  const hue = rnd.minmax(0, 1);
  const hueOffset = 0.5;
  const light = 0.5;
  const chroma = 0.3;

  const palette: Oklch[] = [];
  palette.push(oklch(light, chroma, hue));
  palette.push(oklch(light + 0.2, chroma, hue));
  palette.push(oklch(light + 0.4, chroma, hue));
  palette.push(oklch(light + 0.4, chroma, hue + hueOffset));
  palette.push(oklch(light + 0.2, chroma, hue + hueOffset));
  palette.push(oklch(light, chroma, hue + hueOffset));

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
