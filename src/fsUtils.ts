import fs from 'fs-extra';
import path from 'path';
import isString from 'lodash/isString';
import isRegExp from 'lodash/isRegExp';
import xmljs, { Element, ElementCompact } from 'xml-js';

export async function isFolderExists(dirPath: string): Promise<boolean> {
    let result = false;

    if (dirPath) {
        if (await fs.pathExists(dirPath)) {
            const dirStat = await fs.stat(dirPath);
            if (dirStat.isDirectory()) {
                result = true;
            }
        }
    }

    return result;
}

export async function createFolder(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
}

export async function createFile(filePath: string, data: string): Promise<void> {
    await createFolder(path.dirname(filePath));
    await fs.writeFile(filePath, data);
}

export async function searchFiles(dirPath: string, searchPattern: string | RegExp, isDeep = true): Promise<string[]> {
    let filesPaths: string[] = [];

    if (await isFolderExists(dirPath)) {
        const dirEntities = await fs.readdir(dirPath);

        for (const entity of dirEntities) {
            const entityPath = path.join(dirPath, entity);

            const entityStat = await fs.stat(entityPath);
            if (entityStat.isDirectory()) {
                if (isDeep) {
                    const subdirFilePaths = await searchFiles(entityPath, searchPattern, isDeep);
                    if (subdirFilePaths.length > 0) {
                        filesPaths = filesPaths.concat(subdirFilePaths);
                    }
                }
            } else if (entityStat.isFile()) {
                if (isRegExp(searchPattern)) {
                    // if (searchPattern.test(path.basename(entityPath))) {
                    if (searchPattern.test(entityPath)) {
                        filesPaths.push(entityPath);
                    }
                } else if (isString(searchPattern)) {
                    if (path.basename(entityPath) === searchPattern) {
                        filesPaths.push(entityPath);
                    }
                }
            }
        }
    }

    return filesPaths;
}

export async function readXmlFileAsJson(filePath: string): Promise<Element | ElementCompact | null> {
    let result: Element | ElementCompact | null = null;

    const fileText: string | null = await readTextFile(filePath);
    if (fileText != null && fileText !== undefined) {
        result = xmljs.xml2js(fileText);
    }

    return result;
}

export async function readTextFile(filePath: string): Promise<string | null> {
    let result: string | null = null;

    if (await fs.pathExists(filePath)) {
        const fileText = await fs.readFile(filePath);
        if (fileText != null && fileText !== undefined) {
            result = fileText.toString();
        }
    }

    return result;
}
