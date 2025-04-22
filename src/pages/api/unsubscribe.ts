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
            },
        });
        if (!activity) return res.status(400).json({ status: 400, message: "Attività inesistente." });

        if (today.getTime() - activity.startTime.getTime() > 0) return res.status(400).json({ status: 400, message: "Non puoi disiscriverti, l'attività è già iniziata" });

        await prisma.subscription.delete({
            where: {
                EmailActivity: {
                    activityId: activity.id,
                    email: email,
                },
            },
        });
        return res.status(200).json({ status: 200, message: "Iscrizione annullata!" });
    } catch (e) {
        console.log(e);
        return res.status(400).json({ status: 400, message: "Si è verificato un errore durante l'annullamento dell'iscrizione all'attività." });
    }
};

export default handle;
