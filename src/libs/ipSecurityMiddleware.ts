import * as express from 'express';

import { IpAddress } from "./ipAddress";
import { IpFilter, IpFilterMode } from "./ipFilter";

export type IpDenyMessageCallback = (message: string) => void;

/** IP 過濾工具程式 */
export class IpSecurityUtils {
    public static readonly xForwardedFor: string = 'x-forwarded-for';

    /** 取得 Ip Security Middleware */
    public static getIpSecurityMiddleware(config: IpSecurityRule, errorlogger ?: IpDenyMessageCallback) {
        return (req, res, next) => {
            // 檢查是否啟用 IP 過濾
            if (config == undefined || !config.isEnable) {
                next();
                return;
            }
            
            // 檢查 IP
            if (req && req.connection) {
                let ipFilter = IpSecurityUtils.createIpSecurityFilter(config);
                let remoteAddress = req.connection.remoteAddress;
        
                // 是否使用 Proxy
                if (req.headers && req.headers[IpSecurityUtils.xForwardedFor]) {
                    let proxyIps = IpSecurityUtils.getClientIpListFromxForwardedFor(req.headers[IpSecurityUtils.xForwardedFor]);
                    
                    // 檢查 Proxy 的 IP 是否可信任的 (確保不是造假)
                    if (!IpSecurityUtils.isTrustedProxy(proxyIps, remoteAddress, config, errorlogger)) {
                        if (errorlogger) {
                            errorlogger(`Deny ip ${remoteAddress} access and X-Forward-For ${req.headers[IpSecurityUtils.xForwardedFor]}`);
                        }
                        res.status(403).end();
                        return;
                    }
        
                    // 取得 Client IP
                    if (proxyIps.length !== 0) {
                        remoteAddress = proxyIps[0];
                    }
                }
        
                // 檢查 IP 是否允許
                if (ipFilter.check(remoteAddress)) {
                    next();
                }
                else {
                    if (errorlogger) {
                        errorlogger(`Deny ip ${remoteAddress} access.`);
                    }
                }
            }
            res.status(403).end();
        }
    }



    /** 建立 IP Filter */
    public static createIpSecurityFilter(config: IpSecurityRule) {
        let filterMode: IpFilterMode;
        switch (config.mode) {
            case IpFilterMode.Allow:
                filterMode = IpFilterMode.Allow;
                break;
            default:
                filterMode = IpFilterMode.Deny;
                break;
        }
        let ipFilter = new IpFilter(filterMode);
        ipFilter.addAllowAddressList(config.allowIpList);
        ipFilter.addDenyAddressList(config.denyIpList);
        return ipFilter;
    }

    /** 檢查 Proxy 是否可被信任 */
    public static isTrustedProxy(forwardedIpList: string[], remoteAddress: string, config: IpSecurityRule, errorlogger ?: IpDenyMessageCallback): boolean {
        let ipFilter = new IpFilter(IpFilterMode.Allow);
        ipFilter.addAllowAddressList(config.trustedProxyIpList);
    
        for (let i = 1; i < forwardedIpList.length; i++) {
            let forwardedIp = forwardedIpList[i];
            if (!ipFilter.check(forwardedIp)) {
                if (errorlogger) {
                    errorlogger(`Deny proxy ip ${forwardedIp} access.`);
                }
                return false;
            }
        }  
        return ipFilter.check(remoteAddress);
    };

    /** 取得 Client 的 IP */
    public static getClientIp(req: any): string {
        let ipAddress: string;
        if (req && req.connection) {
            let remoteAddress = req.connection.remoteAddress;

            // 是否使用 Proxy
            if (req.headers && req.headers[IpSecurityUtils.xForwardedFor]) {

                let proxyIps = IpSecurityUtils.getClientIpListFromxForwardedFor(req.headers[IpSecurityUtils.xForwardedFor]);
    
                // 取得 Client IP
                if (proxyIps.length !== 0) {
                    ipAddress = new IpAddress(proxyIps[0]).toString();
                    return ipAddress;
                }
            }
    
            if (remoteAddress) {
                ipAddress = new IpAddress(remoteAddress).toString();
            }
        }
        return ipAddress;
    }

    /** 取得 x-forwarded-for 的所有 IP */
    public static getClientIpListFromxForwardedFor(value: string): string[] {
        if (value) {
            let forwardedIpList = value.split(',').map((e) => {
                const ip = e.trim();
                if (ip.includes(':')) {
                    const splitted = ip.split(':');
                    if (splitted.length === 2) {
                        return splitted[0];
                    }
                }
                return ip;
            });
            return forwardedIpList;
        }
        return [];
    }
}

/** IP 設定規則 */
export class IpSecurityRule {
    public static readonly configName = 'ipSecurityOptions';
    
    public isEnable: boolean;
    public mode: string;
    public allowIpList: string[];
    public denyIpList: string[];
    public trustedProxyIpList: string[];


    constructor(isEnable: boolean = false, mode: string = IpFilterMode.Deny, allowIpList ?: string[], 
                denyIpList ?: string[], trustedProxyIpList ?: string[]) {
        this.isEnable = isEnable;
        this.mode = mode;
        this.allowIpList = (allowIpList && Array.isArray(allowIpList)) ? allowIpList : [];
        this.denyIpList = (denyIpList && Array.isArray(denyIpList)) ? denyIpList : [];
        this.trustedProxyIpList = (trustedProxyIpList && Array.isArray(trustedProxyIpList)) ? trustedProxyIpList : [];
    }

    /** 建立 Rule */
    public static createRule(options: any): IpSecurityRule {       
        if (options) {
            let isEnable = options['isEnable'];
            let mode = options['mode'];
            let allowIpList = options['allowIpList'];
            let denyIpList = options['denyIpList'];
            let trustedProxyIpList = options['trustedProxyIpList'];

            return new IpSecurityRule(isEnable, mode, allowIpList, denyIpList, trustedProxyIpList);
        }
        else {
            return new IpSecurityRule();
        }
    }
}