import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs/promises';
import AWS from 'aws-sdk';
import { Readable } from 'stream';
import { supermarketItemsSet } from '@/lib/keywords';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const rateLimitWindowMs = 15 * 60 * 1000;
const rateLimitMax = 5;

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const rateInfo = rateLimitMap.get(ip) || { count: 0, timestamp: now };

  if (now - rateInfo.timestamp > rateLimitWindowMs) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (rateInfo.count < rateLimitMax) {
    rateInfo.count += 1;
    rateLimitMap.set(ip, rateInfo);
    return true;
  }

  return false;
};

class ReadableStreamWithHeaders extends Readable {
  headers: Record<string, string>;

  constructor(buffer: Buffer, headers: Record<string, string>) {
    super();
    this.headers = headers;
    this.push(buffer);
    this.push(null);
  }
}

const parseForm = async (req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const form = formidable();
  const buffer = await req.arrayBuffer();
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const reqStream = new ReadableStreamWithHeaders(Buffer.from(buffer), headers);

  return new Promise((resolve, reject) => {
    form.parse(reqStream as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const rekognition = new AWS.Rekognition();

const getMostRelevantLabel = (labels: AWS.Rekognition.Label[]): string => {
  const threshold = 75;
  console.log(labels);

  const filteredLabels = labels.filter(label => label.Confidence && label.Confidence >= threshold && label.Name);

  const keywordMatchedLabel = filteredLabels.find(label => 
    label.Name && supermarketItemsSet.has(label.Name.toLowerCase())
  );

  if (keywordMatchedLabel && keywordMatchedLabel.Name) {
    return keywordMatchedLabel.Name;
  }

  const highestConfidenceLabel = filteredLabels.reduce((prev, current) => 
    (prev.Confidence && current.Confidence && prev.Confidence > current.Confidence) ? prev : current
  );

  return highestConfidenceLabel.Name || 'Unknown';
};

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-forwarded-for') || req.ip;
  if (!clientIp || !checkRateLimit(clientIp)) {
    return NextResponse.json({ message: 'Too many requests, please try again later.' }, { status: 429 });
  }

  let file: formidable.File | undefined;

  try {
    const { fields, files } = await parseForm(req);
    file = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!file) {
      return NextResponse.json({ message: 'No image uploaded' }, { status: 400 });
    }

    const fileContent = await fs.readFile(file.filepath);

    const params = {
      Image: {
        Bytes: fileContent,
      },
      MaxLabels: 10,
      MinConfidence: 70,
    };

    const response = await rekognition.detectLabels(params).promise();
    const labels = response.Labels || [];

    const mostRelevantLabel = getMostRelevantLabel(labels);

    return NextResponse.json({ label: mostRelevantLabel });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error processing the request', error: error.message }, { status: 500 });
  } finally {
    if (file) {
      await fs.unlink(file.filepath);
    }
  }
}
