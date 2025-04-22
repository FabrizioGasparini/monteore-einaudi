import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ message: "Id non valido" });
    if (isNaN(Number(id))) return res.status(400).json({ message: "Id non valido" });

    const session = await getSession({ req });
    if (!session) return res.status(400).json({ message: "Autenticazione richiesta!" });

    const email = session.user?.email as string;
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

    const found = await prisma.subscription.findFirst({
        where: {
            email,
            activityId: Number(id),
        },
    });

    return res.status(200).json({ activity, found: !!found });
};

export default handle;
