import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";

const prisma = new PrismaClient();

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const activities = await prisma.activity.findMany({
        include: {
            subscriptions: true,
        },
        orderBy: {
            startTime: "asc",
        },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Iscrizioni Monteore";
    workbook.created = new Date();

    for (const activity of activities) {
        const sheetName = activity.name.substring(0, 31); // Excel sheet names must be max 31 chars
        const worksheet = workbook.addWorksheet(sheetName);

        // Header
        worksheet.addRow([`${activity.name} - ${activity.location}`]);
        worksheet.addRow([
            `${activity.startTime.toLocaleString("it-IT", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })} - ${activity.endTime.toLocaleString("it-IT", {
                hour: "2-digit",
                minute: "2-digit",
            })}`,
        ]);y
        worksheet.addRow([]); // Empty row

        // Table headers
        worksheet.addRow(["Nome e Cognome", "Email", "Classe"]);

        // Add subscriptions
        activity.subscriptions.forEach((sub) => {
            worksheet.addRow([sub.name, sub.email, sub.class]);
        });

        worksheet.columns.forEach((column) => {
            column.width = 30; // Set default column width
        });
    }

    // Scrivi il file in memoria
    const buffer = await workbook.xlsx.writeBuffer();

    // Imposta intestazioni e invia il file
    res.setHeader("Content-Disposition", "attachment; filename=Iscrizioni_Monteore.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.status(200).send(Buffer.from(buffer));
};

export default handle;
