import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
import { closingDate } from "../activities";

const prisma = new PrismaClient();

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const today = new Date();
        if (today > closingDate) return res.status(400).json({ status: 400, message: "Tempo di iscrizione terminato." });

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
            },
        });
        if (!activity) return res.status(400).json({ status: 400, message: "Attività inesistente." });

        let count = 0;
        for (let i = 0; i < activity.subscriptions.length; i++) {
            const subscription = activity.subscriptions[i];
            if (subscription.position == position) count += 1;
        }

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

        const excludedClasses = await prisma.excludedClasses.find({
            where: {
                classe,
            },
        });
        console.log(excludedClasses);
        if (excludedClasses) return res.status(400).json({ status: 400, message: "Non puoi iscriverti a questa attività!" });

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
            },
            select: {
                activity: true,
            },
        });
        return res.status(200).json({ status: 200, message: "Iscrizione registrata correttamente!" });
    } catch (e) {
        return res.status(400).json({ status: 400, message: "Si è verificato un errore durante l'iscrizione all'attività.", error: e });
    }
};

export default handle;
