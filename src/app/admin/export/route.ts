import { desc } from "drizzle-orm";
import ExcelJS from "exceljs";
import { getDb, schema } from "@/db";
import { isAdmin } from "@/lib/auth";
import { EXPOSURE_OPTIONS, QUESTIONS, SOURCE_OPTIONS } from "@/lib/questions";
import { STATUS_LABELS } from "../status-labels";

const dateFormat = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Belgrade",
  dateStyle: "short",
  timeStyle: "short",
});

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const entries = await getDb().select().from(schema.entries).orderBy(desc(schema.entries.createdAt));

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Regjistrimet");
  sheet.columns = [
    { header: "Data", width: 18 },
    { header: "Emri dhe mbiemri", width: 28 },
    { header: "Mosha", width: 8 },
    { header: "Telefoni", width: 20 },
    { header: "Statusi", width: 18 },
    { header: "Shenjat", width: 50 },
    ...QUESTIONS.map((q) => ({ header: q.short, width: 22 })),
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  for (const e of entries) {
    const a = e.answers;
    sheet.addRow([
      dateFormat.format(e.createdAt),
      // Written as text cells, so names or phone numbers are never read as formulas
      // and leading zeros in phone numbers are kept.
      e.fullName,
      e.age,
      e.phone,
      STATUS_LABELS[e.status],
      e.flags.map((f) => f.text).join("; "),
      ...QUESTIONS.map((q) => {
        if (q.id === "exposure") {
          return (a.exposure ?? []).map((v) => EXPOSURE_OPTIONS.find((o) => o.value === v)?.label ?? v).join("; ");
        }
        if (q.id === "source") return SOURCE_OPTIONS.find((o) => o.value === a.source)?.label ?? "";
        const v = a[q.id];
        return v === "po" ? "Po" : v === "jo" ? "Jo" : "";
      }),
    ]);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const day = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Belgrade" }).format(new Date());

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="pact-regjistrimet-${day}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
