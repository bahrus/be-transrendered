import {BeDecoratedProps, MinimalProxy, EventConfigs} from 'be-decorated/types';
import {TransformIslet} from 'trans-render/lib/types';

export interface EndUserProps{
    transformIslets?: TransformIslet[];
    host?: EventTarget;
    template?: HTMLTemplateElement;
}

export interface VirtualProps extends EndUserProps, MinimalProxy{}

export type Proxy = Element & VirtualProps;

export interface PP extends VirtualProps{
    proxy: Proxy;
}

export type PPP = Partial<PP>;

export type PPPP = Promise<Partial<PP>>;

export type PPE = [PPP, EventConfigs<PPP, Actions>];

export interface Actions{
    instantiate(pp: PP, mold: PPP): Promise<PPP>;
}