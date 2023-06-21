import path from 'path';
import { compilation as webpackCompilation } from 'webpack';

export type FunctionDefinition = string | { path: string; name: string };

/**
 * Copy all the input `files` into netlify/`targetFolder`, named
 *   based on the path to the file.
 *
 * @param targetFolder - Output directory to put these files under.
 * @param functions - List of file paths to copy
 * @param compilation
 * @returns
 */
export const copyFunctions = (
  targetFolder: string,
  functions: FunctionDefinition[],
  compilation: webpackCompilation.Compilation
) =>
  functions.forEach((func) => {
    const { path: filepath, name } =
      typeof func === 'string' ? { path: func, name: path.basename(func) } : func;
    const content = compilation.inputFileSystem.readFileSync(filepath).toString();

    const ext = path.extname(filepath);
    const filename = path.basename(name, ext);

    const key = `netlify/${targetFolder}/${filename}${ext}`;
    compilation.assets[key] = {
      source: () => content,
      size: () => content.length
    };
  });
