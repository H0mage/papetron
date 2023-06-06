const path = require("path");
const sharp = require("sharp");

async function generateWallpaper(display, imagePaths) {
  const collageNumber = imagePaths.length;
  const outputPath = path.join(__dirname, "../temp/tempWallpaper.png");

  if (collageNumber === 2) {
    const img_1_width = Math.floor((display.width / 100) * 60);
    const img_2_width = display.width - img_1_width;
    try {
      const image1 = await sharp(imagePaths[0])
        .resize({
          width: img_1_width,
          height: display.height,
        })
        .toBuffer();
      const image2 = await sharp(imagePaths[1])
        .resize({
          width: img_2_width,
          height: display.height,
        })
        .toBuffer();

      await sharp({
        create: {
          width: display.width,
          height: display.height,
          channels: 3,
          background: "#000000",
        },
      })
        .composite([
          { input: image1, top: 0, left: 0 },
          { input: image2, top: 0, left: img_1_width },
        ])
        .toFile(outputPath);
    } catch (error) {
      console.log(error);
    }
  } else if (collageNumber === 3) {
    const section_1_width = Math.floor((display.width / 100) * 57);
    const section_2_width = display.width - section_1_width;
    const img_2_height = Math.floor((display.height / 100) * 55);
    const img_3_height = display.height - img_2_height;

    try {
      const image1 = await sharp(imagePaths[0])
        .resize({
          width: section_1_width,
          height: display.height,
        })
        .toBuffer();
      const image2 = await sharp(imagePaths[1])
        .resize({
          width: section_2_width,
          height: img_2_height,
        })
        .toBuffer();
      const image3 = await sharp(imagePaths[2])
        .resize({
          width: section_2_width,
          height: img_3_height,
        })
        .toBuffer();

      await sharp({
        create: {
          width: display.width,
          height: display.height,
          channels: 3,
          background: "#000000",
        },
      })
        .composite([
          { input: image1, top: 0, left: 0 },
          { input: image2, top: 0, left: section_1_width },
          { input: image3, top: img_2_height, left: section_1_width },
        ])
        .toFile(outputPath);
    } catch (error) {
      console.log(error);
    }
  } else if (collageNumber === 4) {
    const section_1_width = Math.floor((display.width / 100) * 59);
    const section_2_width = display.width - section_1_width;
    const img_1_height = Math.floor((display.height / 100) * 38);
    const img_1_width = Math.floor((section_1_width / 100) * 50);
    const img_2_width = section_1_width - img_1_width;
    const img_3_height = display.height - img_1_height;

    try {
      const image1 = await sharp(imagePaths[0])
        .resize({
          width: img_1_width,
          height: img_1_height,
        })
        .toBuffer();
      const image2 = await sharp(imagePaths[1])
        .resize({
          width: img_2_width,
          height: img_1_height,
        })
        .toBuffer();
      const image3 = await sharp(imagePaths[2])
        .resize({
          width: section_1_width,
          height: img_3_height,
        })
        .toBuffer();
      const image4 = await sharp(imagePaths[3])
        .resize({
          width: section_2_width,
          height: display.height,
        })
        .toBuffer();

      await sharp({
        create: {
          width: display.width,
          height: display.height,
          channels: 3,
          background: "#000000",
        },
      })
        .composite([
          { input: image1, top: 0, left: 0 },
          { input: image2, top: 0, left: img_1_width },
          { input: image3, top: img_1_height, left: 0 },
          { input: image4, top: 0, left: section_1_width },
        ])
        .toFile(outputPath);
    } catch (error) {
      console.log(error);
    }
  } else if (collageNumber === 5) {
    const section_1_width = Math.floor((display.width / 100) * 57);
    const section_2_width = display.width - section_1_width;
    const section_3_height = Math.floor((display.height / 100) * 43);
    const section_3_width = Math.floor(section_1_width / 2);
    const img_3_height = display.height - section_3_height;
    const img_4_height = Math.floor((display.height / 100) * 54);
    const img_5_height = display.height - img_4_height;

    try {
      const image1 = await sharp(imagePaths[0])
        .resize({
          width: section_3_width,
          height: section_3_height,
        })
        .toBuffer();
      const image2 = await sharp(imagePaths[1])
        .resize({
          width: section_3_width,
          height: section_3_height,
        })
        .toBuffer();
      const image3 = await sharp(imagePaths[2])
        .resize({
          width: section_1_width,
          height: img_3_height,
        })
        .toBuffer();
      const image4 = await sharp(imagePaths[3])
        .resize({
          width: section_2_width,
          height: img_4_height,
        })
        .toBuffer();
      const image5 = await sharp(imagePaths[4])
        .resize({
          width: section_2_width,
          height: img_5_height,
        })
        .toBuffer();

      await sharp({
        create: {
          width: display.width,
          height: display.height,
          channels: 3,
          background: "#000000",
        },
      })
        .composite([
          { input: image1, top: 0, left: 0 },
          { input: image2, top: 0, left: section_3_width },
          { input: image3, top: section_3_height, left: 0 },
          { input: image4, top: 0, left: section_1_width },
          { input: image5, top: img_4_height, left: section_1_width },
        ])
        .toFile(outputPath);
    } catch (error) {
      console.log(error);
    }
  } else if (collageNumber === 6) {
    const section_1_width = Math.floor((display.width / 100) * 54);
    const section_2_width = display.width - section_1_width;
    const section_3_height = Math.floor((display.height / 100) * 45);
    const section_4_height = Math.floor((display.height / 100) * 42);
    const img_1_width = Math.floor((section_1_width / 100) * 35);
    const img_2_width = section_1_width - img_1_width;
    const img_3_height = display.height - section_3_height;
    const img_4_height = display.height - section_4_height;
    const img_5_width = Math.floor((section_2_width / 100) * 56);
    const img_6_width = section_2_width - img_5_width;

    try {
      const image1 = await sharp(imagePaths[0])
        .resize({
          width: img_1_width,
          height: section_3_height,
        })
        .toBuffer();
      const image2 = await sharp(imagePaths[1])
        .resize({
          width: img_2_width,
          height: section_3_height,
        })
        .toBuffer();
      const image3 = await sharp(imagePaths[2])
        .resize({
          width: section_1_width,
          height: img_3_height,
        })
        .toBuffer();
      const image4 = await sharp(imagePaths[3])
        .resize({
          width: section_2_width,
          height: img_4_height,
        })
        .toBuffer();
      const image5 = await sharp(imagePaths[4])
        .resize({
          width: img_5_width,
          height: section_4_height,
        })
        .toBuffer();
      const image6 = await sharp(imagePaths[5])
        .resize({
          width: img_6_width,
          height: section_4_height,
        })
        .toBuffer();

      await sharp({
        create: {
          width: display.width,
          height: display.height,
          channels: 3,
          background: "#000000",
        },
      })
        .composite([
          { input: image1, top: 0, left: 0 },
          { input: image2, top: 0, left: img_1_width },
          { input: image3, top: section_3_height, left: 0 },
          { input: image4, top: 0, left: section_1_width },
          { input: image5, top: img_4_height, left: section_1_width },
          {
            input: image6,
            top: img_4_height,
            left: section_1_width + img_5_width,
          },
        ])
        .toFile(outputPath);
    } catch (error) {
      console.log(error);
    }
  }
  return outputPath;
}

module.exports = { generateWallpaper };
