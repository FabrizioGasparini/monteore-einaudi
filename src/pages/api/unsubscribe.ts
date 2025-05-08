import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const closingDate = new Date("2025-05-08T20:00:00Z");

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const today = new Date();

    console.log("today", today);
    console.log("closingDate", closingDate);
    if (closingDate.getTime() - today.getTime() < 0) return res.status(400).json({ status: 400, message: "Non puoi disiscriverti, le iscrizioni sono terminate" });

    const session = await getSession({ req });
    if (!session) return res.status(400).json({ status: 400, message: "Autenticazione richiesta!" });

    const email = session.user?.email as string;
    const activityId = req.body.id;
    const position = req.body.position;

    const activity = await prisma.activity.findFirst({
        where: {
            id: activityId,
        },
        select: {
            _count: {
                select: {
                    subscriptions: true,
                },
            },
            id: true,
            maxNumber: true,
            startTime: true,
            endTime: true,
            name: true,
            duration: true,
        },
    });
    if (!activity) return res.status(400).json({ status: 400, message: "Attività inesistente." });

    const maxDate = await prisma.info.findFirst({
        where: {
            tipo: "data",
        },
    });

    const maxTime = await prisma.info.findFirst({
        where: {
            tipo: "orario",
        },
    });

    if (!maxDate || !maxTime) return res.status(500).json({ status: 500, message: "Errore: maxDate o maxTime null" });

    if (today.getTime() - new Date(maxDate.valore + "T" + maxTime.valore).getTime() > 0) return res.status(400).json({ status: 400, message: "Non puoi disiscriverti, le iscrizioni sono terminate" });
    if (today.getTime() - activity.startTime.getTime() > 0) return res.status(400).json({ status: 400, message: "Non puoi disiscriverti, l'attività è già iniziata" });

    const user = await prisma.user.findFirst({
        where: {
            email,
        },
    });

    if (!user) return res.status(400).json({ status: 400, message: "Utente non trovato" });

    const subHours = JSON.parse(user?.subHours);
    const startTime = activity.startTime.getHours() + position * activity.duration;
    const endTime = activity.startTime.getHours() + (position + 1) * activity.duration;

    const hours: number[] = Array.from({ length: activity.duration }, (_, i) => startTime + i);

    await prisma.user.update({
        where: {
            email,
        },
        data: {
            subHours: JSON.stringify(subHours.filter((el: number) => !hours.includes(el))),
        },
    });

    await prisma.subscription.delete({
        where: {
            EmailActivity: {
                activityId: activity.id,
                email: email,
                position,
            },
        },
    });
    return res.status(200).json({ status: 200, message: "Iscrizione annullata!" });
};

export default handle;
