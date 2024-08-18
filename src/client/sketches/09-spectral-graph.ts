import { contrast } from "@thi.ng/color";
import { group, pathBuilder } from "@thi.ng/geom";
import { draw } from "@thi.ng/hiccup-canvas";
import { Smush32, pickRandom } from "@thi.ng/random";
import type { Sketch, SketchSettings } from "ssam";
import { ssam } from "ssam";
import ColorChecker from "../spectra/colorchecker";
import { spectra_to_sRGB } from "../spectra/spectra";

const width = 512;
const height = 256;

const seed = (Math.random() * 100000000) | 0;
const rnd = new Smush32(seed);

const sketch: Sketch<"2d"> = ({ wrap, context: ctx, width, height }) => {
  const data = pickRandom(ColorChecker, rnd);
  const spd = data.spd;

  const outColor = spectra_to_sRGB(spd).map((ch) => ch / 255);

  const path = pathBuilder({
    stroke: contrast(outColor, "white") < 2 ? "black" : "white",
    weight: 4,
  });
  spd.forEach((x, i) =>
    path.lineTo([(i / (spd.length - 1)) * width, height - height * x]),
  );

  wrap.render = () => {
    draw(ctx, group({ __background: outColor }, path));
  };
};

const settings: SketchSettings = {
  parent: ".sketch-parent",
  dimensions: [width, height],
  pixelRatio: window.devicePixelRatio,
  animate: false,
  suffix: `-${seed}`,
  attributes: {
    colorSpace: "display-p3",
  },
};

ssam(sketch, settings);
