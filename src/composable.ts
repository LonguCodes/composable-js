import 'reflect-metadata'
import {ComposableTransformation} from "./types";

export abstract class Composable<T> {

    protected static composeMetadataKey = Symbol('metadata-key-compose')


    protected static _registry: { [x: string]: Composable<any> } = {};


    protected constructor(protected _composable: T) {

    }

    abstract chain(fn: (original: T, composable: T) => T): Composable<T>;


    abstract get composed(): T ;


}


export interface ComposableStatic<T> {
    get(value: T): Composable<T>

    readonly decorator: (fn: ComposableTransformation<T>) => (...args: any[]) => any

}