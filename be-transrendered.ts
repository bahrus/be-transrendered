import {define, BeDecoratedProps} from 'be-decorated/DE.js';
import {Proxy, PP, Actions, VirtualProps, PPP, PPE, PPPP} from './types';
import {RenderContext} from 'trans-render/lib/types';
import {register} from "be-hive/register.js";

export class BeTransrendered extends EventTarget implements Actions{


    async instantiate(pp: PP, mold: Partial<PP>): PPPP {
        //TODO lots of common code with be-free-ranged.  maybe move some to be-transformed package.
        const {transformIslets, self, template} = pp;
        const {DTR} = await import('trans-render/lib/DTR.js');
        const {getDestructArgs} = await import('trans-render/lib/getDestructArgs.js');
        let clone: DocumentFragment | undefined;
        if(self.innerHTML.trim() === ''){
            clone = template!.content.cloneNode(true) as DocumentFragment;
        }
        const {IsletTransformer} = await import('./IsletTransformer.js');
        for(const transformIslet of transformIslets!){
            const {transform, islet} = transformIslet;
            let {isletDependencies, scopesUp} = transformIslet;
            if(isletDependencies === undefined){
                isletDependencies = transformIslet.isletDependencies = getDestructArgs(islet);
            }
            let host: any = undefined;
            if(scopesUp === undefined) scopesUp = 0;
            if(scopesUp === -1){
                host = (<any>self.getRootNode()).host; //TODO await customElements.whenDefined;
            }else{
                let count = 0;
                let el = self as Element | null;
                while(count <= scopesUp){
                    el = el!.closest('[itemscope]');
                    if(el === null){
                        host = (<any>self.getRootNode()).host; //TODO await customElements.whenDefined;
                        break;
                    }
                    count++;
                }
                host = el;
            }
            const ctx: RenderContext = {
                host,
                match: transform,
            };
            const transformer = new DTR(ctx);
            transformIslet.transformer = transformer;

            let {transformDependencies} = transformIslet;
            if(transformDependencies === undefined){
                transformDependencies = transformIslet.transformDependencies = await transformer.getDep();
            }

            if(islet !== undefined){
                Object.assign(host!, islet(host));
            }
            if(clone !== undefined){
                await transformer.transform(clone);
                
            }

            for(const transformIslet of transformIslets!){
                new IsletTransformer(self, transformIslet, host!);
            }
        }
        if(clone !== undefined){
            self.appendChild(clone);
        }
        return mold;
    }
}

const tagName = 'be-transrendered';
const ifWantsToBe = 'transrendered';
const upgrade = '*';

define<Proxy & BeDecoratedProps<Proxy, Actions>, Actions>({
    config: {
        tagName,
        propDefaults: {
            ifWantsToBe,
            upgrade,
            virtualProps: ['transformIslets', 'template']
        },
        actions:{
            instantiate: {
                ifAllOf: ['transformIslets', 'template'],
                returnObjMold: {
                    resolved: true,
                }
            }
        }
    },
    complexPropDefaults: {
        controller: BeTransrendered
    }
});
register(ifWantsToBe, upgrade, tagName);