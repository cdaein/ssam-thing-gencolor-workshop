import { lerp } from "@daeinc/math";
import { rgb, srgb, wavelengthXyz } from "@thi.ng/color";
import { group, rect } from "@thi.ng/geom";
import { draw } from "@thi.ng/hiccup-canvas";
import type { Sketch, SketchSettings } from "ssam";
import { ssam } from "ssam";

const width = 1024;
const height = 256;

const sketch: Sketch<"2d"> = ({ wrap, context: ctx, width, height }) => {
  const steps = width;

  wrap.render = () => {
    draw(
      ctx,
      group(
        {
          __background: srgb(`gray`),
        },
        Array.from({ length: steps }, (_, i) => {
          const u = i / (steps - 1);
          const outColor = srgb(rgb(wavelengthXyz(null, lerp(400, 700, u))));
          const sliceWidth = Math.round((1 / steps) * width);
          const shp = rect([sliceWidth * i, 0], [sliceWidth, height], {
            stroke: outColor,
            fill: outColor,
          });

          return shp;
        }),
      ),
    );
  };
};

const settings: SketchSettings = {
  parent: ".sketch-parent",
  dimensions: [width, height],
  pixelRatio: window.devicePixelRatio,
  animate: false,
  attributes: {
    // colorSpace: "display-p3",
  },
};

ssam(sketch, settings);
