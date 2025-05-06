import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const password = req.body.password as string;

    const pwd = await prisma.info.findFirst({
        where: {
            tipo: "pwd",
        },
    });
    if (!pwd) return res.status(400).json({ message: "Password non valida", admin: false });

    if (pwd.valore !== password) return res.status(400).json({ message: "Password non valida", admin: false });

    return res.status(200).json({ admin: true });
};

export default handle;
