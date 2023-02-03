import {TransformIslet, ProxyPropChangeInfo} from '../trans-render/lib/types';
import {getAdjacentChildren} from 'trans-render/lib/getAdjacentChildren.js';
export class IsletTransformer{
    #transformNeeded = false;
    constructor(
        public target: Element, 
        public transformIslet: TransformIslet,
        host: EventTarget
        ){
        const {islet, transform, isletDependencies, transformDependencies} = transformIslet;
        const self = this;
        host.addEventListener('prop-changed', async e => {
            const changeInfo = (e as CustomEvent).detail as ProxyPropChangeInfo;
            const {prop, newVal, oldValue} = changeInfo;
            if(newVal === oldValue) return;
            if(isletDependencies!.includes(prop)){
                const {ScopeNavigator} = await import('trans-render/lib/ScopeNavigator.js');
                const sn = new ScopeNavigator(this.target);
                Object.assign(host, islet(host, sn));
            }
            if(transformDependencies!.has(prop)){
                self.#transformNeeded = true;
                (async () => {
                    await self.doTransform();
                })();
            }
        });
    }

    async doTransform(){
        if(!this.#transformNeeded) return;
        this.#transformNeeded = false;
        const {transformer} = this.transformIslet;
        transformer!.transform(this.target);
    }
}