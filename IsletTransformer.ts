import {TransformIslet, ProxyPropChangeInfo} from '../trans-render/lib/types';
export class IsletTransformer{
    #transformNeeded = false;
    constructor(
        public target: Element, 
        public transformIslet: TransformIslet,
        host: EventTarget
        ){
        this.init(host);
    }
    
    async init(host: EventTarget){
        const {islet, transform, isletDependencies, transformDependencies} = this.transformIslet;
        const self = this;
        const {getPropagator} = await import('trans-render/lib/getPropagator.js');
        const eventTarget = await getPropagator(host);
        eventTarget.addEventListener('prop-changed', async e => {
            const changeInfo = (e as CustomEvent).detail as ProxyPropChangeInfo;
            const {prop, newVal, oldVal} = changeInfo;
            if(newVal === oldVal) return;
            if(isletDependencies?.includes(prop)){
                const {ScopeNavigator} = await import('trans-render/lib/ScopeNavigator.js');
                const sn = new ScopeNavigator(this.target);
                Object.assign(host, islet(eventTarget, sn));
            }
            if(transformDependencies?.has(prop)){
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