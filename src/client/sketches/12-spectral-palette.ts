import { shuffle } from "@thi.ng/arrays";
import { group, rect } from "@thi.ng/geom";
import { draw } from "@thi.ng/hiccup-canvas";
import { normal, pickRandom, Smush32 } from "@thi.ng/random";
import { Sketch, SketchSettings, ssam } from "ssam";
import ColorChecker from "../spectra/colorchecker";
import * as spectra from "../spectra/spectra";

const aspect = 1.414;
const width = 1024;
const height = 1024 * aspect;

const seed = (Math.random() * 10000000) | 0;
const rnd = new Smush32(seed);

const sketch: Sketch<"2d"> = ({ wrap, context: ctx, width, height }) => {
  const ColorCheckerSPD = ColorChecker.map((c) => c.spd);

  const primaries = shuffle(
    [...ColorCheckerSPD],
    ColorCheckerSPD.length,
    rnd,
  ).slice(0, 6);
  const bright = ColorCheckerSPD[18];
  const dark = ColorCheckerSPD[ColorCheckerSPD.length - 1];

  function procPigment() {
    const [a, b] = shuffle(primaries, primaries.length, rnd);
    let c = spectra.mix_spectra(a, b, pickRandom([0, 0.25, 0.5, 0.75, 1], rnd));
    c = spectra.mix_spectra(c, dark, rnd.minmax(0, 0.2)); // tint dark
    return c;
  }

  const count = 50;
  const margin = 0.225 * width;
  const shapesData: {
    pigment: number[];
    Y: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }[] = [];
  const gauss = normal(rnd, 0, 1);
  for (let i = 0; i < count; i++) {
    const w = width * 0.1 * Math.abs(gauss());
    const h = width * 0.1 * Math.abs(gauss());

    // random point, but then offset by half rect size
    // so they appear centred
    const x = rnd.minmax(margin, width - margin) - w / 2;
    const y = rnd.minmax(margin, height - margin) - h / 2;

    const pigment = procPigment();
    const Y = spectra.spectra_to_Y(pigment);
    shapesData.push({ pigment, Y, x, y, width: w, height: h });
  }

  // sort by luminance
  shapesData.sort((a, b) => a.Y - b.Y);

  const bgSpec = bright.map((x) => x * 1.04);
  const bgCol = spectra.spectra_to_sRGB(bgSpec).map((ch) => ch / 255);
  console.log(bgCol);

  const shapes = shapesData.map((shape) => {
    const color = spectra.spectra_to_sRGB(shape.pigment).map((ch) => ch / 255);
    const shp = rect([shape.x, shape.y], [shape.width, shape.height], {
      fill: color,
      stroke: color,
      weight: width * 0.02,
      lineJoin: "round",
    });
    return shp;
  });

  wrap.render = ({ width, height }) => {
    draw(
      ctx,
      group(
        { __background: bgCol, transform: [1, 0.2, 0.0, 1, 0, -height * 0.05] },
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
