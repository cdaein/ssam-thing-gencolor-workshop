import { css, oklch, srgb } from "@thi.ng/color";
import { smoothStep } from "@thi.ng/math";
import { normal, Smush32 } from "@thi.ng/random";
import type { Sketch, SketchProps } from "ssam";
import { ssam } from "ssam";
import { loadImage, Opts } from "../util";

const seed = (Math.random() * 100000000) | 0;
const rnd = new Smush32(seed);

imagePixels({
  url: "/gonz-ddl-nO2sfLUaxgg-unsplash.jpg",
  maxSize: 500,
  process: (
    color: [number, number, number],
    u: number,
    v: number,
    // w: number,
    // h: number,
  ) => {
    const out = oklch(color);

    // boost chroma
    // out.c *= 4;

    // shift hue
    out.h += 80 / 360;

    // desaturate by N%
    out.c *= 0.75;

    // add noise in lightness only
    out.l += normal(rnd, 0, 2 / 100)();

    // add a vignette
    out.l *= smoothStep(1, 0.5, Math.hypot(u - 0.5, v - 0.5));

    return out;
  },
});

export function imagePixels(opts: Opts) {
  return ssam(imageSketch as Sketch<"2d">, {
    parent: ".sketch-parent",
    dimensions: [1000, 1000],
    pixelRatio: window.devicePixelRatio,
    data: opts,
    suffix: `-${seed}`,
    attributes: {
      // colorSpace: "display-p3",
    },
  });
}

async function imageSketch(props: SketchProps) {
  const opts: Opts = props.data || {};
  const { maxSize = 512 } = opts;
  let image;

  function handlerFunction(ev: DragEvent) {
    ev.preventDefault();
    if (ev.type === "drop") {
      let dt = ev.dataTransfer!;
      let files = dt.files;
      if (!files.length) return;

      const file = files[0];
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const img = document.createElement("img");
        img.onload = () => {
          redraw(img);
        };
        img.onerror = () => window.alert(`Could not load image: ${file.name}`);
        img.src = reader.result as string;
      };
      reader.onerror = () => window.alert(`Could not read file: ${file.name}`);
    }
  }

  const container = window;

  container.addEventListener("dragenter", handlerFunction, false);
  container.addEventListener("dragleave", handlerFunction, false);
  container.addEventListener("dragover", handlerFunction, false);
  container.addEventListener("drop", handlerFunction, false);

  let sampleIndex: number;
  let srcWidth: number;
  let srcHeight: number;
  let tilesX: number;
  let tilesY: number;
  let tileSizeX: number;
  let tileSizeY: number;
  let maxSamplesPerFrame: number;
  let aspect: number;
  let totalSamples: number;
  let pixels: Uint8ClampedArray;

  let tmpCanvas = document.createElement("canvas");
  let tmpContext = tmpCanvas.getContext("2d")!;

  function redraw(image: HTMLImageElement, doRender = true) {
    srcWidth = image.width;
    srcHeight = image.height;
    aspect = srcWidth / srcHeight;

    let maxArr = Array.isArray(maxSize) ? maxSize : [maxSize, maxSize];
    let [maxWidth, maxHeight] = maxArr;

    const ratio = Math.min(1, maxWidth / srcWidth, maxHeight / srcHeight);
    tilesX = Math.round(srcWidth * ratio);
    tilesY = Math.round(srcHeight * ratio);

    const targetWidth = tilesX;
    let dstWidth = targetWidth;
    let dstHeight = Math.round(dstWidth / aspect);

    tileSizeX = Math.round(dstWidth / tilesX);
    tileSizeY = Math.round(dstHeight / tilesY);

    maxSamplesPerFrame = tilesX * 4;
    totalSamples = tilesX * tilesY;

    dstWidth = Math.round(tileSizeX * tilesX);
    dstHeight = Math.round(tileSizeY * tilesY);
    props.update({ dimensions: [dstWidth, dstHeight] });

    tmpCanvas.width = srcWidth;
    tmpCanvas.height = srcHeight;
    tmpContext.clearRect(0, 0, srcWidth, srcHeight);
    tmpContext.drawImage(image, 0, 0, tmpCanvas.width, tmpCanvas.height);
    const imgData = tmpContext.getImageData(0, 0, srcWidth, srcHeight);
    pixels = imgData.data;

    props.context.drawImage(image, 0, 0, dstWidth, dstHeight);
    sampleIndex = 0;

    if (doRender) {
      props.togglePlay();
    }
  }

  function resizeStyle() {
    if (window.innerWidth / window.innerHeight > aspect) {
      props.canvas.style.height = "80vh";
      props.canvas.style.width = "auto";
    } else {
      props.canvas.style.width = "80vw";
      props.canvas.style.height = "auto";
    }
  }

  // attachDownloadKeyCommand(props.canvas);
  image = await loadImage(opts);
  resizeStyle();
  redraw(image as HTMLImageElement, false);
  window.addEventListener("resize", resizeStyle, { passive: true });

  props.wrap.render = ({ context }) => {
    if (sampleIndex >= totalSamples) {
      props.togglePlay();
      return;
    }

    let samplesPerFrame = 0;
    while (samplesPerFrame < maxSamplesPerFrame && sampleIndex < totalSamples) {
      const x = Math.floor(sampleIndex % tilesX);
      const y = Math.floor(sampleIndex / tilesX);

      const px = Math.floor((x / tilesX) * srcWidth);
      const py = Math.floor((y / tilesY) * srcHeight);
      const srcIdx = px + py * srcWidth;
      const r = pixels[srcIdx * 4 + 0];
      const g = pixels[srcIdx * 4 + 1];
      const b = pixels[srcIdx * 4 + 2];
      // let rgb = new Color("srgb", [r / 0xff, g / 0xff, b / 0xff]);
      let rgb = srgb(r / 0xff, g / 0xff, b / 0xff);
      if (opts.process) {
        rgb = opts.process(
          rgb,
          x / (tilesX - 1),
          y / (tilesY - 1),
          srcWidth,
          srcHeight,
        );
      }
      context.fillStyle = css(rgb);

      // This would be much faster by modifying pixels directly
      const tx = x * tileSizeX;
      const ty = y * tileSizeY;
      context.fillRect(tx, ty, tileSizeX, tileSizeY);
      samplesPerFrame++;
      sampleIndex++;
    }

    if (sampleIndex < totalSamples) {
      // const x = Math.floor(sampleIndex % tilesX);
      // const y = Math.floor(sampleIndex / tilesX);
      // const tx = x * tileSizeX;
      // const ty = y * tileSizeY;
      // context.fillStyle = "white";
      // context.globalCompositeOperation = "difference";
      // context.fillRect(tx, ty, props.width, props.height * 0.00175);
      // context.globalCompositeOperation = "source-over";
    }

    resizeStyle();
  };
}
