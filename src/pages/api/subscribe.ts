import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const today = new Date();

    const session = await getSession({ req });
    if (!session) return res.status(400).json({ status: 400, message: "Autenticazione richiesta!" });

    const email = session.user?.email as string;
    const activityId = req.body.id;
    const classe = req.body.class;
    const position = req.body.position;

    const activity = await prisma.activity.findFirst({
        where: {
            id: activityId,
        },
        select: {
            subscriptions: true,
            maxNumber: true,
            startTime: true,
            endTime: true,
            name: true,
            duration: true,
        },
    });
    if (!activity) return res.status(400).json({ status: 400, message: "Attività inesistente." });

    let count = 0;
    for (let i = 0; i < activity.subscriptions.length; i++) {
        const subscription = activity.subscriptions[i];
        if (subscription.position == position) count += 1;
    }

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

    if (today.getTime() - new Date(maxDate.valore + "T" + maxTime.valore).getTime() > 0) return res.status(400).json({ status: 400, message: "Non puoi iscriverti, le iscrizioni sono terminate" });
    if (today.getTime() - activity.startTime.getTime() > 0) return res.status(400).json({ status: 400, message: "Non puoi iscriverti, l'attività è già iniziata" });
    if (count >= activity.maxNumber) return res.status(400).json({ status: 400, message: "Numero massimo partecipanti raggiunta" });

    const alreadySubscribed = await prisma.subscription.findFirst({
        where: {
            OR: [
                {
                    email,
                    activity: {
                        startTime: {
                            lt: activity.endTime,
                        },
                        endTime: {
                            gt: activity.startTime,
                        },
                    },
                    activityId,
                    position,
                },
            ],
        },
        select: {
            activity: true,
        },
    });
    if (!!alreadySubscribed) return res.status(400).json({ status: 400, message: "Sei già iscritto ad una attività durante questa fascia oraria!" });

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

    let found = false;
    hours.forEach((hour) => {
        if (subHours.includes(hour)) found = true;
    });

    if (found) return res.status(400).json({ status: 400, message: "Sei già iscritto ad una attività durante questa fascia oraria!" });

    await prisma.user.update({
        where: {
            email,
        },
        data: {
            subHours: JSON.stringify([...hours, ...subHours]),
        },
    });

    if (Number(user.class[0]) == 1 && startTime == 8) return res.status(400).json({ status: 400, message: "Le prime non possono iscriversi a questa attività in QUESTO ORARIO!" });

    const excludedClasses = await prisma.excludedClasses.findFirst({
        where: {
            classe,
        },
    });
    if (excludedClasses) return res.status(400).json({ status: 400, message: "La tua classe non può iscriversi a questa attività!" });

    await prisma.subscription.create({
        data: {
            email,
            name: session.user?.name as string,
            activity: {
                connect: {
                    id: activityId,
                },
            },
            class: classe,
            position,
            date: new Date().toString(),
        },
        select: {
            activity: true,
        },
    });
    return res.status(200).json({ status: 200, message: "Iscrizione registrata correttamente!" });
};

export default handle;
