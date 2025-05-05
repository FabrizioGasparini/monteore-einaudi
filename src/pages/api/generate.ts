import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
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

    const session = await getSession({ req });
    if (!session) return res.status(400).json({ message: "Autenticazione richiesta!" });

    const email = session.user?.email as string;
    const found = await prisma.adminList.findFirst({
        where: {
            email,
        },
    });
    if (!found) return res.status(403).json({ message: "Non hai i permessi per generare un file!" });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Iscrizioni Monteore";
    workbook.created = new Date();

    for (const activity of activities) {
        const maxDurata = new Date(activity.endTime).getHours() - new Date(activity.startTime).getHours();
        for (let i = 0; i < maxDurata / activity.duration; i++) {
            const inizio = new Date(activity.startTime).getHours() + i * activity.duration;
            const orario = inizio + "-" + (new Date(activity.startTime).getHours() + (i + 1) * activity.duration);

            const sheetName = activity.name.substring(0, 23) + " | " + orario;
            const worksheet = workbook.addWorksheet(sheetName);

            const startTime = new Date(activity.startTime);
            const endTime = new Date(activity.startTime);

            startTime.setHours(new Date(activity.startTime).getHours() + i * activity.duration);
            endTime.setHours(new Date(activity.startTime).getHours() + (i + 1) * activity.duration);

            worksheet.addRow([`${activity.name} - ${activity.location}`]);
            worksheet.addRow([
                `${startTime.toLocaleString("it-IT", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                })} - ${endTime.toLocaleString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}`,
            ]);

            worksheet.addRow([]);

            worksheet.addRow(["Nome e Cognome", "Email", "Classe"]);

            activity.subscriptions.forEach((sub) => {
                if (sub.position != i) return;

                worksheet.addRow([sub.name, sub.email, sub.class]);
            });

            worksheet.columns.forEach((column) => {
                column.width = 30;
            });
        }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Disposition", "attachment; filename=Iscrizioni_Monteore.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Length", buffer.byteLength);
    res.status(200).end(buffer);
};

export default handle;
