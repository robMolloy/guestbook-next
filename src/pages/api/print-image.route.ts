import { selectedImageDbEntrySchema } from "@/utils/firestoreUtils";
import type { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import { PDFDocument } from "pdf-lib";

type Data = {
  name: string;
};

const extractBase64DataFromImageDataUrl = (imageDataUrl: string) => {
  return imageDataUrl.split(",")[1] as string;
};

async function createPdfFromBase64(p: { base64Data: string; pdfPath: string }) {
  const imageBuffer = Buffer.from(p.base64Data, "base64");
  const pdfDoc = await PDFDocument.create();

  const pngImage = await pdfDoc.embedPng(imageBuffer);

  const { width, height } = pngImage.scale(1);

  const page = pdfDoc.addPage([width, height]);

  page.drawImage(pngImage, { x: 0, y: 0, width, height });

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync(p.pdfPath, pdfBytes);
}

async function getImageDataUrlFromImageUrl(imageLink: string) {
  try {
    const response = await fetch(imageLink);
    if (!response.ok) {
      throw new Error(`Failed to fetch image. Status: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    return `data:${response.headers.get("content-type")};base64,${imageBase64}`;
  } catch (error) {
    console.error("Error fetching image:", error);
  }
}

const safeCreateDir = (directoryPath: string) => {
  return new Promise((resolve) => {
    if (fs.existsSync(directoryPath)) return resolve(true);
    fs.mkdir(directoryPath, (err) => {
      if (err) {
        console.error("Error creating folder:", err);
        resolve(false);
      } else {
        console.log("Folder created successfully!");
        resolve(true);
      }
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === "POST") {
    const body = JSON.parse(req.body);
    const docParseResponse = selectedImageDbEntrySchema.safeParse(body);
    if (docParseResponse.success) {
      const imageUrl = docParseResponse.data.downloadUrl;
      const imageDataUrl = await getImageDataUrlFromImageUrl(imageUrl);
      if (imageDataUrl) {
        const base64Data = extractBase64DataFromImageDataUrl(imageDataUrl);
        safeCreateDir("images");
        await createPdfFromBase64({
          base64Data,
          pdfPath: `images/selected-image-${docParseResponse.data.id}.pdf`,
        });
        // printPdf
      }
    }
  }
  res.status(200).json({ name: "John Doe" });
}
