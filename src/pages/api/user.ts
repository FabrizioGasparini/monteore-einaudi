import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ message: "Autenticazione richiesta!" });

    const email = session.user?.email as string;

    const user = await prisma.user.findFirst({
        where: {
            email,
        },
    });

    const found = await prisma.adminList.findFirst({
        where: {
            email,
        },
    });
    return res.status(200).json({ user, admin: !!found });
};

export default handle;
