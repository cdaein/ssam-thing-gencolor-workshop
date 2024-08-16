import { shuffle } from "@thi.ng/arrays";
import { group, Rect, rect } from "@thi.ng/geom";
import { draw } from "@thi.ng/hiccup-canvas";
import { Smush32 } from "@thi.ng/random";
import { Sketch, SketchSettings, ssam } from "ssam";
import ColorChecker from "../spectra/colorchecker";
import * as spectra from "../spectra/spectra";
import { interpolateArray } from "@daeinc/geom";

const width = 1024;
const height = 512;

const seed = (Math.random() * 10000000) | 0;
const rnd = new Smush32(seed);

const sketch: Sketch<"2d"> = ({ wrap, context: ctx, width, height }) => {
  const [A, B] = shuffle(ColorChecker, ColorChecker.length, rnd);
  // a good example
  // const [A, B] = [ColorChecker[12], ColorChecker[15]];

  const a = A.spd;
  const b = B.spd;

  const lRGB0 = spectra.XYZ_to_linearRGB(spectra.spectra_to_XYZ(a));
  const lRGB1 = spectra.XYZ_to_linearRGB(spectra.spectra_to_XYZ(b));
  const rgb0 = spectra.linearRGB_to_sRGB(lRGB0);
  const rgb1 = spectra.linearRGB_to_sRGB(lRGB1);

  const shapes: Rect[] = [];

  const steps = 12;
  for (let i = 0; i < steps; i++) {
    const sliceWidth = Math.round((1 / steps) * width);
    const u = i / (steps - 1);
    const c = spectra.mix_spectra(a, b, u);

    let outColor = spectra.spectra_to_sRGB(c).map((ch) => ch / 255);

    const rect1 = rect([sliceWidth * i, 0], [sliceWidth, height / 2], {
      fill: outColor,
      stroke: outColor,
    });

    outColor = spectra
      .linearRGB_to_sRGB(interpolateArray(lRGB0, lRGB1, u))
      .map((ch) => ch / 255);

    const rect2 = rect([sliceWidth * i, height / 2], [sliceWidth, height / 2], {
      fill: outColor,
      stroke: outColor,
    });

    shapes.push(rect1, rect2);
  }

  wrap.render = () => {
    draw(ctx, group({}, shapes));
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
