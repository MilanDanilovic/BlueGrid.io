import { Request, Response } from "express";
import { fetchData, transformData, filterData } from "../models/file";

export const getFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await fetchData();
    console.log("DATA ", data);
    const transformedData = transformData(data);
    console.log("TRANSFORMED DATA ", transformedData);

    res.json(transformedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

export const getFilteredFiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filters = (req.query.filters as string)
      .split(",")
      .map(decodeURIComponent);
    const data = await fetchData();
    const filteredData = filterData(data, filters);
    res.json(filteredData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
