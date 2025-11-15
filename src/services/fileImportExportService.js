import * as XLSX from "xlsx";

// Parse Excel file
export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        resolve(jsonData);
      } catch (error) {
        reject(
          new Error("Excel faylını oxumaq mümkün olmadı: " + error.message)
        );
      }
    };
    reader.onerror = () => reject(new Error("Fayl oxunarkən xəta baş verdi"));
    reader.readAsArrayBuffer(file);
  });
};

// Parse CSV file
export const parseCSVFile = async (file) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",").map((v) => v.trim());
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || "";
          });
          results.push(obj);
        }
      }
      resolve(results);
    };
    reader.onerror = () =>
      reject(new Error("CSV faylını oxumaq mümkün olmadı"));
    reader.readAsText(file);
  });
};

// Parse Text file
export const parseTextFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split("\n").filter((line) => line.trim());
        const data = lines.map((line, index) => {
          // Try to parse as key-value pairs or structured data
          const parts = line.split(/[:\t,]/).map((p) => p.trim());
          return {
            row: index + 1,
            data: parts,
            raw: line,
          };
        });
        resolve(data);
      } catch (error) {
        reject(
          new Error("Mətn faylını oxumaq mümkün olmadı: " + error.message)
        );
      }
    };
    reader.onerror = () => reject(new Error("Fayl oxunarkən xəta baş verdi"));
    reader.readAsText(file);
  });
};

// Parse PDF file using pdfjs-dist
export const parsePDFFile = async (file) => {
  try {
    // Dynamically import pdfjs-dist
    const pdfjsLib = await import("pdfjs-dist");

    // Set worker source for pdfjs - use the actual version from the library
    if (typeof window !== "undefined") {
      // Get the actual version from the imported library to avoid version mismatch
      const version = pdfjsLib.version || "5.4.394";
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

      // Clear any existing worker to force reload
      if (pdfjsLib.GlobalWorkerOptions.worker) {
        pdfjsLib.GlobalWorkerOptions.worker.terminate();
        pdfjsLib.GlobalWorkerOptions.worker = null;
      }
    }

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const extractedData = [];

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Combine all text items from the page
      const pageText = textContent.items.map((item) => item.str).join(" ");

      if (pageText.trim()) {
        extractedData.push({
          page: pageNum,
          text: pageText,
        });
      }
    }

    // Parse the extracted text to find structured data
    const allText = extractedData.map((d) => d.text).join("\n");

    // Try to extract structured data from text
    const lines = allText.split("\n").filter((line) => line.trim());
    const structuredData = [];

    // Look for patterns like: month, year, revenue, expense
    const monthPattern =
      /(Yan|Fev|Mar|Apr|May|İyn|İyl|Avq|Sen|Okt|Noy|Dek|Yanvar|Fevral|Mart|Aprel|May|İyun|İyul|Avqust|Sentyabr|Oktyabr|Noyabr|Dekabr)/i;
    const numberPattern = /[\d,]+\.?\d*/g;

    lines.forEach((line, index) => {
      if (monthPattern.test(line)) {
        const numbers = line.match(numberPattern);
        if (numbers && numbers.length >= 2) {
          const gelir = parseFloat(numbers[0].replace(/,/g, "")) || 0;
          const xerc = parseFloat(numbers[1].replace(/,/g, "")) || 0;

          if (gelir > 0 || xerc > 0) {
            const monthMatch = line.match(monthPattern);
            const month = monthMatch ? monthMatch[0].substring(0, 3) : "Yan";
            const yearMatch = line.match(/\d{4}/);
            const year = yearMatch
              ? parseInt(yearMatch[0])
              : new Date().getFullYear();

            structuredData.push({
              month,
              year,
              gelir,
              xerc,
              raw: line,
            });
          }
        }
      }
    });

    return {
      raw: extractedData,
      structured: structuredData,
      fullText: allText,
      pageCount: pdf.numPages,
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("PDF faylını oxumaq mümkün olmadı: " + error.message);
  }
};

// Analyze imported data with AI
export const analyzeImportedDataWithAI = async (parsedData, fileType) => {
  try {
    const { GoogleGenAI } = await import("@google/genai");

    // Format data for AI analysis
    const dataSummary = JSON.stringify(parsedData, null, 2);

    const prompt = `Aşağıdakı ${fileType} faylından import edilmiş maliyyə məlumatlarını təhlil et və strukturlaşdırılmış məlumat çıxart:

Import edilmiş məlumatlar:
${dataSummary}

Cavabı JSON formatında ver:
{
  "monthlyData": [
    {
      "year": il (ədəd),
      "month": "Yan" | "Fev" | "Mar" | "Apr" | "May" | "İyn" | "İyl" | "Avq" | "Sen" | "Okt" | "Noy" | "Dek",
      "gelir": gəlir məbləği (ədəd),
      "xerc": xərc məbləği (ədəd)
    }
  ],
  "expenseBreakdown": [
    {
      "name": "kateqoriya adı",
      "value": məbləğ (ədəd),
      "color": "#hex rəng"
    }
  ],
  "upcomingPayments": [
    {
      "title": "ödəniş adı",
      "amount": məbləğ (ədəd),
      "date": "YYYY-MM-DD",
      "type": "expense" | "tax" | "insurance" | "subscription" | "marketing",
      "category": "kateqoriya"
    }
  ],
  "summary": "qısa xülasə",
  "confidence": "yüksək" | "orta" | "aşağı"
}

YALNIZ JSON formatında, heç bir əlavə mətn olmadan. Azərbaycan dilində.`;

    // Use AI to analyze and structure the data
    // Try to get API key from environment or use the same approach as aiService
    const apiKey =
      process.env.REACT_APP_GOOGLE_AI_API_KEY ||
      "AIzaSyAH4IUjPV46iVgn4m69eUPsBAaz9oSLcxU";
    if (!apiKey) {
      // Fallback: try to parse manually
      return parseDataManually(parsedData);
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let responseText = "";
    if (typeof response.text === "function") {
      responseText = await response.text();
    } else if (typeof response.text === "string") {
      responseText = response.text;
    } else if (response.response?.text) {
      responseText =
        typeof response.response.text === "function"
          ? await response.response.text()
          : response.response.text;
    } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = response.candidates[0].content.parts[0].text;
    }

    let jsonText = responseText.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    }

    const result = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    // Fallback to manual parsing
    return parseDataManually(parsedData);
  }
};

// Manual parsing fallback
const parseDataManually = (parsedData) => {
  const monthlyData = [];
  const expenseBreakdown = [];
  const upcomingPayments = [];

  // Handle different data structures
  const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];

  dataArray.forEach((row, index) => {
    // If it's already structured (from PDF), use it directly
    if (row.month && (row.gelir || row.xerc)) {
      monthlyData.push({
        year: row.year || new Date().getFullYear(),
        month: row.month.toString().substring(0, 3),
        gelir: Number(row.gelir) || 0,
        xerc: Number(row.xerc) || 0,
      });
      return;
    }

    // Try to extract data from common column names (for Excel/CSV)
    if (typeof row === "object" && row !== null) {
      const keys = Object.keys(row).map((k) => k.toLowerCase());

      // Look for month/year/revenue/expense columns
      const monthKey = keys.find(
        (k) => k.includes("ay") || k.includes("month")
      );
      const yearKey = keys.find((k) => k.includes("il") || k.includes("year"));
      const revenueKey = keys.find(
        (k) =>
          k.includes("gəlir") || k.includes("revenue") || k.includes("income")
      );
      const expenseKey = keys.find(
        (k) => k.includes("xərc") || k.includes("expense") || k.includes("cost")
      );

      if (revenueKey || expenseKey) {
        const month = row[monthKey] || "Yan";
        const year = parseInt(row[yearKey]) || new Date().getFullYear();
        const gelir = parseFloat(row[revenueKey]) || 0;
        const xerc = parseFloat(row[expenseKey]) || 0;

        if (gelir > 0 || xerc > 0) {
          monthlyData.push({
            year,
            month: month.toString().substring(0, 3),
            gelir,
            xerc,
          });
        }
      }
    }
  });

  return {
    monthlyData,
    expenseBreakdown,
    upcomingPayments,
    summary: "Məlumatlar manual olaraq təhlil edildi",
    confidence: "orta",
  };
};

// Export data to Excel
export const exportToExcel = (
  financialData,
  filename = "maliyyat_hesabati"
) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Monthly Data Sheet
    const monthlyData = financialData.monthlyData.map((row) => ({
      İl: row.year,
      Ay: row.month,
      Gəlir: row.gelir,
      Xərc: row.xerc,
      Mənfəət: row.profit,
      Balans: row.balance,
    }));
    const monthlySheet = XLSX.utils.json_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, "Aylıq Məlumatlar");

    // Expense Breakdown Sheet
    const expenseSheet = XLSX.utils.json_to_sheet(
      financialData.expenseBreakdown.map((e) => ({
        Kateqoriya: e.name,
        Məbləğ: e.value,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, expenseSheet, "Xərc Təhlili");

    // Upcoming Payments Sheet
    const paymentsSheet = XLSX.utils.json_to_sheet(
      financialData.upcomingPayments.map((p) => ({
        Başlıq: p.title,
        Məbləğ: p.amount,
        Tarix: p.date,
        Tip: p.type,
        Kateqoriya: p.category,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, paymentsSheet, "Gələcək Ödənişlər");

    // KPI Summary Sheet
    const kpiSheet = XLSX.utils.json_to_sheet([
      { Göstərici: "Aylıq Mənfəət", Dəyər: financialData.kpi.monthlyProfit },
      { Göstərici: "Nağd Axını", Dəyər: financialData.kpi.cashflow },
      { Göstərici: "Ümumi Xərc", Dəyər: financialData.kpi.totalExpenses },
      { Göstərici: "Artım Sürəti (%)", Dəyər: financialData.kpi.growthRate },
    ]);
    XLSX.utils.book_append_sheet(workbook, kpiSheet, "KPI Xülasəsi");

    // Write file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error("Excel export error:", error);
    throw new Error("Excel faylını yaratmaq mümkün olmadı: " + error.message);
  }
};
