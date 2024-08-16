import { contrast, oklch, srgb } from "@thi.ng/color";
import { group, Line, line } from "@thi.ng/geom";
import { draw } from "@thi.ng/hiccup-canvas";
import { Smush32 } from "@thi.ng/random";
import type { Sketch, SketchSettings } from "ssam";
import { ssam } from "ssam";

const seed = (Math.random() * 100000000) | 0;
const rnd = new Smush32(seed);

const width = 512;
const height = 512;

const sketch: Sketch<"2d"> = ({ wrap, context: ctx, width, height }) => {
  const hue = rnd.minmax(0, 1);
  const chroma = rnd.minmax(0, 0.37);
  const light = rnd.minmax(0, 1);

  const col = oklch([light, chroma, hue]);

  const c1 = contrast(col, "black");
  const c2 = contrast(col, "white");
  const foreground = c1 > c2 ? "black" : "white";

  const margin = 0.1 * width;

  const shapes: Line[] = [];

  for (let i = 0; i < 40; i++) {
    const x = rnd.minmax(margin, width - margin);
    const y = rnd.minmax(margin, height - margin);
    const r = width * 0.05;
    const angle = rnd.minmax(0, Math.PI * 2);
    const ln = line(
      [x - Math.cos(angle) * r, y - Math.sin(angle) * r],
      [x + Math.cos(angle) * r, y + Math.sin(angle) * r],
    );

    shapes.push(ln);
  }

  wrap.render = ({ width }) => {
    draw(
      ctx,
      group(
        {
          __background: srgb(col),
          stroke: foreground,
          fill: foreground,
          weight: width * 0.01,
          lineJoin: "round",
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
