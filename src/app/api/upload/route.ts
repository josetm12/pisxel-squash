import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';
import sharp from 'sharp';

export const POST = async (req: any, res: any) => {
  const formData = await req.formData();
  const files = formData.getAll('file');
  let quality = parseInt(formData.get('quality') || 80, 10);
  let resizeBy = parseInt(formData.get('resizeBy') || 100) / 100;

  if (!files) {
    return NextResponse.json({ error: 'No files received.' }, { status: 400 });
  }

  if (files.length > 1) {
    return NextResponse.json(
      { error: 'Only 1 image upload supported.' },
      { status: 400 }
    );
  }

  for (let i = 0; i < files.length; i++) {
    const buffer = Buffer.from(await files[i].arrayBuffer());
    const filename = Date.now() + files[i].name.replaceAll(' ', '_');
    try {
      await compressImage(
        buffer,
        { quality: quality, scale: resizeBy },
        filename
      );
    } catch (error) {
      console.log('Error occured ', error);
      return NextResponse.json({ Message: 'Failed', status: 500 });
    }
  }
  return NextResponse.json({ Message: 'Success', status: 201 });
};

interface CompressionOptions {
  quality?: number;
  format?: keyof sharp.FormatEnum;
  scale?: number;
  width?: number;
  height?: number;
}

async function compressImage(
  inputBuffer: Buffer,
  options: CompressionOptions = {},
  filename: string
): Promise<void> {
  const { quality = 50, format = 'jpeg', width, height, scale } = options;
  let scaledWidth;

  try {
    let sharpImage = await sharp(inputBuffer);
    const metaData = await sharpImage.metadata();

    if (scale && metaData.width) {
      scaledWidth = metaData.width * scale;
    }

    console.log(scaledWidth, scale, 'scaled width');

    // Resize if width or height is specified and the dimensions of the image are more than what is configured here
    if (scaledWidth) {
      sharpImage = sharpImage.resize(scaledWidth);
    } else if (
      (width && metaData.width && metaData.width > width) ||
      (height && metaData.height && metaData.height > height)
    ) {
      sharpImage = sharpImage.resize(width, height);
    }

    // Compress and save the image
    await sharpImage
      .toFormat(format, { quality })
      .toBuffer({ resolveWithObject: false })
      .then(async (data) => {
        await writeFile(
          path.join(process.cwd(), 'public/uploads/' + filename),
          data
        );
        return data;
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (error) {
    throw new Error('Compression error: ' + error);
  }
}
