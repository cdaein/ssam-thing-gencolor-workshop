// Exercise: Work with 3 LCH colors keyed to different axes
//
// Picker:
// https://lch.oklch.com/

// https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/lch

import { lch, oklch, srgb } from "@thi.ng/color";
import { group, rect } from "@thi.ng/geom";
import { draw } from "@thi.ng/hiccup-canvas";
import type { Sketch, SketchSettings } from "ssam";
import { ssam } from "ssam";

const sketch: Sketch<"2d"> = ({ wrap, context: ctx }) => {
  // @thi.ng/color uses 0..1 range
  const cols = [
    oklch(0.9059, 0.205, 105.16 / 360),
    lch(50 / 100, 50 / 100, 40 / 360),
    lch(80 / 100, 50 / 100, 40 / 360),
  ];

  wrap.render = ({ width, height }) => {
    draw(
      ctx,
      group({}, [
        rect([0, 0], [width / 2, height], { fill: srgb(cols[0]) }),
        rect([width / 2, 0], [width / 2, height / 2], { fill: srgb(cols[1]) }),
        rect([width / 2, height / 2], [width / 2, height / 2], {
          fill: srgb(cols[2]),
        }),
      ]),
    );
  };
};

const settings: SketchSettings = {
  parent: ".sketch-parent",
  dimensions: [256, 256],
  pixelRatio: window.devicePixelRatio,
  animate: false,
  // attributes: {
  // colorSpace: "display-p3",
  // },
};

ssam(sketch, settings);
