import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';
import sharp from 'sharp';

export const POST = async (req: any, res: any) => {
  const formData = await req.formData();

  const files = formData.getAll('file');
  if (!files) {
    return NextResponse.json({ error: 'No files received.' }, { status: 400 });
  }

  if (files.length > 1) {
    return NextResponse.json(
      { error: 'Only 1 image upload supported.' },
      { status: 400 }
    );
  }
  console.log('files', files.length);

  for (let i = 0; i < files.length; i++) {
    const buffer = Buffer.from(await files[i].arrayBuffer());
    const filename = Date.now() + files[i].name.replaceAll(' ', '_');
    console.log(filename);
    try {
      await compressImage(buffer, { quality: 80, width: 1920 }, filename);
      console.log(buffer);
      // await writeFile(
      //   path.join(process.cwd(), 'public/uploads/' + filename),
      //   buffer
      // );
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
  width?: number;
  height?: number;
}

async function compressImage(
  inputBuffer: Buffer,
  options: CompressionOptions = {},
  filename: string
): Promise<void> {
  const { quality = 50, format = 'jpeg', width, height } = options;

  try {
    let sharpImage = await sharp(inputBuffer);
    const metaData = await sharpImage.metadata();
    console.log('metadata', metaData);

    // Resize if width or height is specified and the dimensions of the image are more than what is configured here
    if (
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
        console.log('After compress', data);
        await writeFile(
          path.join(process.cwd(), 'public/uploads/' + filename),
          data
        );
        return data;
      })
      .catch((err) => {
        throw new Error(err);
      });

    console.log(`Image compressed successfully`);
  } catch (error) {
    throw new Error('Compression error: ' + error);
  }
}
