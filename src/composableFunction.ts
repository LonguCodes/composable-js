import 'reflect-metadata';
import {v4} from "uuid";
import {ComposableTransformation, staticImplements} from "./types";
import {Composable, ComposableStatic} from "./composable";


@staticImplements<ComposableStatic<Function>>()
export class ComposableFunction extends Composable<Function> {

    private _context: any;

    constructor(fn: Function) {
        super(fn)
    }

    chain(fn: ComposableTransformation<Function>) {
        this._composable = fn(this.composed, this.execute)
        return this
    }

    public get execute() {
        return this._execute.bind(this)
    }

    private _execute(...args: any[]) {
        return this.composed(...args);
    }

    static get(fn: Function) {
        if (Reflect.hasMetadata(this.composeMetadataKey, fn)) {
            const key: string = Reflect.getMetadata(this.composeMetadataKey, fn)
            return this._registry[key] as ComposableFunction

        }
        const composableFunction = new ComposableFunction(fn)
        const key = v4();
        this._registry[key] = composableFunction;
        Reflect.defineMetadata(this.composeMetadataKey, key, fn)
        return composableFunction;
    }

    setDefaultContext(context: any) {
        if (!this._context)
            this._context = context;
        return this;
    }

    get composed() {
        if (this._context)
            return this._composable.bind(this._context)
        return this._composable;
    }

    static decorator(fn: ComposableTransformation<Function>) {
        return (target: any,
                propertyKey: string,
                descriptor: PropertyDescriptor) => {
            descriptor.value = this.get(descriptor.value as Function)?.setDefaultContext(target).chain(fn).execute
        }
    }
}