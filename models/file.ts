import axios from "axios";

let cachedResponse: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hr

export const fetchData = async (): Promise<any> => {
  const currentTime = new Date().getTime();

  if (cachedResponse && currentTime - lastFetchTime < CACHE_DURATION) {
    return cachedResponse;
  }
  const FILE_API = process.env.FILE_API;
  if (!FILE_API) {
    throw new Error("FILE_API undefined or null");
  }
  const response = await axios.get(FILE_API);
  cachedResponse = response.data;
  lastFetchTime = currentTime;

  return response.data;
};

const buildHierarchy = (pathParts: string[], currentLevel: any): void => {
  const part = pathParts.shift();
  if (!part) return;

  let nextLevel = currentLevel.find(
    (obj: any) => typeof obj === "object" && obj.hasOwnProperty(part)
  );

  if (!nextLevel) {
    nextLevel = { [part]: [] };
    currentLevel.push(nextLevel);
  }

  if (pathParts.length === 0) {
    nextLevel[part].push(part);
  } else {
    buildHierarchy(pathParts, nextLevel[part]);
  }
};

export const transformData = (data: any): Record<string, any> => {
  const result: Record<string, any> = {};

  data.items.forEach((item: { fileUrl: string }) => {
    const urlObj = new URL(item.fileUrl);
    const ipAddress = urlObj.hostname;
    const pathParts = urlObj.pathname.split("/").filter(Boolean);

    if (!result[ipAddress]) {
      result[ipAddress] = [];
    }

    buildHierarchy(pathParts, result[ipAddress]);
  });

  return result;
};

const addFilter = (
  targetLevel: any[],
  filterParts: string[],
  finalPart: string
): void => {
  let currentLevel = targetLevel;

  filterParts.forEach((part, index) => {
    let nextLevel = currentLevel.find(
      (obj: any) => typeof obj === "object" && obj.hasOwnProperty(part)
    );

    if (!nextLevel) {
      nextLevel = { [part]: [] };
      currentLevel.push(nextLevel);
    }

    if (index === filterParts.length - 1) {
      nextLevel[part].push(finalPart);
    } else {
      currentLevel = nextLevel[part];
    }
  });
};

export const filterData = (data: any, filters: string[]): any => {
  const transformedData = transformData(data);
  const filteredData: any = {};

  Object.keys(transformedData).forEach((ip) => {
    filteredData[ip] = [];

    filters.forEach((filter) => {
      const filterParts = filter.split("/").filter(Boolean);
      const finalPart = filterParts.pop();
      if (!finalPart) return;

      addFilter(filteredData[ip], filterParts, finalPart);
    });

    if (filteredData[ip].length === 0) {
      delete filteredData[ip];
    }
  });

  return filteredData;
};
