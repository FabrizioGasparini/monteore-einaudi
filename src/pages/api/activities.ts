import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const subscribedActivities = await prisma.activity.findMany({
        include: {
            _count: {
                select: {
                    subscriptions: true,
                },
            },
            subscriptions: true,
        },
        orderBy: {
            startTime: "asc",
        },
    });
    if (!subscribedActivities) return res.status(200).json([]);
    res.status(200).json(subscribedActivities);
};

export default handle;
