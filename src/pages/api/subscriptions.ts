import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ message: "Autenticazione richiesta!" });

    const email = session.user?.email as string;
    const subscribedActivities = await prisma.subscription.findMany({
        where: {
            email: email,
        },
        select: {
            activity: {
                include: {
                    _count: {
                        select: {
                            subscriptions: true,
                        },
                    },
                },
            },
        },
    });
    if (!subscribedActivities) return res.status(200).json([]);

    return res.status(200).json(
        subscribedActivities.map((activity) => {
            return activity.activity;
        })
    );
};

export default handle;
