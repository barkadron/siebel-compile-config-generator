import groupBy from 'lodash/groupBy';
import xmlbuilder, { XMLElement } from 'xmlbuilder';

import { SifObjectTypesEnum, CompileObjectTypeMap, SifObject, GroupedSifObjects, SifObjectType } from './types';
import { getObjectKeys } from './helpers';
import { searchFiles, readXmlFileAsJson, createFile } from './fsUtils';

const compileObjectTypeMap: CompileObjectTypeMap = {
    APPLICATION: SifObjectTypesEnum.Application,
    APPLET: SifObjectTypesEnum.Applet,
    BUSINESS_COMPONENT: SifObjectTypesEnum.BusinessComponent,
    BUSINESS_OBJECT: SifObjectTypesEnum.BusinessObject,
    CONTENT_OBJECT: SifObjectTypesEnum.ContentObject,
    INTEGRATION_OBJECT: SifObjectTypesEnum.IntegrationObject,
    IMPORT_OBJECT: SifObjectTypesEnum.ImportObject,
    BUSINESS_SERVICE: SifObjectTypesEnum.BusinessService,
    LINK: SifObjectTypesEnum.Link,
    PICK_LIST: SifObjectTypesEnum.PickList,
    SCREEN: SifObjectTypesEnum.Screen,
    TABLE: SifObjectTypesEnum.Table,
    VIEW: SifObjectTypesEnum.View,
    WEB_TEMPLATE: SifObjectTypesEnum.WebTemplate,
};

export default async function generateCompileConfig(sifDir: string, repository: string, resultFilePath: string): Promise<void> {
    const sifObjects: SifObject[] = [];

    const sifFiles = await searchSifFiles(sifDir);

    for (const sp of sifFiles) {
        const obj = await parseSifFile(sp);
        if (obj) {
            sifObjects.push(obj);
        }
    }

    if (sifObjects.length === 0) {
        return;
    }

    const groupedCompileObjects = groupSifObjects(sifObjects);
    const objectsForCompileXml = createIncrementalCompileXml(groupedCompileObjects, repository);

    await saveCompileConfigToFile(objectsForCompileXml, resultFilePath);
}

async function searchSifFiles(dirPath: string): Promise<string[]> {
    return searchFiles(dirPath, /.sif$/i, true);
}

async function parseSifFile(filePath: string): Promise<SifObject | null> {
    // console.log('filePath', filePath);
    const fileContent = await readXmlFileAsJson(filePath);
    if (!fileContent) {
        throw new Error(`Error! SIF-file content is empty.`);
    }
    const { name: objType, attributes } = fileContent.elements[0].elements[0].elements[0];
    const type = compileObjectTypeMap[objType];
    if (!type) {
        // throw new Error(`Error! Incorrect object type: '${type}'.'`);
        return null;
    }
    return { name: attributes.NAME, type };
}

function groupSifObjects(objects: SifObject[], groupKey = 'type'): GroupedSifObjects[] {
    if (!objects || objects.length < 0) {
        return [];
    }

    if (!getObjectKeys(objects[0]).find((k) => k === groupKey)) {
        throw new Error(`Ошибка! Указан некорректный ключ '${groupKey}'.`);
    }

    const groups = groupBy(objects, groupKey);
    const result = Object.entries(groups).map((e) => ({
        type: <SifObjectType>e[0],
        objects: e[1],
    }));

    return result;
}

function createIncrementalCompileXml(objectsForCompile: GroupedSifObjects[], repositoryName: string): string {
    /* Пример xml-конфига:
        <?xml version="1.0" encoding="utf-8"?>
        <Compilation RepositoryName="Siebel Repository">
            <Type Name="Applet">
                <Object Name="Applet 1"/>
                <Object Name="Applet 2"/>
                <Object Id="1-123APL"/>
            </Type>
            <Type Name="Business Component">
                <Object Name="Account"/>
                <Object Name="Contact"/>
                <Object Id="1-123BC"/>
            </Type>
        </Compilation>

        Подробности см. в BS 'Siebel Tools Object Compiler'
    */

    let xmlString = '';

    const root: XMLElement = xmlbuilder.create('Compilation', { encoding: 'utf-8' });
    root.att('RepositoryName', repositoryName);

    if (objectsForCompile && objectsForCompile.length > 0) {
        for (const { type, objects } of objectsForCompile) {
            const typeNode: XMLElement = root.ele('Type', { Name: type });
            for (const obj of objects) {
                typeNode.ele('Object', { Name: obj.name });
            }
        }
    }

    xmlString = root.end({ pretty: true });

    return xmlString;
}

async function saveCompileConfigToFile(objectsForCompileXml: string, filePath: string): Promise<void> {
    await createFile(filePath, objectsForCompileXml);
}
