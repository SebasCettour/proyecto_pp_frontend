import { Router, Request, Response } from "express";
import {
  buscarCIE10BioPortal,
  buscarCIE10ClinicalTables,
} from "../API/CIE10Api.js";

const router = Router();

interface Diagnostico {
  codigo: string;
  descripcion: string;
  sinonimos?: string[];
}

// Ruta de búsqueda de diagnósticos CIE-10 por código o descripción usando BioPortal
router.get(
  "/search",
  async (req: Request, res: Response) => {
    const query = (req.query.query as string | undefined)?.trim();
    const BIOPORTAL_APIKEY = process.env.BIOPORTAL_API_KEY;

    console.log("🔍 CIE10 Search - Query recibida:", query);
    console.log("🔑 API KEY disponible:", !!BIOPORTAL_APIKEY);

    if (!query) {
      return res.status(400).json({ error: "query required" });
    }

    try {
      if (BIOPORTAL_APIKEY) {
        const data = await buscarCIE10BioPortal(query, BIOPORTAL_APIKEY);
        console.log(
          "📦 BioPortal raw data:",
          JSON.stringify(data, null, 2).substring(0, 500)
        );

        const mapped: Diagnostico[] = (data.collection || []).map((item: any) => ({
          codigo: Array.isArray(item.notation)
            ? item.notation[0]
            : item.notation || item["@id"] || "",
          descripcion: item.prefLabel || "",
          sinonimos: Array.isArray(item.synonym)
            ? item.synonym
            : item.synonym
              ? [item.synonym]
              : [],
        }));

        console.log("✅ Resultados mapeados (BioPortal):", mapped.length);
        return res.json(mapped);
      }

      console.warn("⚠️ BioPortal API key ausente, usando fallback ClinicalTables");
      const fallback = await buscarCIE10ClinicalTables(query);
      return res.json(fallback);
    } catch (err: any) {
      console.error("❌ BioPortal search failed:", err?.message || err);
      try {
        const fallback = await buscarCIE10ClinicalTables(query);
        console.log("✅ Resultados mapeados (ClinicalTables fallback):", fallback.length);
        return res.json(fallback);
      } catch (fallbackErr: any) {
        console.error(
          "❌ ClinicalTables fallback failed:",
          fallbackErr?.message || fallbackErr
        );
        return res.status(502).json({
          error: "CIE10 search failed",
          detail: fallbackErr?.message || err?.message || "unknown error",
        });
      }
    }
  }
);

export default router;
