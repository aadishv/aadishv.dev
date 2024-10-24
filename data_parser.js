async function readData() {
    try {
        const response = await fetch('./data.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Failed to fetch data:', error);
        return null;
    }
}
export { readData };
//# sourceMappingURL=data_parser.js.map