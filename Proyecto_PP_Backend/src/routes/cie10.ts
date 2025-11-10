import { Router, Request, Response } from "express";

const router = Router();

interface Diagnostico {
  codigo: string;
  descripcion: string;
  sinonimos?: string[];
}

// Debes definir tu API KEY de BioPortal en una variable de entorno
const BIOPORTAL_APIKEY = process.env.BIOPORTAL_API_KEY!;

// Ruta de búsqueda de diagnósticos CIE-10 por código o descripción usando BioPortal
router.get(
  "/search",
  async (req: Request, res: Response) => {
    const query = (req.query.query as string | undefined)?.trim();

    console.log("🔍 CIE10 Search - Query recibida:", query);
    console.log("🔑 API KEY disponible:", !!BIOPORTAL_APIKEY);

    if (!query) {
      return res.status(400).json({ error: "query required" });
    }

    try {
      const url = `https://data.bioontology.org/search?q=${encodeURIComponent(
        query
      )}&ontologies=ICD10CM&include=prefLabel,synonym,notation&pagesize=10`;
      
      console.log("🌐 URL BioPortal:", url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `apikey token=${BIOPORTAL_APIKEY}`,
          Accept: "application/json",
        },
      });

      console.log("📡 BioPortal response status:", response.status);

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error("❌ BioPortal error:", response.status, text);
        return res
          .status(response.status)
          .json({ error: text || "BioPortal error" });
      }

      const data = await response.json();
      console.log("📦 BioPortal raw data:", JSON.stringify(data, null, 2).substring(0, 500));

      // Mapea resultados a un formato simple
      const mapped: Diagnostico[] = (data.collection || []).map((item: any) => ({
        codigo: item.notation || item["@id"] || "",
        descripcion: item.prefLabel || "",
        sinonimos: item.synonym || [],
      }));

      console.log("✅ Resultados mapeados:", mapped.length, "diagnósticos");
      console.log("📋 Primer resultado:", mapped[0]);

      return res.json(mapped);
    } catch (err: any) {
      console.error("❌ BioPortal search failed:", err?.message || err);
      return res.status(500).json({ error: "BioPortal search failed" });
    }
  }
);

export default router;
