interface SiteData {
    main_page: {
        top_text: string;
    };
}
declare function readData(): Promise<SiteData | null>;
export default SiteData;
export { readData };
//# sourceMappingURL=data_parser.d.ts.map