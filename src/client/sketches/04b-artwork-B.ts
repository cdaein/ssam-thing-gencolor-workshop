// Exercise: Apply a procedural palette to an artwork

import { shuffle } from "@thi.ng/arrays";
import { lch, srgb } from "@thi.ng/color";
import { group, Triangle, triangle } from "@thi.ng/geom";
import { draw } from "@thi.ng/hiccup-canvas";
import { Smush32 } from "@thi.ng/random";
import type { Sketch, SketchSettings } from "ssam";
import { ssam } from "ssam";

const seed = (Math.random() * 100000000) | 0;
const rnd = new Smush32(seed);

const sketch: Sketch<"2d"> = ({ wrap, context: ctx }) => {
  const hue = rnd.minmax(0, 1);
  const palette = [
    "#000",
    "#fff",
    lch(0.5, 0.5, hue),
    lch(0.2, 1.5, hue + 45 / 360),
  ];

  wrap.render = ({ width }) => {
    const margin = width * 0.1;
    const innerSize = width - margin * 2;
    const columns = 4;
    const rows = columns;
    const tilePadding = (width * 0.1) / 2;
    let tileSize = (innerSize - tilePadding * (columns - 1)) / columns;

    const shapes: Triangle[] = [];

    for (let row = 0, index = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++, index++) {
        const tx = margin + column * (tileSize + tilePadding);
        const ty = margin + row * (tileSize + tilePadding);

        const u = rnd.minmax(0, 1);
        const v = rnd.minmax(0, 1);
        const point = [u, v];
        const corners = [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ];

        const curColors = shuffle(palette, palette.length, rnd);
        for (let i = 0; i < 4; i++) {
          const color = curColors[i % curColors.length];
          const corner0 = corners[i % corners.length];
          const corner1 = corners[(i + 1) % corners.length];
          const path = [point, corner0, corner1];

          const shp = path.map((p) => {
            return [tx + p[0] * tileSize, ty + p[1] * tileSize];
          });
          shapes.push(triangle(shp, { fill: srgb(color) }));
        }
      }
    }

    draw(ctx, group({ __background: lch(0.9, 0.05, 60 / 360) }, shapes));
  };
};

const settings: SketchSettings = {
  parent: ".sketch-parent",
  dimensions: [1024, 1024],
  pixelRatio: window.devicePixelRatio,
  animate: false,
  suffix: `-${seed}`,
  attributes: {
    // colorSpace: "display-p3",
  },
};

ssam(sketch, settings);
