export type Constructor<T = any> = new (...args: any[]) => T;

export function staticImplements<T>() {
    return <U extends T>(constructor: U) => constructor;
}

export type ComposableTransformation<T> =(original: T, composable: T) => T