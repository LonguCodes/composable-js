import 'reflect-metadata';
import {v4} from "uuid";
import {ComposableTransformation, staticImplements} from "./types";
import {Composable, ComposableStatic} from "./composable";
import {ComposableClass} from "./composableClass";


@staticImplements<ComposableStatic<Function>>()
export class ComposableFunction extends Composable<Function> {

    private _functionChain: ComposableTransformation<Function>[] = []
    private _context: any;
    private _useComposableClass: boolean = false;

    private readonly _composedBase: Function;

    constructor(fn: Function, private readonly key: string) {
        super()
        this._composedBase = fn;
    }

    chain(fn: ComposableTransformation<Function>) {
        this._functionChain.push(fn)
        return this
    }

    private _execute(...args: any[]) {
        return this.composedChain(...args);
    }

    static get(fn: Function) {
        if (Reflect.hasMetadata(this.composeMetadataKey, fn)) {
            const key: string = Reflect.getMetadata(this.composeMetadataKey, fn)
            return this._registry[key] as ComposableFunction

        }
        const key = v4();
        const composableFunction = new ComposableFunction(fn, key)
        this._registry[key] = composableFunction;
        Reflect.defineMetadata(this.composeMetadataKey, key, fn)
        return composableFunction;
    }

    setDefaultContext(context: any, useComposable = false) {

        if (!this._context) {
            if (useComposable) {
                context = ComposableClass.get(context.constructor);
                context.callback = this.rebindInstance.bind(this)
            }
            this._context = context;
            this._useComposableClass = useComposable;
        }
        return this;
    }

    private composeFromChain(context?:any){
        return this._functionChain.reduce((curr, x) => x(this.bindToContext(curr, context), this.composed), this._composedBase);
    }

    public get composedChain(){
        return this.composeFromChain()
    }

    get composed(): Function {
        if(Reflect.hasMetadata(ComposableFunction.composeMetadataKey, this._execute))
            return this._execute
        this._execute = this._execute.bind(this)
        Reflect.defineMetadata(ComposableFunction.composeMetadataKey, this.key, this._execute)
        return this._execute
    }

    private rebindInstance(instance: Object) {
        const methods = []
        let traverseProto = instance;
        do {
            methods.push(...Object.getOwnPropertyNames(traverseProto).map(x => ({
                key: x,
                descriptor: Object.getOwnPropertyDescriptor(traverseProto, x)
            })));
        } while (traverseProto = Object.getPrototypeOf(traverseProto));

        for (const {key: memberKey, descriptor} of methods) {
            if (!descriptor || typeof descriptor.value !== 'function')
                continue
            if (!Reflect.hasMetadata(ComposableFunction.composeMetadataKey, descriptor.value))
                continue;
            descriptor.value = this.composeFromChain(instance)
            Object.defineProperty(instance,memberKey,descriptor);
        }
        return instance
    }

    private bindToContext(fn: Function, context?: any) {
        if (!context)
            context = this._context;
        if (!context)
            return fn;
        return fn.bind(context)
    }

    static decorator(fn: ComposableTransformation<Function>) {
        return (target: any,
                propertyKey: string,
                descriptor: PropertyDescriptor) => {
            descriptor.value = this.get(descriptor.value as Function)?.setDefaultContext(target, true).chain(fn).composed
        }
    }
}