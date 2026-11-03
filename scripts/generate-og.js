const path = require("path");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const imageDir = path.join(root, "assets", "img");

const jobs = [
  { input: "og-image.svg", output: "og-image.png", width: 1200, height: 630, density: 144 },
  { input: "favicon.svg", output: "favicon-32.png", width: 32, height: 32, density: 300 },
  { input: "favicon.svg", output: "apple-touch-icon.png", width: 180, height: 180, density: 300 },
  { input: "favicon.svg", output: "icon-192.png", width: 192, height: 192, density: 300 },
  { input: "favicon.svg", output: "icon-512.png", width: 512, height: 512, density: 300 },
];

async function generate() {
  for (const job of jobs) {
    const input = path.join(imageDir, job.input);
    const output = path.join(imageDir, job.output);

    await sharp(input, { density: job.density })
      .resize(job.width, job.height, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toFile(output);

    console.log(`Generated ${path.relative(root, output)}`);
  }
}

generate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
