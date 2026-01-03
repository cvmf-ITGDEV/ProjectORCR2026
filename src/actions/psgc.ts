"use server";

import { PSGCRepository } from "@/repositories/PSGCRepository";
import { ActionResult } from "@/types";

export async function getRegions(): Promise<ActionResult> {
  try {
    const regions = await PSGCRepository.findAllRegions();
    return { success: true, data: regions };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getProvincesByRegion(regCode: string): Promise<ActionResult> {
  try {
    const provinces = await PSGCRepository.findProvincesByRegion(regCode);
    return { success: true, data: provinces };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getCitiesByProvince(provCode: string): Promise<ActionResult> {
  try {
    const cities = await PSGCRepository.findCitiesByProvince(provCode);
    return { success: true, data: cities };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function searchProvinces(query: string): Promise<ActionResult> {
  try {
    if (query.length < 2) {
      return { success: false, error: "Query must be at least 2 characters" };
    }

    const provinces = await PSGCRepository.searchProvinces(query);
    return { success: true, data: provinces };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function searchCities(query: string): Promise<ActionResult> {
  try {
    if (query.length < 2) {
      return { success: false, error: "Query must be at least 2 characters" };
    }

    const cities = await PSGCRepository.searchCities(query);
    return { success: true, data: cities };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getAllProvinces(): Promise<ActionResult> {
  try {
    const provinces = await PSGCRepository.findAllProvinces();
    return { success: true, data: provinces };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getAllCities(): Promise<ActionResult> {
  try {
    const cities = await PSGCRepository.findAllCities();
    return { success: true, data: cities };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getRegionByCode(psgcCode: string): Promise<ActionResult> {
  try {
    const region = await PSGCRepository.findRegionByCode(psgcCode);
    if (!region) {
      return { success: false, error: "Region not found" };
    }
    return { success: true, data: region };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getProvinceByCode(psgcCode: string): Promise<ActionResult> {
  try {
    const province = await PSGCRepository.findProvinceByCode(psgcCode);
    if (!province) {
      return { success: false, error: "Province not found" };
    }
    return { success: true, data: province };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getCityByCode(psgcCode: string): Promise<ActionResult> {
  try {
    const city = await PSGCRepository.findCityByCode(psgcCode);
    if (!city) {
      return { success: false, error: "City not found" };
    }
    return { success: true, data: city };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
