export interface Opts {
  crossOrigin?: string;
  url?: string;
  maxSize?: number;
  process?: any;
}

export function loadImage(opt: Opts) {
  return new Promise((resolve, reject) => {
    var finished = false;
    var image = new window.Image();
    image.onload = () => {
      if (finished) return;
      finished = true;
      resolve(image);
    };
    image.onerror = () => {
      if (finished) return;
      finished = true;
      reject(new Error("Error while loading image at " + opt.url));
    };
    if (opt.crossOrigin) image.crossOrigin = opt.crossOrigin;
    image.src = opt.url!;
  });
}

export function attachDownloadKeyCommand(canvas: HTMLCanvasElement) {
  const handler = (ev: KeyboardEvent) => {
    if (ev.key.toLowerCase() === "s" && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault();
      const today = new Date();
      const yyyy = today.getFullYear();
      let [mm, dd, hh, min, sec] = [
        today.getMonth() + 1, // Months start at 0!
        today.getDate(),
        today.getHours(),
        today.getMinutes(),
        today.getSeconds(),
      ].map((c) => String(c).padStart(2, "0"));
      const timestamp = `${yyyy}.${mm}.${dd}-${hh}.${min}.${sec}`;
      download(canvas, `${timestamp}.png`);
    }
  };
  window.addEventListener("keydown", handler, { passive: false });
  return () => window.removeEventListener("keydown", handler);
}

export async function download(canvas: HTMLCanvasElement, filename: string) {
  const blob = await new Promise((cb) => canvas.toBlob(cb));
  if (blob == null) return console.warn(`Could not convert canvas to blob`);
  const a = document.createElement("a");
  a.download = filename;
  a.href = URL.createObjectURL(blob as Blob);
  a.style.visibility = "hidden";
  a.style.pointerEvents = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(blob as string);
    a.parentElement!.removeChild(a);
  }, 200);
}
