import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs from "fs";
import * as path from "path";
import { Public } from "../../common";

export interface UploadedFileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

// Pure Node.js storage engine that implements Multer StorageEngine contract
// Zero dependency on external 'multer' package at runtime
function createCustomDiskStorage(destinationPath: string) {
  return {
    _handleFile(req: any, file: any, cb: (err: any, info?: any) => void) {
      try {
        if (!fs.existsSync(destinationPath)) {
          fs.mkdirSync(destinationPath, { recursive: true });
        }
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname || "");
        const filename = `${file.fieldname || "file"}-${uniqueSuffix}${ext}`;
        const finalPath = path.join(destinationPath, filename);

        const outStream = fs.createWriteStream(finalPath);
        file.stream.pipe(outStream);
        outStream.on("error", (err) => cb(err));
        outStream.on("finish", () => {
          cb(null, {
            destination: destinationPath,
            filename,
            path: finalPath,
            size: outStream.bytesWritten,
            mimetype: file.mimetype,
          });
        });
      } catch (err) {
        cb(err);
      }
    },
    _removeFile(req: any, file: any, cb: (err: any) => void) {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlink(file.path, cb);
      } else {
        cb(null);
      }
    },
  };
}

@Controller("upload")
export class UploadController {
  @Public()
  @Post("image")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: createCustomDiskStorage("./uploads"),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req: any, file: any, cb: any) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml)$/)) {
          return cb(
            new BadRequestException("Only image files are allowed!"),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: UploadedFileType) {
    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    const host = process.env.APP_URL || "http://localhost:7733";
    const url = `${host}/uploads/${file.filename}`;

    return {
      url,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
