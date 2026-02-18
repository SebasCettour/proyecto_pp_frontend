import fetch from "node-fetch";

export const buscarCIE10BioPortal = async (query: string, apikey: string) => {
  const url = `https://data.bioontology.org/search?q=${encodeURIComponent(
    query
  )}&ontologies=ICD10CM&include=prefLabel,synonym,notation&pagesize=10`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  const response = await fetch(url, {
    headers: {
      Authorization: `apikey token=${apikey}`,
      Accept: "application/json",
      "Accept-Language": "es", //no funciona
    },
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `BioPortal HTTP ${response.status}${text ? `: ${text}` : ""}`
    );
  }

  const data = await response.json();
  return data;
};

export interface CIE10Diagnostico {
  codigo: string;
  descripcion: string;
  sinonimos?: string[];
}

export const buscarCIE10ClinicalTables = async (
  query: string
): Promise<CIE10Diagnostico[]> => {
  const url = `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(
    query
  )}&maxList=20`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `ClinicalTables HTTP ${response.status}${text ? `: ${text}` : ""}`
    );
  }

  const payload = (await response.json()) as any[];
  const codigos = Array.isArray(payload?.[1]) ? payload[1] : [];

  const descripcionesRaw = Array.isArray(payload?.[3]) ? payload[3] : [];
  const descripciones = descripcionesRaw.map((item: any) => {
    if (Array.isArray(item)) return String(item[1] ?? item[0] ?? "");
    return String(item ?? "");
  });

  return codigos.map((codigo: any, idx: number) => ({
    codigo: String(codigo ?? ""),
    descripcion: String(descripciones[idx] ?? ""),
    sinonimos: [],
  }));
};
