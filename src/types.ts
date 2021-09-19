export enum SifObjectTypesEnum {
    Application = 'Application',
    Applet = 'Applet',
    BusinessComponent = 'Business Component',
    BusinessObject = 'Business Object',
    BusinessService = 'Business Service',
    ContentObject = 'Content Object',
    EimInterfaceTable = 'EIM Interface Table',
    ImportObject = 'Import Object',
    IntegrationObject = 'Integration Object',
    Link = 'Link',
    PickList = 'Pick List',
    Screen = 'Screen',
    SymbolicString = 'Symbolic String',
    Table = 'Table',
    Task = 'Task',
    View = 'View',
    WebTemplate = 'Web Template',
    WorkflowPolicyObject = 'Workflow Policy Object',
    WorkflowPolicyColumn = 'Workflow Policy Column',
    WorkflowProcess = 'Workflow Process',
}

export type SifObjectName = string;
export type SifObjectType = SifObjectTypesEnum;

export interface SifObject {
    readonly name: SifObjectName;
    readonly type: SifObjectType;
}

export interface GroupedSifObjects {
    type: SifObjectType;
    objects: SifObject[];
}

export interface CompileObjectTypeMap {
    [key: string]: SifObjectType;
}
