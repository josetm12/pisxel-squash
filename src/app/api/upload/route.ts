import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const files: File[] | null = data.getAll('images') as unknown as File[];

  console.log(data);
  console.log('file', files);
  if (!files) {
    return NextResponse.json({ success: false });
  }

  const bytes = await files[0].arrayBuffer();
  const buffer = Buffer.from(bytes);

  // With the file data in the buffer, you can do whatever you want with it.
  // For this, we'll just write it to the filesystem in a new location
  const path = `/tmp/${files[0].name}`;
  //await writeFile(path, buffer);
  console.log(`open ${path} to see the uploaded file`);

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  // Handle GET requests if needed
  return NextResponse.json({ message: 'Upload endpoint is working' });

  // try {
  //   // Return the paths of the processed files
  //   return NextResponse.json({
  //     message: 'Files uploaded successfully',
  //     files: [],
  //   });
  // } catch (error: any) {
  //   console.error('Upload error:', error);
  //   return NextResponse.json(
  //     { error: error.message || 'Error uploading files' },
  //     { status: 500 }
  //   );
  // }
}
