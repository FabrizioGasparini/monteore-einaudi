import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "DELETE") return res.status(400).json({ message: "Metodo non valido" });

    const { id } = req.body;
    if (isNaN(Number(id))) return res.status(400).json({ message: "Id non valido" });

    const session = await getSession({ req });
    if (!session) return res.status(400).json({ message: "Autenticazione richiesta!" });

    const activity = await prisma.activity.findFirst({
        where: {
            id: Number(id),
        },
    });
    if (!activity) return res.status(400).json({ message: "Id non valido" });

    await prisma.subscription.deleteMany({
        where: {
            activityId: Number(id),
        },
    });

    await prisma.activity.delete({
        where: {
            id: Number(id),
        },
    });

    return res.status(200).json({ message: "Attività eliminata con successo!", activity });
};

export default handle;
