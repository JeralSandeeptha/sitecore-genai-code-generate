import fs from "fs";
import path from "path";

type GeneratedFile = {
  lang: string;
  meta: {
    file: string;
    isMerged?: string;
  };
  source: string;
};

export const writeGeneratedFiles = (
  files: GeneratedFile[],
  baseDir = "generated"
) => {
  files.forEach(({ meta, source }) => {
    if (!meta?.file) return;

    const filePath = path.join(baseDir, meta.file);
    const dirPath = path.dirname(filePath);

    // Ensure directory exists
    fs.mkdirSync(dirPath, { recursive: true });

    // Write file
    fs.writeFileSync(filePath, source, "utf-8");
  });
};
