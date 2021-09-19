// eslint-disable-next-line @typescript-eslint/ban-types
export function getObjectKeys<O extends object>(obj: O): Array<keyof O> {
    return Object.keys(obj) as Array<keyof O>;
}

export function stringify(arg: Record<string, unknown> | any[]): string {
    return JSON.stringify(arg, null, 4);
}
