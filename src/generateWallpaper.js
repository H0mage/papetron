const path = require("path");
const sharp = require("sharp");

const positions = [
  "centre",
  "top",
  "right top",
  "right",
  "right bottom",
  "bottom",
  "left bottom",
  "left",
  "left top",
];
const gravities = [
  "north",
  "northeast",
  "east",
  "southeast",
  "south",
  "southwest",
  "west",
  "northwest",
  "center",
];
const strategies = ["entropy", "attention"];

function compare(a, b) {
  if (a.ratio < b.ratio) {
    return -1;
  }
  if (a.ratio > b.ratio) {
    return 1;
  }
  return 0;
}

function chooseRandom(min, max) {
  return Math.floor(Math.random() * (parseInt(max) - min + 1) + min);
}

async function getSize(imagePath) {
  const image = await sharp(imagePath);
  const metadata = await image.metadata();
  const { width, height } = metadata;
  const ratio = width / height;
  let orientation;
  if (ratio > 0.8 && ratio < 1.3) {
    orientation = "square";
  } else if (ratio < 0.8) {
    orientation = "vertical";
  } else {
    orientation = "horizontal";
  }
  const position = chooseRandom(0, positions.length - 1);
  const gravity = chooseRandom(0, gravities.length - 1);
  const strategy = chooseRandom(0, strategies.length - 1);
  return {
    width,
    height,
    orientation,
    ratio,
    path: imagePath,
    position,
    gravity,
    strategy,
  };
}

async function getSizes(pathArray) {
  let sizeArray = [];
  for (let i = 0; i < pathArray.length; i++) {
    const metadata = await getSize(pathArray[i]);
    sizeArray.push(metadata);
  }
  return sizeArray.sort(compare);
}

async function generateWallpaper(display, imagePaths) {
  const collageNumber = imagePaths.length / 2;
  const outputPath = path.join(__dirname, "../temp/tempWallpaper.png");

  if (collageNumber === 2) {
    const img_1_width = Math.floor((display.width / 100) * 60);
    const img_2_width = display.width - img_1_width;
    const sizeArray = await getSizes(imagePaths);

    try {
      const image1 = await sharp(sizeArray[3].path)
        .resize({
          width: img_1_width,
          height: display.height,
          // position: sizeArray[3].position,
          // // gravity: sizeArray[3].gravity,
          strategy: sizeArray[3].strategy,
        })
        .toBuffer();
      const image2 = await sharp(sizeArray[0].path)
        .resize({
          width: img_2_width,
          height: display.height,
          // position: sizeArray[0].position,
          // // gravity: sizeArray[0].gravity,
          strategy: sizeArray[0].strategy,
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

    const sizeArray = await getSizes(imagePaths);

    try {
      const image1 = await sharp(sizeArray[3].path)
        .resize({
          width: section_1_width,
          height: display.height,
          // position: sizeArray[3].position,
          // // gravity: sizeArray[3].gravity,
          strategy: sizeArray[3].strategy,
        })
        .toBuffer();
      const image2 = await sharp(sizeArray[4].path)
        .resize({
          width: section_2_width,
          height: img_2_height,
          // position: sizeArray[4].position,
          // // gravity: sizeArray[4].gravity,
          strategy: sizeArray[4].strategy,
        })
        .toBuffer();
      const image3 = await sharp(sizeArray[5].path)
        .resize({
          width: section_2_width,
          height: img_3_height,
          // position: sizeArray[5].position,
          // // gravity: sizeArray[5].gravity,
          strategy: sizeArray[5].strategy,
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

    const sizeArray = await getSizes(imagePaths);

    try {
      const image1 = await sharp(sizeArray[4].path)
        .resize({
          width: img_1_width,
          height: img_1_height,
          // position: sizeArray[4].position,
          // gravity: sizeArray[4].gravity,
          strategy: sizeArray[4].strategy,
        })
        .toBuffer();
      const image2 = await sharp(sizeArray[5].path)
        .resize({
          width: img_2_width,
          height: img_1_height,
          // position: sizeArray[5].position,
          // gravity: sizeArray[5].gravity,
          strategy: sizeArray[5].strategy,
        })
        .toBuffer();
      const image3 = await sharp(sizeArray[7].path)
        .resize({
          width: section_1_width,
          height: img_3_height,
          // position: sizeArray[7].position,
          // // gravity: sizeArray[7].gravity,
          strategy: sizeArray[7].strategy,
        })
        .toBuffer();
      const image4 = await sharp(sizeArray[0].path)
        .resize({
          width: section_2_width,
          height: display.height,
          // position: sizeArray[0].position,
          // // gravity: sizeArray[0].gravity,
          strategy: sizeArray[0].strategy,
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

    const sizeArray = await getSizes(imagePaths);

    try {
      const image1 = await sharp(sizeArray[4].path)
        .resize({
          width: section_3_width,
          height: section_3_height,
          // position: sizeArray[4].position,
          // // gravity: sizeArray[4].gravity,
          strategy: sizeArray[4].strategy,
        })
        .toBuffer();
      const image2 = await sharp(sizeArray[5].path)
        .resize({
          width: section_3_width,
          height: section_3_height,
          // position: sizeArray[5].position,
          // // gravity: sizeArray[5].gravity,
          strategy: sizeArray[5].strategy,
        })
        .toBuffer();
      const image3 = await sharp(sizeArray[9].path)
        .resize({
          width: section_1_width,
          height: img_3_height,
          // position: sizeArray[9].position,
          // // gravity: sizeArray[9].gravity,
          strategy: sizeArray[9].strategy,
        })
        .toBuffer();
      const image4 = await sharp(sizeArray[6].path)
        .resize({
          width: section_2_width,
          height: img_4_height,
          // position: sizeArray[6].position,
          // // gravity: sizeArray[6].gravity,
          strategy: sizeArray[6].strategy,
        })
        .toBuffer();
      const image5 = await sharp(sizeArray[8].path)
        .resize({
          width: section_2_width,
          height: img_5_height,
          // position: sizeArray[8].position,
          // // gravity: sizeArray[8].gravity,
          strategy: sizeArray[8].strategy,
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

    const sizeArray = await getSizes(imagePaths);

    try {
      const image1 = await sharp(sizeArray[0].path)
        .resize({
          width: img_1_width,
          height: section_3_height,
          // position: sizeArray[0].position,
          // // gravity: sizeArray[0].gravity,
          strategy: sizeArray[0].strategy,
        })
        .toBuffer();
      const image2 = await sharp(sizeArray[7].path)
        .resize({
          width: img_2_width,
          height: section_3_height,
          // position: sizeArray[7].position,
          // // gravity: sizeArray[7].gravity,
          strategy: sizeArray[7].strategy,
        })
        .toBuffer();
      const image3 = await sharp(sizeArray[11].path)
        .resize({
          width: section_1_width,
          height: img_3_height,
          // position: sizeArray[11].position,
          // // gravity: sizeArray[11].gravity,
          strategy: sizeArray[11].strategy,
        })
        .toBuffer();
      const image4 = await sharp(sizeArray[9].path)
        .resize({
          width: section_2_width,
          height: img_4_height,
          // position: sizeArray[9].position,
          // // gravity: sizeArray[9].gravity,
          strategy: sizeArray[9].strategy,
        })
        .toBuffer();
      const image5 = await sharp(sizeArray[2].path)
        .resize({
          width: img_5_width,
          height: section_4_height,
          // position: sizeArray[2].position,
          // // gravity: sizeArray[2].gravity,
          strategy: sizeArray[2].strategy,
        })
        .toBuffer();
      const image6 = await sharp(sizeArray[1].path)
        .resize({
          width: img_6_width,
          height: section_4_height,
          // position: sizeArray[].position,
          // // gravity: sizeArray[1].gravity,
          strategy: sizeArray[1].strategy,
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

module.exports = { generateWallpaper, getSize };
