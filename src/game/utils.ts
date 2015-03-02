export function findItem<TItem>(arr: TItem[], params: any): TItem {
    let output = null;
    for(let i = 0; i < arr.length; i++) {
        let keyMatches: number = 0;
        let totalKeys: number = 0;
        let item: any = arr[i];

        for(let paramKey in params) {
            if (params.hasOwnProperty(paramKey)) {
                totalKeys++;
                if (item[paramKey] === params[paramKey]) {
                    keyMatches++;
                }
            }
        }

        if (totalKeys === keyMatches) {
            output = item;
            break;
        }
    }
    return output;
}

export function randomArray<T>(arr: T[]): T {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
}