import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
import { closingDate } from "../activities";

const prisma = new PrismaClient();

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const today = new Date();
    if (today > closingDate) return res.status(400).json({ status: 400, message: "Tempo di iscrizione terminato." });

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

    const hours: [] = Array.from({ length: activity.duration }, (_, i) => startTime + i);

    await prisma.user.update({
        where: {
            email,
        },
        data: {
            subHours: JSON.stringify(subHours.filter((el) => !hours.includes(el))),
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
