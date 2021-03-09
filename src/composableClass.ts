import 'reflect-metadata';
import {v4} from "uuid";
import {ComposableTransformation, Constructor, staticImplements} from "./types";
import {Composable, ComposableStatic} from "./composable";


type ComposableInternalClass = Constructor & { _construct: Constructor }

@staticImplements<ComposableStatic<Constructor>>()
export class ComposableClass extends Composable<Constructor> {

    private _composed: Constructor;
    private _callback: Function | undefined = undefined

    public set callback(callback: Function) {
        this._callback = callback;
    }

    private constructor(constructor: Constructor) {
        super()
        const thisInstance = this;

        this._composed = class Composable {
            static _construct: Constructor = constructor

            constructor(...args: any[]) {
                const composedInstance = new (this.constructor as ComposableInternalClass)._construct(...args);
                if (thisInstance._callback)
                    return thisInstance._callback(composedInstance)
                return composedInstance
            }
        }
    }

    static get(constructor: Constructor): ComposableClass {
        if (Reflect.hasMetadata(this.composeMetadataKey, constructor.prototype, 'constructor')) {
            const key = Reflect.getMetadata(this.composeMetadataKey, constructor.prototype, 'constructor') as string
            return this._registry[key] as ComposableClass;
        }
        const composableClass = new ComposableClass(constructor)
        const key = v4();
        this._registry[key] = composableClass;
        Reflect.defineMetadata(this.composeMetadataKey, key, constructor.prototype, 'constructor')
        return composableClass;
    }

    chain(fn: ComposableTransformation<Constructor>): ComposableClass {
        (this._composed as ComposableInternalClass)._construct = fn((this._composed as ComposableInternalClass)._construct, this._composed);
        return this;
    }

    get composed(): Constructor {
        return this._composed;
    }

    static decorator(fn: ComposableTransformation<Constructor>) {
        return <T>(cls: Constructor<T>) => {
            return this.get(cls).chain(fn).composed as Constructor<T>
        };
    }

}


