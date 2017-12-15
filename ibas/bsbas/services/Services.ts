/**
 * @license
 * Copyright color-coding studio. All Rights Reserved.
 *
 * Use of this source code is governed by an Apache License, Version 2.0
 * that can be found in the LICENSE file at http://www.apache.org/licenses/LICENSE-2.0
 */

import { strings, objects, config, i18n, logger, emMessageLevel } from "../../bobas/index";
import { AbstractApplication as Application, IViewShower, IViewNavigation, IView } from "../core/index";
import { hashEventManager, IHashInfo } from "../utils/index";
import {
    IServiceContract, IServiceProxy, IService,
    IBOServiceContract, IApplicationServiceContract,
    IDataServiceContract, IBOListServiceContract, IServiceAgent,
    IServiceMapping, IBOChooseServiceCaller, IServiceCaller,
    IBOLinkServiceContract, IBOChooseServiceContract,
    IBOLinkServiceCaller, IApplicationServiceCaller,
} from "./Services.d";

/** 配置项目-默认服务图片 */
export const CONFIG_ITEM_DEFALUT_SERVICE_ICON: string = "defalutServiceIcon";
/** 地址hash值标记-服务 */
export const URL_HASH_SIGN_SERVICES: string = "#/services/";

/** 服务映射 */
export abstract class ServiceMapping implements IServiceMapping {
    constructor() {
        this.icon = config.get(CONFIG_ITEM_DEFALUT_SERVICE_ICON);
    }
    /** 视图显示者 */
    viewShower: IViewShower;
    /** 视图导航 */
    navigation: IViewNavigation;
    /** 唯一标识 */
    id: string;
    /** 名称 */
    name: string;
    /** 类别 */
    category: string;
    /** 描述 */
    description: string;
    /** 图标 */
    icon: string;
    /** 服务契约代理 */
    proxy: any;
    /** 创建服务 */
    abstract create(): IService<IServiceCaller>;
}
/** 业务对象选择服务映射 */
export abstract class BOChooseServiceMapping extends ServiceMapping {
    constructor() {
        super();
        this.proxy = BOChooseServiceProxy;
    }
    /** 重写此属性到boCode */
    get category(): string {
        return this.boCode;
    }
    set category(value: string) {
        this.boCode = value;
    }
    /** 业务对象编码 */
    boCode: string;
}
/** 业务对象连接服务映射 */
export abstract class BOLinkServiceMapping extends ServiceMapping {
    constructor() {
        super();
        this.proxy = BOLinkServiceProxy;
    }
    /** 重写此属性到boCode */
    get category(): string {
        return this.boCode;
    }
    set category(value: string) {
        this.boCode = value;
    }
    /** 业务对象编码 */
    boCode: string;
}
/** 应用服务映射 */
export abstract class ApplicationServiceMapping extends ServiceMapping {
    constructor() {
        super();
    }
    /** 重写此属性到appId */
    get category(): string {
        return this.appId;
    }
    set category(value: string) {
        this.appId = value;
    }
    /** 业务对象编码 */
    appId?: string;
}
/** 服务代理 */
export class ServiceProxy<C extends IServiceContract> implements IServiceProxy<C> {
    constructor(contract: C) {
        this.contract = contract;
    }
    /** 服务的契约 */
    contract: C;
}
/** 数据服务代理 */
export class DataServiceProxy<T> extends ServiceProxy<IDataServiceContract<T>> {
}
/** 业务对象服务代理 */
export class BOServiceProxy extends ServiceProxy<IBOServiceContract> {
}
/** 业务对象列表服务代理 */
export class BOListServiceProxy extends ServiceProxy<IBOListServiceContract> {
}
/** 业务对象连接服务代理 */
export class BOLinkServiceProxy extends ServiceProxy<IBOLinkServiceContract> {
}
/** 业务对象选择服务代理 */
export class BOChooseServiceProxy extends ServiceProxy<IBOChooseServiceContract> {
}
/** 应用服务代理 */
export abstract class ApplicationServiceProxy<T> extends ServiceProxy<IApplicationServiceContract<T>> {
}
/** 服务管理员 */
export class ServicesManager {
    constructor() {
        let that: this = this;
        hashEventManager.registerListener({
            hashSign: URL_HASH_SIGN_SERVICES,
            onHashChanged(event: any): void {
                try {
                    let url: string = event.newURL.substring(
                        event.newURL.indexOf(URL_HASH_SIGN_SERVICES) + URL_HASH_SIGN_SERVICES.length);
                    let serviceId: string = url.substring(0, url.indexOf("/"));
                    let mapping: IServiceMapping = that.getServiceMapping(serviceId);
                    if (!objects.isNull(mapping)) {
                        let service: IService<IServiceCaller> = mapping.create();
                        if (!objects.isNull(service)) {
                            let method: string = url.substring(url.indexOf("/") + 1);
                            logger.log(emMessageLevel.DEBUG,
                                "services: call service [{0}-{1}], hash value [{2}] ", mapping.description, mapping.id, method);
                            // 运行服务
                            if (objects.instanceOf(service, Application)) {
                                (<Application<IView>>service).viewShower = mapping.viewShower;
                                (<Application<IView>>service).navigation = mapping.navigation;
                            }
                            service.run({
                                category: method
                            });
                        }
                    }
                } catch (error) {
                    logger.log(error);
                }
            }
        });
    }
    /** 服务映射 */
    private mappings: Map<string, IServiceMapping>;
    /** 注册服务映射 */
    register(mapping: IServiceMapping): void {
        if (objects.isNull(mapping)) {
            return;
        }
        if (objects.isNull(this.mappings)) {
            this.mappings = new Map();
        }
        this.mappings.set(mapping.id, mapping);
        // 如当前注册的服务为Hash指向的服务,激活
        let hashInfo: IHashInfo = hashEventManager.currentHashInfo();
        if (hashInfo.category === URL_HASH_SIGN_SERVICES
            && strings.equals(mapping.id, hashInfo.id)) {
            hashEventManager.fireHashChanged();
        }
    }
    /** 获取服务映射 */
    getServiceMapping(id: string): IServiceMapping {
        if (objects.isNull(this.mappings)) {
            return null;
        }
        if (this.mappings.has(id)) {
            return this.mappings.get(id);
        }
        return null;
    }
    /** 获取服务代理 */
    getServiceProxy(id: string): IServiceProxy<IServiceContract> {
        let mappping: IServiceMapping = this.getServiceMapping(id);
        if (objects.isNull(mappping)) {
            return null;
        }
        return mappping.proxy();
    }
    /** 获取服务 */
    getServices(proxy: IServiceProxy<IServiceContract>): IServiceAgent[] {
        let services: Array<IServiceAgent> = new Array<IServiceAgent>();
        if (!objects.isNull(this.mappings)) {
            for (let mapping of this.mappings.values()) {
                if (!objects.instanceOf(proxy, mapping.proxy)) {
                    continue;
                }
                // 创建服务
                services.push({
                    id: mapping.id,
                    name: mapping.name,
                    category: mapping.category,
                    description: mapping.description,
                    icon: mapping.icon,
                    run(): void {
                        // 创建服务
                        let service: IService<IServiceContract> = mapping.create();
                        if (!objects.isNull(service)) {
                            // 运行服务
                            if (objects.instanceOf(service, Application)) {
                                (<Application<IView>>service).viewShower = mapping.viewShower;
                                (<Application<IView>>service).navigation = mapping.navigation;
                            }
                            service.run(proxy.contract);
                        }
                    }
                });
            }
        }
        return services;
    }
    /**
     * 运行服务
     * @param caller 调用者
     * @returns 是否成功运行服务
     */
    private runService(caller: IServiceCaller): boolean {
        if (objects.isNull(caller)) {
            throw new Error(i18n.prop("sys_invalid_parameter", "caller"));
        }
        if (objects.isNull(caller.proxy) || !objects.isAssignableFrom(caller.proxy, ServiceProxy)) {
            throw new Error(i18n.prop("sys_invalid_parameter", "caller.proxy"));
        }
        let proxy: IServiceProxy<IServiceContract> = new caller.proxy(caller);
        for (let service of this.getServices(proxy)) {
            if (!objects.isNull(caller.category) && caller.category !== service.category) {
                // 类别不符
                continue;
            }
            // 运行服务
            service.run();
            return true;
        }
        // 没有找到服务
        return false;
    }
    /** 运行选择服务 */
    runChooseService<D>(caller: IBOChooseServiceCaller<D>): void {
        if (objects.isNull(caller)) {
            throw new Error(i18n.prop("sys_invalid_parameter", "caller"));
        }
        if (objects.isNull(caller.boCode)) {
            throw new Error(i18n.prop("sys_invalid_parameter", "caller.boCode"));
        }
        if (objects.isNull(caller.proxy)) {
            // 设置代理
            caller.proxy = BOChooseServiceProxy;
        }
        // 设置服务类别码
        caller.category = caller.boCode;
        // 调用服务
        if (!this.runService(caller)) {
            // 服务未运行
            logger.log(emMessageLevel.WARN, "services: not found [{0}]'s choose service.", caller.boCode);
        }
    }
    /** 运行连接服务 */
    runLinkService(caller: IBOLinkServiceCaller): void {
        if (objects.isNull(caller)) {
            throw new Error(i18n.prop("sys_invalid_parameter", "caller"));
        }
        if (objects.isNull(caller.boCode)) {
            throw new Error(i18n.prop("sys_invalid_parameter", "caller.boCode"));
        }
        if (objects.isNull(caller.linkValue)) {
            throw new Error(i18n.prop("sys_invalid_parameter", "caller.linkValue"));
        }
        if (objects.isNull(caller.proxy)) {
            // 设置代理
            caller.proxy = BOLinkServiceProxy;
        }
        // 设置服务类别码
        caller.category = caller.boCode;
        // 调用服务
        if (!this.runService(caller)) {
            // 服务未运行
            logger.log(emMessageLevel.WARN, "services: not found [{0}]'s choose service.", caller.boCode);
        }
    }
    /**
     * 运行应用服务
     * @param caller 调用者<In,Out>(<输入类型,输出类型>)
     */
    runApplicationService<In, Out>(caller: IApplicationServiceCaller<In, Out>): void {
        if (objects.isNull(caller)) {
            throw new Error(i18n.prop("sys_invalid_parameter", "caller"));
        }
        if (objects.isNull(caller.proxy) || !objects.isAssignableFrom(caller.proxy, ServiceProxy)) {
            throw new Error(i18n.prop("sys_invalid_parameter", "caller.proxy"));
        }
        if (!objects.isNull(caller.appId)) {
            // 设置服务类别码
            caller.category = caller.appId;
        }
        // 调用服务
        if (!this.runService(caller)) {
            // 服务未运行
            logger.log(emMessageLevel.WARN, "services: not found [{0}]'s application service.", objects.getName(caller.proxy));
        }
    }
}