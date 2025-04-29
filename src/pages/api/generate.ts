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
        const sheetName = activity.name.substring(0, 31);
        const worksheet = workbook.addWorksheet(sheetName);

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
        ]);

        worksheet.addRow([]);

        worksheet.addRow(["Nome e Cognome", "Email", "Classe"]);

        activity.subscriptions.forEach((sub) => {
            worksheet.addRow([sub.name, sub.email, sub.class]);
        });

        worksheet.columns.forEach((column) => {
            column.width = 30;
        });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Disposition", "attachment; filename=Iscrizioni_Monteore.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.status(200).send(Buffer.from(buffer));
};

export default handle;
