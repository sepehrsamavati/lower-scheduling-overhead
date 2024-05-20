// @ts-check

import fs from "node:fs/promises";

/**
 * 
 * @param {string} filename
 * @param {Array<{ key: string; value: number }>} obj 
 */
export const saveKeyValue = async (filename, obj) => {
    try {
        await fs.writeFile(`./cache/${filename}.json`, JSON.stringify(obj));
    } catch (err) {
        console.error("Save key value statistics error", err);
    }
};
