import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "PUT") return res.status(400).json({ message: "Metodo non valido" });

    const { id, name, aula, desc, date, startTime, endTime, maxNumber } = req.body;

    if (!id) return res.status(400).json({ message: "Id non valido" });
    if (isNaN(Number(id))) return res.status(400).json({ message: "Id non valido" });

    const session = await getSession({ req });
    if (!session) return res.status(400).json({ message: "Autenticazione richiesta!" });

    const email = session.user?.email as string;
    let found = await prisma.adminList.findFirst({
        where: {
            email,
        },
    });
    if (!found) return res.status(403).json({ message: "Non hai i permessi per modificare un'attività!" });
    const activity = await prisma.activity.findFirst({
        where: {
            id: Number(id),
        },
        include: {
            _count: {
                select: {
                    subscriptions: true,
                },
            },
        },
        orderBy: {
            startTime: "asc",
        },
    });
    if (!activity) return res.status(400).json({ message: "Id non valido" });

    found = await prisma.subscription.findFirst({
        where: {
            email,
            activityId: Number(id),
        },
    });

    if (!name || !aula || !desc || !date || !startTime || !endTime || !maxNumber) return res.status(400).json({ message: "Dati non validi" });

    const startDate = new Date(date);
    const endDate = new Date(date);
    startDate.setHours(Number(startTime.split(":")[0]), Number(startTime.split(":")[1]), 0, 0);
    endDate.setHours(Number(endTime.split(":")[0]), Number(endTime.split(":")[1]), 0, 0);
    if (startDate.getTime() > endDate.getTime()) return res.status(400).json({ message: "L'orario di inizio deve essere prima dell'orario di fine" });
    if (startDate.getTime() < new Date().getTime()) return res.status(400).json({ message: "L'orario di inizio deve essere dopo l'orario attuale" });

    if (!Number.isInteger(maxNumber) || maxNumber <= 0) return res.status(400).json({ message: "Il numero massimo deve essere un numero intero positivo" });

    await prisma.activity.update({
        where: { id: Number(id) },
        data: { name, location: aula, description: desc, startTime: new Date(startDate), endTime: new Date(endDate), maxNumber },
    });

    return res.status(200).json({ message: "Attività aggiornata con successo!", activity, found: !!found });
};

export default handle;
