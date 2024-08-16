import { group, rect, text } from "@thi.ng/geom";
import { draw } from "@thi.ng/hiccup-canvas";
import type { Sketch, SketchSettings } from "ssam";
import { ssam } from "ssam";
import ColorChecker from "../spectra/colorchecker";
import * as spectra from "../spectra/spectra";

const width = 680;
const cols = 6;
const rows = 4;
const tileWidth = width / cols;
const tileHeight = tileWidth;
const height = rows * tileHeight;

const sketch: Sketch<"2d"> = ({ wrap, context: ctx }) => {
  wrap.render = () => {
    draw(
      ctx,
      group(
        {},
        ColorChecker.map((checker, i) => {
          const spd = checker.spd;
          const xyz_d65 = spectra.spectra_to_XYZ(spd, spectra.illuminant_d65);
          const rgb = spectra.XYZ_to_sRGB(xyz_d65).map((ch) => ch / 255);

          const x = Math.floor(i % cols);
          const y = Math.floor(i / cols);

          const rect1 = rect(
            [x * tileWidth, y * tileHeight],
            [tileWidth, Math.ceil(tileHeight / 2)],
            {
              fill: rgb,
            },
          );

          const rect2 = rect(
            [x * tileWidth, y * tileHeight + Math.floor(tileHeight / 2)],
            [tileWidth, Math.ceil(tileHeight / 2)],
            {
              fill: ColorChecker[i].hex,
            },
          );

          const txt = text(
            [
              x * tileWidth + 10,
              y * tileHeight + 10 + Math.floor(tileHeight / 2),
            ],
            checker.name,
            {
              fill: "white",
              font: "12px monospace",
              compose: "difference",
            },
          );

          return group({}, [rect1, rect2, txt]);
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
