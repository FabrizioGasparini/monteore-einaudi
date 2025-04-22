import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import HTMLtoDOCX from "html-to-docx";

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
    if (!activities) return res.status(200).json([]);

    const activitiesHTML = await Promise.all(
        activities.map(
            async (activity) =>
                `<h1>${activity.name} in ${activity.location}</h1><h6>${activity.startTime.toLocaleString("it-IT", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                })} - ${activity.endTime.toLocaleString("it-IT", {
                    hour: "numeric",
                    minute: "2-digit",
                })}</h6><table style="width: 100%;"><tr><th>Nome e Cognome</th></tr>${await Promise.all(activity.subscriptions.map(async (subscription) => `<tr><td>${subscription.name}</td></tr>`))}</table>`
        )
    );

    const file = await HTMLtoDOCX(activitiesHTML.join('<div class="page-break" style="page-break-after: always;"></div>'), "", { title: "Iscrizioni monteore" }, "");
    res.setHeader("Content-disposition", "attachment; filename=Iscrizioni Monteore.docx");
    res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    res.status(200).send(file);
};

export default handle;
