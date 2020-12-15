"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ip6addr = require("ip6addr");
const ipaddr = require("ipaddr.js");
const ipKinds = {
    auto: 'auto',
    ipv4: 'ipv4',
    ipv4Mapped: 'v4-mapped',
    ipv6: 'ipv6'
};
const localhostIpMap = {
    ipv4: '127.0.0.1',
    ipv4Mapped: '::ffff:127.0.0.1',
    ipv6: '::1',
    ipv6Mapped: '::ffff:7f00:1'
};
var IpAddressType;
(function (IpAddressType) {
    /** 不合法的 IP Address */
    IpAddressType["Invalid"] = "invalid";
    /** IPv4 的 IP Address */
    IpAddressType["IPv4"] = "ipv4";
    /** IPv6 的 IP Address */
    IpAddressType["IPv6"] = "ipv6";
    /** CIDR */
    IpAddressType["CIDR"] = "cidr";
})(IpAddressType = exports.IpAddressType || (exports.IpAddressType = {}));
class IpAddress {
    constructor(ip, mask) {
        this.type = IpAddressType.Invalid;
        this.ipAddress = '';
        if (ip) {
            if (typeof ip === 'string') {
                let { ipAddress, prefixLength, type } = this.parse(ip, mask);
                this.type = type;
                this.ipAddress = ipAddress;
                this.prefixLength = prefixLength;
            }
            else if (ip instanceof IpAddress) {
                this.type = ip.type;
                this.ipAddress = ip.ipAddress;
                this.prefixLength = ip.prefixLength;
            }
        }
    }
    parse(ip, mask) {
        // Localhost
        if (IpAddress.isLocalhost(ip)) {
            return {
                ipAddress: localhostIpMap.ipv4,
                type: IpAddressType.IPv4,
                prefixLength: -1
            };
        }
        let type = this.getIpAddressType(String(ip));
        let address = '';
        let prefixLength = -1;
        switch (type) {
            case IpAddressType.IPv4:
                let v4Address = ip6addr.parse(ip);
                address = v4Address.toString({ format: (v4Address.kind() === ipKinds.ipv4) ? 'v4' : 'v6' });
                prefixLength = this.toPrefixLength(mask);
                break;
            case IpAddressType.IPv6:
                let v6Address = ip6addr.parse(ip);
                address = v6Address.toString({ format: (v6Address.kind() === ipKinds.ipv4) ? 'v4' : 'v6' });
                prefixLength = this.toPrefixLength(mask);
                break;
            case IpAddressType.CIDR:
                let cidr = ip6addr.createCIDR(ip);
                let cidrKind = cidr.address().kind();
                address = cidr.address().toString({ format: (cidrKind === ipKinds.ipv4) ? 'v4' : 'v6' });
                prefixLength = cidr.prefixLength();
                break;
        }
        if (prefixLength !== -1) {
            type = IpAddressType.CIDR;
        }
        return {
            ipAddress: address,
            type: type,
            prefixLength: prefixLength
        };
    }
    /** 檢查 IP 的格式 */
    getIpAddressType(ip) {
        if (IpAddress.isIpv4(ip)) {
            return IpAddressType.IPv4;
        }
        if (IpAddress.isIpv6(ip)) {
            return IpAddressType.IPv6;
        }
        if (IpAddress.isCidr(ip)) {
            return IpAddressType.CIDR;
        }
        return IpAddressType.Invalid;
    }
    /** Mask IP 轉 Prefix Length */
    toPrefixLength(maskIp) {
        let prefixLength = -1;
        try {
            if (maskIp) {
                prefixLength = ipaddr.parse(maskIp).prefixLengthFromSubnetMask();
            }
        }
        catch (_a) {
        }
        return prefixLength;
    }
    //============================================================
    /** 取得 IP String */
    toString(format = 'auto') {
        try {
            if (IpAddress.isLocalhost(this.ipAddress)) {
                switch (format) {
                    case ipKinds.auto:
                        return this.ipAddress;
                    case ipKinds.ipv4:
                        return localhostIpMap.ipv4;
                    case ipKinds.ipv4Mapped:
                        return localhostIpMap.ipv4Mapped;
                    case ipKinds.ipv6:
                        return localhostIpMap.ipv6Mapped;
                }
            }
            switch (this.type) {
                case IpAddressType.IPv4:
                case IpAddressType.IPv6:
                    let address = ip6addr.parse(this.ipAddress);
                    return address.toString({ format: format });
                case IpAddressType.CIDR:
                    let cidr = ip6addr.createCIDR(this.ipAddress, this.prefixLength);
                    return cidr.toString({ format: format });
            }
        }
        catch (_a) {
        }
        return '';
    }
    /** 取得 IP String (IPv4) */
    toIpv4String() {
        return this.toString('v4');
    }
    /** 取得 IP String (IPv6) */
    toIpv6String() {
        return this.toString('v6');
    }
    /** 取得 IP String (IPv4 Mapped) */
    toIpv4MappedString() {
        return this.toString('v4-mapped');
    }
    /** 取得 Long (僅限 IP) */
    toLong() {
        switch (this.type) {
            case IpAddressType.IPv4:
            case IpAddressType.IPv6:
                try {
                    let addr = ip6addr.parse(this.ipAddress);
                    return addr.toLong();
                }
                catch (_a) {
                }
                break;
        }
        return 0;
    }
    /** 取得 Buffer (僅限 IP) */
    toBuffer(buff) {
        switch (this.type) {
            case IpAddressType.IPv4:
            case IpAddressType.IPv6:
                try {
                    let addr = ip6addr.parse(this.ipAddress);
                    return addr.toBuffer(buff);
                }
                catch (_a) {
                }
                break;
        }
        return null;
    }
    /** 取得類型 */
    getType() {
        return this.type;
    }
    //============================================================
    /** 是否為 IP */
    static isIp(ip) {
        return IpAddress.isIpv4(ip) || IpAddress.isIpv6(ip);
    }
    /** 是否為 IPv4 */
    static isIpv4(ip) {
        try {
            if (ip) {
                let address = ip6addr.parse(ip);
                let kind = address.kind();
                return (kind === ipKinds.ipv4);
            }
            return false;
        }
        catch (_a) {
            return false;
        }
    }
    /** 是否為 IPv6 */
    static isIpv6(ip) {
        try {
            if (ip) {
                let address = ip6addr.parse(ip);
                let kind = address.kind();
                return (kind === ipKinds.ipv6);
            }
            return false;
        }
        catch (_a) {
            return false;
        }
    }
    /** 是否為 CIDR (Subnet) */
    static isCidr(ip) {
        try {
            if (ip) {
                let cidr = ip6addr.createCIDR(ip);
                return true;
            }
            return false;
        }
        catch (_a) {
            return false;
        }
    }
    /** 是否為 Localhost */
    static isLocalhost(ip) {
        if (ip) {
            return (ip === localhostIpMap.ipv4 ||
                ip === localhostIpMap.ipv4Mapped ||
                ip === localhostIpMap.ipv6 ||
                ip === localhostIpMap.ipv6Mapped);
        }
        return false;
    }
    //============================================================
    /** 檢查 IP 是否為指定 IP 或是指定網段內 */
    contains(ip) {
        let address;
        if (typeof ip === 'string') {
            address = new IpAddress(ip);
        }
        else if (ip instanceof IpAddress) {
            address = ip;
        }
        if (this.type === IpAddressType.Invalid ||
            address.getType() === IpAddressType.CIDR ||
            address.getType() === IpAddressType.Invalid) {
            return false;
        }
        switch (this.type) {
            case IpAddressType.CIDR:
                let cidr = ip6addr.createCIDR(this.toString());
                return cidr.contains(address.toString());
            case IpAddressType.IPv4:
            case IpAddressType.IPv6:
                return (this.toString() === address.toString());
            default:
                return false;
        }
    }
}
exports.IpAddress = IpAddress;
//# sourceMappingURL=ipAddress.js.map