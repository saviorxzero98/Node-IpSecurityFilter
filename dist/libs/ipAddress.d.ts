export declare enum IpAddressType {
    /** 不合法的 IP Address */
    Invalid = "invalid",
    /** IPv4 的 IP Address */
    IPv4 = "ipv4",
    /** IPv6 的 IP Address */
    IPv6 = "ipv6",
    /** CIDR */
    CIDR = "cidr"
}
export declare class IpAddress {
    private type;
    private ipAddress;
    private prefixLength;
    constructor(ip: string);
    constructor(ip: string, mask: string);
    constructor(ip: IpAddress);
    /** 解析 IP */
    private parse;
    /** 檢查 IP 的格式 */
    getIpAddressType(ip: string): IpAddressType;
    /** Mask IP 轉 Prefix Length */
    private toPrefixLength;
    /** 取得 IP String */
    toString(format?: 'auto' | 'v4' | 'v4-mapped' | 'v6'): string;
    /** 取得 IP String (IPv4) */
    toIpv4String(): string;
    /** 取得 IP String (IPv6) */
    toIpv6String(): string;
    /** 取得 IP String (IPv4 Mapped) */
    toIpv4MappedString(): string;
    /** 取得 Long (僅限 IP) */
    toLong(): number;
    /** 取得 Buffer (僅限 IP) */
    toBuffer(buff?: Uint8Array): Uint8Array;
    /** 取得類型 */
    getType(): IpAddressType;
    /** 是否為 IP */
    static isIp(ip: string): boolean;
    /** 是否為 IPv4 */
    static isIpv4(ip: string): boolean;
    /** 是否為 IPv6 */
    static isIpv6(ip: string): boolean;
    /** 是否為 CIDR (Subnet) */
    static isCidr(ip: string): boolean;
    /** 是否為 Localhost */
    static isLocalhost(ip: string): boolean;
    /** 檢查 IP 是否為指定 IP 或是指定網段內 */
    contains(ip: string | IpAddress): boolean;
}
